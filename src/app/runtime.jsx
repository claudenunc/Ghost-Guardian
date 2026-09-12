import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createDevelopmentAuthAdapter, createSupabaseAuthAdapter } from './authService';
import { runtimeConfig } from './config';
import { createBrowserWorkspaceRepository } from '../data/repositories/browserWorkspaceRepository';
import { createSupabaseWorkspaceRepository } from '../data/repositories/supabaseWorkspaceRepository';
import { createDemoRepositories, createUnavailableProductionRepositories } from '../data/repositories/demoRepositories';
import { createDemoWorkspace } from '../fixtures/demoWorkspace';
import { createWorkspaceExportPayload } from '../domain/settings/workspaceContracts';
import { createDemoGuardianProvider, createProductionGuardianProvider } from '../domain/guardian';
import { createDemoPlatformAdapter, createProductionPlatformAdapter } from '../domain/platform/platformAdapter';
import { publishYouTubeReply } from '../lib/youtubeConnect';

const ApplicationContext = createContext(null);

/**
 * Creates a properly shaped empty workspace for production mode.
 * All keys must exist so components don't crash on undefined access.
 */
function createEmptyProductionWorkspace() {
  return {
    creator: {},
    videos: [],
    comments: [],
    commenters: [],
    commentStates: {},
    voice: { warmth: 75, directness: 65, humor: 40, formality: 40 },
    settings: { mode: 'balanced', paused: false },
    policy: {},
    knowledge: [],
    learning: [],
    activity: [],
    contentOpportunities: [],
    communityHealth: {},
    weeklyDigest: {},
    sentimentTrend: [],
    questionClusters: [],
    topics: [],
  };
}

function createServices(mode) {
  const isDemo = mode === 'demo';
  const isProduction = mode === 'production';
  const auth = isDemo ? createDevelopmentAuthAdapter() : createSupabaseAuthAdapter();
  return {
    mode,
    auth,
    repositories: isDemo
      ? createDemoRepositories({ ...createDemoWorkspace() })
      : createUnavailableProductionRepositories(),
    persistence: isProduction
      ? createSupabaseWorkspaceRepository({ getUserId: () => auth.getCurrentUser()?.id ?? null })
      : createBrowserWorkspaceRepository(),
    guardian: isDemo ? createDemoGuardianProvider() : createProductionGuardianProvider(),
    platform: isDemo ? createDemoPlatformAdapter() : createProductionPlatformAdapter(),
  };
}

function createInitialState(services) {
  const fixture = services.mode === 'demo'
    ? services.repositories.workspace.create()
    : createEmptyProductionWorkspace();
  // Synchronous first paint: the Supabase repo exposes loadCached(); the
  // browser repo's load() is already synchronous. Never await here.
  const saved = typeof services.persistence.loadCached === 'function'
    ? services.persistence.loadCached()
    : services.persistence.load();
  const workspace = saved && typeof saved.then !== 'function'
    ? { ...fixture, ...saved, commentStates: { ...fixture.commentStates, ...saved.commentStates } }
    : fixture;
  return { ...workspace, session: services.auth.getSession(), toast: null };
}

function updateCommentState(state, commentId, updates) {
  return {
    ...state,
    commentStates: { ...state.commentStates, [commentId]: { ...state.commentStates[commentId], ...updates } },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_VOICE':
      return { ...state, voice: { ...state.voice, ...action.payload } };
    case 'UPDATE_CREATOR':
      return {
        ...state,
        creator: { ...state.creator, ...action.payload, updatedAt: new Date().toISOString() },
      };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        creator: { ...state.creator, ...action.payload.creator, isFixture: false },
        voice: { ...state.voice, ...action.payload.voice },
        settings: { ...state.settings, mode: action.payload.mode },
      };
    case 'ADD_KNOWLEDGE': {
      const item = { ...action.payload, id: `knowledge-${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, knowledge: [item, ...(state.knowledge || [])] };
    }
    case 'REMOVE_KNOWLEDGE':
      return { ...state, knowledge: (state.knowledge || []).filter((item) => item.id !== action.payload) };
    case 'SET_COMMENT_STATUS': {
      const { commentId, status, label, detail = '', platformAction = 'none' } = action.payload;
      const activity = {
        id: `activity-${Date.now()}`,
        timestamp: new Date().toISOString(),
        commentId,
        label: label || `Comment marked as ${status}`,
        detail,
        finalAction: status,
        platformAction,
      };
      const updated = updateCommentState(state, commentId, { status, updatedAt: activity.timestamp });
      return { ...updated, activity: [activity, ...(state.activity || [])].slice(0, 200) };
    }
    case 'USE_TONE': {
      const comment = (state.comments || []).find((item) => item.id === action.payload.commentId);
      return updateCommentState(state, action.payload.commentId, {
        activeTone: action.payload.tone,
        responseText: comment?.drafts?.[action.payload.tone] || '',
        wasEdited: false,
      });
    }
    case 'SET_RESPONSE_TEXT':
      return updateCommentState(state, action.payload.commentId, { responseText: action.payload.text, wasEdited: true });
    case 'REGENERATE': {
      const comment = (state.comments || []).find((item) => item.id === action.payload);
      const current = state.commentStates[action.payload] || {};
      const tones = ['calm', 'direct', 'warm', 'humorous'].filter((tone) => comment?.drafts?.[tone]);
      const nextTone = tones[(tones.indexOf(current.activeTone) + 1) % tones.length] || 'warm';
      return updateCommentState(state, action.payload, {
        activeTone: nextTone,
        responseText: comment?.drafts?.[nextTone] || current.responseText,
        regenerations: (current.regenerations || 0) + 1,
        wasEdited: false,
        updatedAt: new Date().toISOString(),
      });
    }
    case 'SAVE_AS_EXAMPLE': {
      const comment = (state.comments || []).find((item) => item.id === action.payload);
      const current = state.commentStates[action.payload] || {};
      const example = {
        id: `example-${Date.now()}`,
        before: comment?.drafts?.calm || comment?.drafts?.warm || '',
        after: current.responseText || '',
        createdAt: new Date().toISOString(),
      };
      const updated = updateCommentState(state, action.payload, { savedAsExample: true });
      return { ...updated, learning: [example, ...(state.learning || [])] };
    }
    case 'ADD_LEARNING_EXAMPLE': {
      const example = {
        ...action.payload,
        id: action.payload.id || `example-${Date.now()}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      return { ...state, learning: [example, ...(state.learning || [])] };
    }
    case 'UPDATE_OPPORTUNITY_STATUS': {
      const { id, status } = action.payload;
      const updatedOpportunities = (state.contentOpportunities || []).map((op) =>
        op.id === id ? { ...op, status, updatedAt: new Date().toISOString() } : op
      );
      return { ...state, contentOpportunities: updatedOpportunities };
    }
    case 'UPDATE_POLICY': {
      const { updates, reason } = action.payload;
      const currentPolicy = state.policy || {};
      const newHistory = reason
        ? [{ timestamp: new Date().toISOString(), summary: reason }, ...(currentPolicy.history || [])]
        : (currentPolicy.history || []);
      const updatedPolicy = {
        ...currentPolicy,
        ...updates,
        updatedAt: new Date().toISOString(),
        history: newHistory,
      };
      return { ...state, policy: updatedPolicy };
    }
    case 'APPLY_POLICY_PRESET': {
      const preset = action.payload;
      const currentPolicy = state.policy || {};
      const newHistory = [
        { timestamp: new Date().toISOString(), summary: `Applied ${preset.name || 'custom'} policy preset.` },
        ...(currentPolicy.history || []),
      ];
      const updatedPolicy = {
        ...currentPolicy,
        ...preset.settings,
        updatedAt: new Date().toISOString(),
        history: newHistory,
      };
      return { ...state, policy: updatedPolicy };
    }
    case 'RESET_WORKSPACE':
      // Merge remote/partial data over a complete empty shape so components
      // never hit undefined keys after a Supabase hydration.
      return {
        ...createEmptyProductionWorkspace(),
        ...action.payload,
        session: state.session,
        toast: null,
      };
    case 'IMPORT_WORKSPACE':
      return { ...state, ...action.payload, toast: { message: 'Workspace restored from backup.', type: 'success' } };
    case 'INGEST_YOUTUBE_COMMENTS': {
      const { comments: newComments, video } = action.payload;
      const existingIds = new Set((state.comments || []).map((c) => c.id));
      const freshComments = (newComments || []).filter((c) => !existingIds.has(c.id));

      const newStates = { ...(state.commentStates || {}) };
      const existingCommenters = [...(state.commenters || [])];
      const commenterMap = new Map(existingCommenters.map((m) => [m.id, { ...m }]));

      freshComments.forEach((c) => {
        newStates[c.id] = {
          status: c.recommendedAction === 'silence' || c.recommendedAction === 'hide' ? 'silenced' : 'pending',
          activeTone: 'warm',
          responseText: c.drafts?.warm || c.drafts?.calm || '',
          wasEdited: false,
          savedAsExample: false,
          regenerations: 0,
        };

        const commenterId = c.commenterId || c.authorHandle || c.author || 'unknown-commenter';
        c.commenterId = commenterId;

        if (!commenterMap.has(commenterId)) {
          const handle = c.authorHandle || (c.author ? `@${c.author.toLowerCase().replace(/[^a-z0-9]+/g, '')}` : '@viewer');
          const isHuman = Boolean(c.signals?.humanMoment || c.classification === 'SENSITIVE');
          commenterMap.set(commenterId, {
            id: commenterId,
            handle,
            displayName: c.author || 'YouTube Viewer',
            avatar: c.authorAvatar || null,
            totalComments: 1,
            episodesParticipated: 1,
            sentimentRatio: c.sentiment === 'positive' ? 1 : 0.5,
            tags: isHuman ? ['Human disclosure'] : ['Community member'],
            firstSeenAt: c.createdAt || new Date().toISOString(),
            lastSeenAt: c.createdAt || new Date().toISOString(),
            note: 'Discovered from imported YouTube comments.',
          });
        } else {
          const existing = commenterMap.get(commenterId);
          existing.totalComments = (existing.totalComments || 1) + 1;
        }
      });

      const updatedVideos = video && !(state.videos || []).some((v) => v.id === video.id)
        ? [video, ...(state.videos || [])]
        : (state.videos || []);

      return {
        ...state,
        comments: [...freshComments, ...(state.comments || [])],
        commentStates: newStates,
        commenters: Array.from(commenterMap.values()),
        videos: updatedVideos,
      };
    }
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

function persistableState(state) {
  const { session, toast, ...workspace } = state;
  return workspace;
}

export function ApplicationProvider({ children }) {
  const services = useRef(createServices(runtimeConfig.mode)).current;
  const [state, dispatch] = useReducer(reducer, services, createInitialState);

  const authedUserId = state.session?.user?.id || null;

  // Persist on change. In production, wait until a creator is signed in so we
  // never write orphaned rows that Row Level Security would reject.
  useEffect(() => {
    if (services.mode === 'production' && !authedUserId) return;
    services.persistence.save(persistableState(state));
  }, [services, state, authedUserId]);

  // Hydrate from Supabase once the creator's session is restored. Keyed on the
  // user id so it runs after auth resolves, not on the empty first mount.
  useEffect(() => {
    if (services.mode !== 'production' || !authedUserId) return;
    let cancelled = false;
    Promise.resolve(services.persistence.load()).then((remoteData) => {
      if (!cancelled && remoteData && typeof remoteData === 'object' && Object.keys(remoteData).length > 0) {
        dispatch({ type: 'RESET_WORKSPACE', payload: remoteData });
      }
    }).catch((err) => console.warn('Supabase remote load failed:', err));
    return () => {
      cancelled = true;
    };
  }, [services, authedUserId]);

  // Supabase auth state listener — keeps session in sync with Supabase
  useEffect(() => {
    if (services.auth.kind === 'supabase' && services.auth.onAuthStateChange) {
      const subscription = services.auth.onAuthStateChange((_event, session) => {
        dispatch({
          type: 'SET_SESSION',
          payload: session
            ? { user: session.user, token: session.access_token, environment: 'production' }
            : null,
        });
      });
      return () => subscription.unsubscribe();
    }
  }, [services]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type, id: Date.now() } });
  }, []);

  const stateFor = useCallback((commentId) => state.commentStates[commentId] || {
    status: 'pending', activeTone: 'warm', responseText: '', wasEdited: false, savedAsExample: false, regenerations: 0,
  }, [state.commentStates]);

  const startDemo = useCallback(() => {
    if (services.mode !== 'demo') {
      console.warn('startDemo is not available in production mode.');
      return null;
    }
    const session = services.auth.signIn();
    dispatch({ type: 'SET_SESSION', payload: session });
    return session;
  }, [services]);

  const signIn = useCallback(async (credentials) => {
    const session = await services.auth.signIn(credentials);
    dispatch({ type: 'SET_SESSION', payload: session });
    return session;
  }, [services]);

  const register = useCallback(async (credentials) => {
    const session = await services.auth.register(credentials);
    dispatch({ type: 'SET_SESSION', payload: session });
    return session;
  }, [services]);

  const signOut = useCallback(async () => {
    await Promise.resolve(services.auth.signOut());
    dispatch({ type: 'SET_SESSION', payload: null });
  }, [services]);

  const setStatus = useCallback((commentId, status, label, detail = '', platformAction = 'none') => {
    dispatch({ type: 'SET_COMMENT_STATUS', payload: { commentId, status, label, detail, platformAction } });
  }, []);

  const approve = useCallback(async (commentId) => {
    const current = stateFor(commentId);
    const comment = (state.comments || []).find((c) => c.id === commentId);
    const isDemo = services.mode === 'demo';
    const text = current.responseText;
    const parentId = comment?.externalId || (comment?.id?.startsWith('yt-') ? comment.id.slice(3) : null);
    const finalStatus = current.wasEdited ? 'edited' : 'approved';

    // Production + a real YouTube comment + a signed-in creator → try to post
    // the reply directly. Only ever runs on this explicit Approve action.
    if (!isDemo && parentId && text && text.trim()) {
      const result = await publishYouTubeReply({ parentId, text });
      if (result?.success) {
        setStatus(commentId, finalStatus, 'Reply published to YouTube', 'Posted directly to the thread.', 'youtube_reply');
        showToast('Reply published to YouTube.', 'success');
        return;
      }
      // Any error other than "not connected" is worth surfacing before falling back.
      if (result && result.code !== 'not_connected' && result.error) {
        showToast(result.error, 'error');
      }
    }

    // Fallback (demo, not connected, or publish failed): copy + open the thread
    // so the creator can post manually.
    if (typeof navigator !== 'undefined' && navigator.clipboard && text) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    if (typeof window !== 'undefined' && comment?.videoId) {
      const permalink = parentId
        ? `https://www.youtube.com/watch?v=${comment.videoId}&lc=${parentId}`
        : `https://www.youtube.com/watch?v=${comment.videoId}`;
      try {
        window.open(permalink, '_blank', 'noopener,noreferrer');
      } catch (_) {}
    }

    setStatus(
      commentId,
      finalStatus,
      isDemo ? 'Approved fixture draft in Demo Mode' : 'Response approved',
      isDemo ? 'Simulated approval only — no message was sent to YouTube.' : 'Approved. Copied for posting on YouTube.',
      'clipboard_copy',
    );
    showToast(
      isDemo
        ? 'Demo approval recorded. Copied to clipboard.'
        : 'Approved and copied. Connect your channel in Settings to post replies automatically.',
      'success',
    );
  }, [services.mode, state.comments, stateFor, setStatus, showToast]);

  const reject = useCallback((commentId) => {
    setStatus(commentId, 'rejected', 'Draft rejected', 'No reply was sent.', 'none');
    showToast('Draft rejected. Nothing was sent.', 'info');
  }, [setStatus, showToast]);

  const resetDemo = useCallback(() => {
    if (services.mode !== 'demo') return;
    services.persistence.clear();
    dispatch({ type: 'RESET_WORKSPACE', payload: services.repositories.workspace.create() });
    showToast('Demo fixture workspace restored.', 'info');
  }, [services, showToast]);

  const exportData = useCallback(() => {
    const payload = createWorkspaceExportPayload(state);
    const data = encodeURIComponent(JSON.stringify(payload, null, 2));
    const anchor = document.createElement('a');
    anchor.href = `data:application/json;charset=utf-8,${data}`;
    anchor.download = `ghost-guardian-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showToast('Workspace backup exported successfully.', 'success');
  }, [showToast, state]);

  const importWorkspace = useCallback((rehydratedState) => {
    dispatch({ type: 'IMPORT_WORKSPACE', payload: rehydratedState });
    showToast('Workspace successfully restored from backup.', 'success');
  }, [showToast]);

  const generateAiResponse = useCallback(async ({ commentText, commentClassification, creatorVoiceProfile, learningExamples }) => {
    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText,
          commentClassification,
          creatorVoiceProfile: creatorVoiceProfile || state.voice,
          learningExamples: learningExamples || state.learning || [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('generateAiResponse fallback:', err.message);
      return { responseText: '', tokensUsed: 0, error: err.message };
    }
  }, [state.voice, state.learning]);

  const classifyComment = useCallback(async (commentText) => {
    try {
      const res = await fetch('/api/classify-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('classifyComment fallback:', err.message);
      return { classification: 'UNKNOWN', confidence: 0.5, reasoning: err.message, error: err.message };
    }
  }, []);

  const fetchYouTubeComments = useCallback(async ({ videoId, channelId, apiKey }) => {
    try {
      const params = new URLSearchParams();
      if (videoId) params.set('videoId', videoId);
      if (channelId) params.set('channelId', channelId);
      if (apiKey) params.set('apiKey', apiKey);
      const res = await fetch(`/api/youtube-comments?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`);
      }
      return data;
    } catch (err) {
      console.warn('fetchYouTubeComments error:', err.message);
      return { comments: [], error: err.message };
    }
  }, []);

  const ingestComments = useCallback(({ comments, video }) => {
    dispatch({ type: 'INGEST_YOUTUBE_COMMENTS', payload: { comments, video } });
  }, []);

  const value = useMemo(() => ({
    ...state,
    runtime: { mode: services.mode, isDemo: services.mode === 'demo', platform: services.platform, guardian: services.guardian },
    isAuthenticated: Boolean(state.session),
    startDemo,
    signIn,
    register,
    signOut,
    updateSettings: (updates) => dispatch({ type: 'UPDATE_SETTINGS', payload: updates }),
    updateCreator: (updates) => dispatch({ type: 'UPDATE_CREATOR', payload: updates }),
    updateVoice: (updates) => dispatch({ type: 'UPDATE_VOICE', payload: updates }),
    completeOnboarding: (payload) => dispatch({ type: 'COMPLETE_ONBOARDING', payload }),
    addKnowledge: (item) => dispatch({ type: 'ADD_KNOWLEDGE', payload: item }),
    removeKnowledge: (id) => dispatch({ type: 'REMOVE_KNOWLEDGE', payload: id }),
    stateFor,
    setStatus,
    approve,
    reject,
    useTone: (commentId, tone) => dispatch({ type: 'USE_TONE', payload: { commentId, tone } }),
    setResponse: (commentId, text) => dispatch({ type: 'SET_RESPONSE_TEXT', payload: { commentId, text } }),
    regenerate: (commentId) => dispatch({ type: 'REGENERATE', payload: commentId }),
    saveAsExample: (commentId) => dispatch({ type: 'SAVE_AS_EXAMPLE', payload: commentId }),
    updateOpportunityStatus: (id, status) => dispatch({ type: 'UPDATE_OPPORTUNITY_STATUS', payload: { id, status } }),
    updatePolicy: (updates, reason) => dispatch({ type: 'UPDATE_POLICY', payload: { updates, reason } }),
    applyPolicyPreset: (preset) => dispatch({ type: 'APPLY_POLICY_PRESET', payload: preset }),
    generateAiResponse,
    classifyComment,
    fetchYouTubeComments,
    ingestComments,
    resetDemo,
    exportData,
    importWorkspace,
    showToast,
    dispatch,
  }), [approve, exportData, importWorkspace, signIn, register, reject, resetDemo, services, signOut, showToast, startDemo, state, stateFor, setStatus, generateAiResponse, classifyComment, fetchYouTubeComments, ingestComments]);

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error('useApplication must be used within ApplicationProvider');
  return context;
}
