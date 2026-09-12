/**
 * Ghost Guardian: Supabase workspace persistence.
 *
 * Same interface as browserWorkspaceRepository (save, load, clear) plus a
 * synchronous loadCached() for first paint. Every row is written with the
 * signed-in creator's id and Row Level Security (see supabase/migrations)
 * guarantees a creator can only ever read or delete their own rows.
 *
 * Tables: creators, voice_profiles, guardian_policies, comments,
 * comment_states, learning_examples, knowledge_base, activity_log, videos
 */

import { getSupabaseClient } from '../../app/supabaseClient.js';

const CACHE_PREFIX = 'ghost-guardian-workspace';
const WORKSPACE_TABLES = [
  'creators',
  'voice_profiles',
  'comments',
  'comment_states',
  'learning_examples',
  'knowledge_base',
  'guardian_policies',
  'activity_log',
  'videos',
];

function cacheKey(userId) {
  return `${CACHE_PREFIX}:${userId || 'anonymous'}`;
}

function readCache(userId) {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to read workspace cache:', err);
    return null;
  }
}

function writeCache(userId, data) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(cacheKey(userId), JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to write workspace cache:', err);
  }
}

function clearCache(userId) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(cacheKey(userId));
  } catch (err) {
    console.warn('Failed to clear workspace cache:', err);
  }
}

function rowsOf(settled) {
  if (settled.status !== 'fulfilled') return [];
  const value = settled.value || {};
  if (value.error) return [];
  return Array.isArray(value.data) ? value.data : [];
}

export function createSupabaseWorkspaceRepository(options = {}) {
  const getUserId = typeof options.getUserId === 'function' ? options.getUserId : () => null;
  const onError = typeof options.onError === 'function' ? options.onError : () => {};
  let client = options.client || null;

  const resolveClient = () => {
    if (client) return client;
    client = getSupabaseClient();
    return client;
  };

  const ownedBy = (userId) => (row) => {
    if (!row || typeof row !== 'object') return false;
    const owner = row.creator_id ?? row.user_id ?? null;
    if (owner === null || owner === undefined) return true;
    return String(owner) === String(userId);
  };

  return {
    /** Synchronous snapshot for first paint. Remote data replaces it once loaded. */
    loadCached() {
      return readCache(getUserId());
    },

    /**
     * Saves the full workspace across the workspace tables, scoped to the creator.
     */
    async save(state) {
      if (!state) return;
      const userId = getUserId() || state.creator?.id || null;
      writeCache(userId, state);

      const db = resolveClient();
      if (!db) return;

      const creatorId = userId || 'default-creator';
      const now = new Date().toISOString();
      const failures = [];
      const run = async (table, promise) => {
        try {
          const result = await promise;
          if (result && result.error) failures.push({ table, error: result.error });
        } catch (error) {
          failures.push({ table, error });
        }
      };

      const creatorEmail = state.creator?.email || null;

      // 1. creators
      await run(
        'creators',
        db.from('creators').upsert({
          id: creatorId,
          user_id: userId || null,
          email: creatorEmail,
          display_name: state.creator?.displayName || '',
          handle: state.creator?.handle || '',
          channel_name: state.creator?.channelName || '',
          data: state.creator || {},
          updated_at: now,
        })
      );

      // 2. voice_profiles
      await run(
        'voice_profiles',
        db.from('voice_profiles').upsert({
          id: creatorId,
          creator_id: creatorId,
          warmth: state.voice?.warmth ?? null,
          directness: state.voice?.directness ?? null,
          formality: state.voice?.formality ?? null,
          humor: state.voice?.humor ?? null,
          data: state.voice || {},
          updated_at: now,
        })
      );

      // 3. guardian_policies
      await run(
        'guardian_policies',
        db.from('guardian_policies').upsert({
          id: creatorId,
          creator_id: creatorId,
          mode: state.policy?.mode || state.settings?.mode || 'copilot',
          data: state.policy || {},
          updated_at: now,
        })
      );

      // 4. comments
      if (Array.isArray(state.comments) && state.comments.length > 0) {
        const records = state.comments.map((c) => ({
          id: c.id,
          creator_id: creatorId,
          video_id: c.videoId || null,
          author: c.author || '',
          author_handle: c.authorHandle || '',
          text: c.text || '',
          classification: c.classification || 'UNKNOWN',
          risk: c.risk || 'low',
          recommended_action: c.recommendedAction || 'draft',
          data: c,
          updated_at: now,
        }));
        await run('comments', db.from('comments').upsert(records));
      }

      // 5. comment_states
      if (state.commentStates && Object.keys(state.commentStates).length > 0) {
        const records = Object.entries(state.commentStates).map(([commentId, s]) => ({
          id: `${creatorId}:${commentId}`,
          comment_id: commentId,
          creator_id: creatorId,
          status: s?.status || 'pending',
          active_tone: s?.activeTone || 'warm',
          response_text: s?.responseText || '',
          was_edited: Boolean(s?.wasEdited),
          data: s || {},
          updated_at: now,
        }));
        await run('comment_states', db.from('comment_states').upsert(records));
      }

      // 6. learning_examples
      if (Array.isArray(state.learning) && state.learning.length > 0) {
        const records = state.learning.map((l, index) => ({
          id: l.id || `example-${creatorId}-${index}`,
          creator_id: creatorId,
          before_text: l.before || '',
          after_text: l.after || '',
          data: l,
          created_at: l.createdAt || now,
        }));
        await run('learning_examples', db.from('learning_examples').upsert(records));
      }

      // 7. knowledge_base
      if (Array.isArray(state.knowledge) && state.knowledge.length > 0) {
        const records = state.knowledge.map((k, index) => ({
          id: k.id || `kb-${creatorId}-${index}`,
          creator_id: creatorId,
          topic: k.topic || '',
          content: k.content || '',
          data: k,
          updated_at: now,
        }));
        await run('knowledge_base', db.from('knowledge_base').upsert(records));
      }

      // 8. activity_log
      if (Array.isArray(state.activity) && state.activity.length > 0) {
        const records = state.activity.map((a, index) => ({
          id: a.id || `act-${creatorId}-${index}`,
          creator_id: creatorId,
          label: a.label || '',
          detail: a.detail || '',
          timestamp: a.timestamp || now,
          data: a,
        }));
        await run('activity_log', db.from('activity_log').upsert(records));
      }

      // 9. videos
      if (Array.isArray(state.videos) && state.videos.length > 0) {
        const records = state.videos.map((v) => ({
          id: v.id,
          creator_id: creatorId,
          title: v.title || '',
          url: v.url || '',
          published_at: v.publishedAt || null,
          data: v,
          updated_at: now,
        }));
        await run('videos', db.from('videos').upsert(records));
      }

      if (failures.length > 0) {
        onError(failures[0].error, failures);
      }
    },

    /**
     * Loads the creator's workspace from Supabase, falling back to the local cache.
     */
    async load() {
      const userId = getUserId();
      const cached = readCache(userId);
      const db = resolveClient();
      if (!db || !userId) return cached;

      try {
        const settled = await Promise.allSettled(
          WORKSPACE_TABLES.map((table) => db.from(table).select('*'))
        );
        const byTable = Object.fromEntries(
          WORKSPACE_TABLES.map((table, index) => [table, rowsOf(settled[index]).filter(ownedBy(userId))])
        );

        const creatorRow =
          byTable.creators.find((r) => String(r.user_id || r.id) === String(userId)) || byTable.creators[0] || null;
        const voiceRow = byTable.voice_profiles[0] || null;
        const policyRow = byTable.guardian_policies[0] || null;

        const commentStates = {};
        byTable.comment_states.forEach((r) => {
          const key = r.comment_id || r.id;
          commentStates[key] = r.data || {
            status: r.status,
            activeTone: r.active_tone,
            responseText: r.response_text,
            wasEdited: r.was_edited,
          };
        });

        const remoteState = {
          ...(cached || {}),
          ...(creatorRow ? { creator: { ...(creatorRow.data || {}), id: userId, email: creatorRow.email || creatorRow.data?.email || null } } : {}),
          ...(voiceRow ? { voice: voiceRow.data || voiceRow } : {}),
          ...(policyRow ? { policy: policyRow.data || policyRow } : {}),
          ...(byTable.comments.length > 0 ? { comments: byTable.comments.map((r) => r.data || r) } : {}),
          ...(Object.keys(commentStates).length > 0 ? { commentStates } : {}),
          ...(byTable.learning_examples.length > 0 ? { learning: byTable.learning_examples.map((r) => r.data || r) } : {}),
          ...(byTable.knowledge_base.length > 0 ? { knowledge: byTable.knowledge_base.map((r) => r.data || r) } : {}),
          ...(byTable.activity_log.length > 0 ? { activity: byTable.activity_log.map((r) => r.data || r) } : {}),
          ...(byTable.videos.length > 0 ? { videos: byTable.videos.map((r) => r.data || r) } : {}),
        };

        if (Object.keys(remoteState).length > 0) {
          writeCache(userId, remoteState);
          return remoteState;
        }
        return cached;
      } catch (err) {
        onError(err);
        return cached;
      }
    },

    /**
     * Deletes the creator's rows (Row Level Security restricts the delete to
     * the signed-in creator) and clears the local cache.
     */
    async clear() {
      const userId = getUserId();
      clearCache(userId);
      const db = resolveClient();
      if (!db) return;

      try {
        await Promise.allSettled(
          WORKSPACE_TABLES.map((table) => db.from(table).delete().neq('id', '___ghost_guardian_all___'))
        );
      } catch (err) {
        onError(err);
      }
    },
  };
}
