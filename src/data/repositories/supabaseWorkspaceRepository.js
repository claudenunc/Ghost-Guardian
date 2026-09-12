/**
 * Ghost Guardian — Supabase Workspace Persistence Repository
 * Implements the exact same interface as browserWorkspaceRepository.js (save, load, clear),
 * writing and reading across the standard Ghost Guardian relational Supabase tables:
 * - creators
 * - voice_profiles
 * - comments
 * - comment_states
 * - learning_examples
 * - knowledge_base
 * - guardian_policies
 * - activity_log
 * - videos
 */

import { createClient } from '@supabase/supabase-js';

const CACHE_KEY = 'ghost-guardian-supabase-workspace';

function getEnvironmentVariables() {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  return {
    url: metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || '',
    anonKey: metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY || '',
  };
}

function getLocalCache() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch (err) {
    console.warn('Failed to read local cache:', err);
  }
  return null;
}

function setLocalCache(data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.warn('Failed to update local cache:', err);
  }
}

function clearLocalCache() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (err) {
    console.warn('Failed to clear local cache:', err);
  }
}

export function createSupabaseWorkspaceRepository(options = {}) {
  const env = getEnvironmentVariables();
  const url = options.url || env.url;
  const anonKey = options.anonKey || env.anonKey;

  let client = options.client || null;
  if (!client && url && anonKey) {
    try {
      client = createClient(url, anonKey, {
        auth: { persistSession: false },
      });
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
    }
  }

  return {
    /**
     * Saves full workspace state across the 9 Supabase tables.
     * Also updates the local cache for instantaneous hydration.
     */
    async save(state) {
      if (!state) return;
      setLocalCache(state);

      if (!client) return;

      const creatorId = state.creator?.id || 'default-creator';
      const now = new Date().toISOString();

      try {
        // 1. creators
        if (state.creator) {
          await client.from('creators').upsert({
            id: creatorId,
            display_name: state.creator.displayName || '',
            handle: state.creator.handle || '',
            channel_name: state.creator.channelName || '',
            data: state.creator,
            updated_at: now,
          });
        }

        // 2. voice_profiles
        if (state.voice) {
          await client.from('voice_profiles').upsert({
            id: creatorId,
            creator_id: creatorId,
            warmth: state.voice.warmth,
            directness: state.voice.directness,
            formality: state.voice.formality,
            humor: state.voice.humor,
            data: state.voice,
            updated_at: now,
          });
        }

        // 3. guardian_policies
        if (state.policy) {
          await client.from('guardian_policies').upsert({
            id: creatorId,
            creator_id: creatorId,
            mode: state.policy.mode || 'copilot',
            data: state.policy,
            updated_at: now,
          });
        }

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
          await client.from('comments').upsert(records);
        }

        // 5. comment_states
        if (state.commentStates && Object.keys(state.commentStates).length > 0) {
          const records = Object.entries(state.commentStates).map(([commentId, s]) => ({
            id: commentId,
            comment_id: commentId,
            creator_id: creatorId,
            status: s.status || 'pending',
            active_tone: s.activeTone || 'warm',
            response_text: s.responseText || '',
            was_edited: Boolean(s.wasEdited),
            data: s,
            updated_at: now,
          }));
          await client.from('comment_states').upsert(records);
        }

        // 6. learning_examples
        if (Array.isArray(state.learning) && state.learning.length > 0) {
          const records = state.learning.map((l) => ({
            id: l.id || `example-${Date.now()}`,
            creator_id: creatorId,
            before_text: l.before || '',
            after_text: l.after || '',
            data: l,
            created_at: l.createdAt || now,
          }));
          await client.from('learning_examples').upsert(records);
        }

        // 7. knowledge_base
        if (Array.isArray(state.knowledge) && state.knowledge.length > 0) {
          const records = state.knowledge.map((k) => ({
            id: k.id || `kb-${Date.now()}`,
            creator_id: creatorId,
            topic: k.topic || '',
            content: k.content || '',
            data: k,
            updated_at: now,
          }));
          await client.from('knowledge_base').upsert(records);
        }

        // 8. activity_log
        if (Array.isArray(state.activity) && state.activity.length > 0) {
          const records = state.activity.map((a) => ({
            id: a.id || `act-${Date.now()}`,
            creator_id: creatorId,
            label: a.label || '',
            detail: a.detail || '',
            timestamp: a.timestamp || now,
            data: a,
          }));
          await client.from('activity_log').upsert(records);
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
          await client.from('videos').upsert(records);
        }
      } catch (err) {
        console.warn('Failed to save state to Supabase:', err);
      }
    },

    /**
     * Loads workspace state from Supabase or cached storage.
     * Returns an object that can be synchronously read (for useReducer initialization)
     * and also awaited as a Promise.
     */
    load() {
      const cached = getLocalCache();

      const fetchRemote = async () => {
        if (!client) return cached;

        try {
          const [
            creatorsRes,
            voiceRes,
            policyRes,
            commentsRes,
            statesRes,
            learningRes,
            knowledgeRes,
            activityRes,
            videosRes,
          ] = await Promise.allSettled([
            client.from('creators').select('*').limit(1),
            client.from('voice_profiles').select('*').limit(1),
            client.from('guardian_policies').select('*').limit(1),
            client.from('comments').select('*'),
            client.from('comment_states').select('*'),
            client.from('learning_examples').select('*'),
            client.from('knowledge_base').select('*'),
            client.from('activity_log').select('*'),
            client.from('videos').select('*'),
          ]);

          const creatorRow = creatorsRes.status === 'fulfilled' ? creatorsRes.value.data?.[0] : null;
          const voiceRow = voiceRes.status === 'fulfilled' ? voiceRes.value.data?.[0] : null;
          const policyRow = policyRes.status === 'fulfilled' ? policyRes.value.data?.[0] : null;
          const commentsRows = commentsRes.status === 'fulfilled' ? commentsRes.value.data || [] : [];
          const statesRows = statesRes.status === 'fulfilled' ? statesRes.value.data || [] : [];
          const learningRows = learningRes.status === 'fulfilled' ? learningRes.value.data || [] : [];
          const knowledgeRows = knowledgeRes.status === 'fulfilled' ? knowledgeRes.value.data || [] : [];
          const activityRows = activityRes.status === 'fulfilled' ? activityRes.value.data || [] : [];
          const videosRows = videosRes.status === 'fulfilled' ? videosRes.value.data || [] : [];

          // Map back to standard application state
          const commentStates = {};
          statesRows.forEach((r) => {
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
            ...(creatorRow ? { creator: creatorRow.data || creatorRow } : {}),
            ...(voiceRow ? { voice: voiceRow.data || voiceRow } : {}),
            ...(policyRow ? { policy: policyRow.data || policyRow } : {}),
            ...(commentsRows.length > 0 ? { comments: commentsRows.map((r) => r.data || r) } : {}),
            ...(Object.keys(commentStates).length > 0 ? { commentStates } : {}),
            ...(learningRows.length > 0 ? { learning: learningRows.map((r) => r.data || r) } : {}),
            ...(knowledgeRows.length > 0 ? { knowledge: knowledgeRows.map((r) => r.data || r) } : {}),
            ...(activityRows.length > 0 ? { activity: activityRows.map((r) => r.data || r) } : {}),
            ...(videosRows.length > 0 ? { videos: videosRows.map((r) => r.data || r) } : {}),
          };

          if (Object.keys(remoteState).length > 0) {
            setLocalCache(remoteState);
            return remoteState;
          }

          return cached;
        } catch (err) {
          console.warn('Failed to load state from Supabase:', err);
          return cached;
        }
      };

      const loadPromise = fetchRemote();
      // Attach cached properties so synchronous callers (like useReducer initializers) have immediate access
      if (cached && typeof cached === 'object') {
        Object.assign(loadPromise, cached);
      }
      return loadPromise;
    },

    /**
     * Clears Supabase tables and local storage cache.
     */
    async clear() {
      clearLocalCache();
      if (!client) return;

      const tables = [
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

      try {
        await Promise.allSettled(
          tables.map((table) => client.from(table).delete().neq('id', '___ghost_guardian_all___'))
        );
      } catch (err) {
        console.warn('Failed to clear Supabase workspace:', err);
      }
    },
  };
}
