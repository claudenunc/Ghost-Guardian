import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  demoComments,
  demoCommenters,
  demoKnowledge,
  demoVideos,
  demoVoiceProfile,
  demoQuestionClusters,
  demoTopics,
  demoSentimentTrend,
  demoContentOpportunities,
} from './demo-data';

const STORAGE_KEY = 'ghost_guardian_workspace_v2';

const initialSettings = {
  mode: 'copilot', // copilot | autopilot | guardian
  paused: false,
  pauseAutoReplies: false,
  guardianWit: true,
  notifyThreats: true,
  notifyQuestions: true,
  notifySpikes: true,
  notifyWeekly: true,
};

function initializeCommentStates(comments) {
  const map = {};
  for (const c of comments) {
    map[c.id] = {
      status: 'pending',
      activeTone: 'warm',
      responseText: c.drafts?.warm || c.drafts?.calm || c.drafts?.direct || '',
      wasEdited: false,
      savedAsExample: false,
      regenerations: 0,
      updatedAt: c.createdAt,
    };
  }
  return map;
}

const initialLearning = [
  {
    id: 'l1',
    before: 'Thank you so much for your feedback! We appreciate you watching.',
    after: 'Two years! That genuinely makes my day. What part hit you hardest?',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'l2',
    before: 'We value diverse viewpoints in our community.',
    after: 'That is fair criticism. Which objection do you think most needed to be in there?',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const initialActivity = [
  {
    id: 'a1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    commentId: 'm1',
    label: 'Approved draft reply to @marisol.reads',
    detail: 'Warm register approved without edits.',
    finalAction: 'approved',
    published: true,
  },
  {
    id: 'a2',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    commentId: 'm10',
    label: 'Escalated critical risk threat to creator',
    detail: 'Physical threat flagged. Never auto-replied. Logged for platform report.',
    finalAction: 'escalated',
    published: false,
  },
];

const initialSecrets = [
  { id: 's1', name: 'YOUTUBE_API_KEY', value: 'AIzaSyD...98xQ', category: 'Platform API', createdAt: 'Aug 27, 2026' },
  { id: 's2', name: 'OPENAI_API_KEY', value: 'sk-proj-...88fA', category: 'AI Inference', createdAt: 'Aug 27, 2026' },
  { id: 's3', name: 'ANTHROPIC_API_KEY', value: 'sk-ant-...42cK', category: 'AI Inference', createdAt: 'Aug 27, 2026' },
  { id: 's4', name: 'GUARDIAN_CRON_SECRET', value: 'crn_sec_991823', category: 'Automation', createdAt: 'Aug 27, 2026' },
];

const initialLogs = [
  { id: 'log-1', timestamp: new Date(Date.now() - 60000 * 4).toLocaleTimeString(), level: 'INFO', message: 'Comment stream synchronized (3 videos, 14 recent comments).' },
  { id: 'log-2', timestamp: new Date(Date.now() - 60000 * 12).toLocaleTimeString(), level: 'SHIELD', message: 'Threat detector triggered on comment ID: m10. Auto-reply suppressed.' },
  { id: 'log-3', timestamp: new Date(Date.now() - 60000 * 25).toLocaleTimeString(), level: 'SUCCESS', message: 'Voice calibration model updated from 2 approved training examples.' },
  { id: 'log-4', timestamp: new Date(Date.now() - 60000 * 48).toLocaleTimeString(), level: 'INFO', message: 'Audience intelligence clusters refreshed: 3 emerging patterns identified.' },
];

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load workspace from localStorage', e);
  }
  return null;
}

const defaultState = {
  settings: initialSettings,
  voice: demoVoiceProfile,
  knowledge: demoKnowledge,
  comments: demoComments,
  commenters: demoCommenters,
  videos: demoVideos,
  commentStates: initializeCommentStates(demoComments),
  learning: initialLearning,
  activity: initialActivity,
  secrets: initialSecrets,
  logs: initialLogs,
  questionClusters: demoQuestionClusters,
  topics: demoTopics,
  sentimentTrend: demoSentimentTrend,
  contentOpportunities: demoContentOpportunities,
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'UPDATE_VOICE':
      return { ...state, voice: { ...state.voice, ...action.payload } };

    case 'ADD_KNOWLEDGE': {
      const item = {
        ...action.payload,
        id: `k-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      return { ...state, knowledge: [item, ...state.knowledge] };
    }

    case 'REMOVE_KNOWLEDGE':
      return { ...state, knowledge: state.knowledge.filter(k => k.id !== action.payload) };

    case 'SET_COMMENT_STATUS': {
      const { commentId, status, label, detail, published = false } = action.payload;
      const current = state.commentStates[commentId] || {};
      const newCommentStates = {
        ...state.commentStates,
        [commentId]: { ...current, status, updatedAt: new Date().toISOString() },
      };
      const act = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        commentId,
        label: label || `Comment marked as ${status}`,
        detail: detail || '',
        finalAction: status,
        published,
      };
      return {
        ...state,
        commentStates: newCommentStates,
        activity: [act, ...state.activity].slice(0, 200),
      };
    }

    case 'USE_TONE': {
      const { commentId, tone } = action.payload;
      const comment = state.comments.find(c => c.id === commentId);
      const text = comment?.drafts?.[tone] || '';
      const current = state.commentStates[commentId] || {};
      return {
        ...state,
        commentStates: {
          ...state.commentStates,
          [commentId]: {
            ...current,
            activeTone: tone,
            responseText: text,
            wasEdited: false,
          },
        },
      };
    }

    case 'SET_RESPONSE_TEXT': {
      const { commentId, text } = action.payload;
      const current = state.commentStates[commentId] || {};
      return {
        ...state,
        commentStates: {
          ...state.commentStates,
          [commentId]: {
            ...current,
            responseText: text,
            wasEdited: true,
          },
        },
      };
    }

    case 'REGENERATE': {
      const { commentId } = action.payload;
      const comment = state.comments.find(c => c.id === commentId);
      const current = state.commentStates[commentId] || {};
      const tones = ['calm', 'direct', 'warm', 'humorous'].filter(t => comment?.drafts?.[t]);
      const nextTone = tones[(tones.indexOf(current.activeTone) + 1) % tones.length] || 'warm';
      return {
        ...state,
        commentStates: {
          ...state.commentStates,
          [commentId]: {
            ...current,
            activeTone: nextTone,
            responseText: comment?.drafts?.[nextTone] || current.responseText,
            regenerations: (current.regenerations || 0) + 1,
            wasEdited: false,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'SAVE_AS_EXAMPLE': {
      const { commentId } = action.payload;
      const comment = state.comments.find(c => c.id === commentId);
      const current = state.commentStates[commentId] || {};
      const before = comment?.drafts?.calm || comment?.drafts?.warm || 'Generic acknowledgement';
      const after = current.responseText || before;
      const newExample = {
        id: `learn-${Date.now()}`,
        before,
        after,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        commentStates: {
          ...state.commentStates,
          [commentId]: { ...current, savedAsExample: true },
        },
        learning: [newExample, ...state.learning],
      };
    }

    case 'ADD_SECRET': {
      const secret = {
        ...action.payload,
        id: `s-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      return { ...state, secrets: [...state.secrets, secret] };
    }

    case 'REMOVE_SECRET':
      return { ...state, secrets: state.secrets.filter(s => s.id !== action.payload) };

    case 'ADD_LOG': {
      const log = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        ...action.payload,
      };
      return { ...state, logs: [log, ...state.logs].slice(0, 100) };
    }

    case 'RESET_WORKSPACE':
      return { ...defaultState };

    case 'SET_TOAST':
      return { ...state, toast: action.payload };

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}

const GuardianContext = createContext(null);

export function GuardianProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadSaved();
    return saved ? { ...defaultState, ...saved } : defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist workspace', e);
    }
  }, [state]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type, id: Date.now() } });
  }, []);

  const updateSettings = useCallback((updates) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }, []);

  const updateVoice = useCallback((updates) => {
    dispatch({ type: 'UPDATE_VOICE', payload: updates });
  }, []);

  const addKnowledge = useCallback((item) => {
    dispatch({ type: 'ADD_KNOWLEDGE', payload: item });
  }, []);

  const removeKnowledge = useCallback((id) => {
    dispatch({ type: 'REMOVE_KNOWLEDGE', payload: id });
  }, []);

  const stateFor = useCallback((commentId) => {
    return state.commentStates[commentId] || {
      status: 'pending',
      activeTone: 'warm',
      responseText: '',
      wasEdited: false,
      savedAsExample: false,
      regenerations: 0,
      updatedAt: '',
    };
  }, [state.commentStates]);

  const setStatus = useCallback((commentId, status, label, detail = '', published = false) => {
    dispatch({ type: 'SET_COMMENT_STATUS', payload: { commentId, status, label, detail, published } });
  }, []);

  const approve = useCallback((commentId) => {
    const comment = state.comments.find(c => c.id === commentId);
    const commenter = state.commenters.find(c => c.id === comment?.commenterId);
    const current = stateFor(commentId);
    const label = `Approved ${current.wasEdited ? 'edited' : current.activeTone} reply to ${commenter?.displayName || 'commenter'}`;
    dispatch({
      type: 'SET_COMMENT_STATUS',
      payload: {
        commentId,
        status: current.wasEdited ? 'edited' : 'approved',
        label,
        detail: `"${current.responseText}"`,
        published: true,
      },
    });
    showToast('Reply approved and published to YouTube (demo).', 'success');
  }, [state.comments, state.commenters, stateFor, showToast]);

  const reject = useCallback((commentId) => {
    const comment = state.comments.find(c => c.id === commentId);
    const commenter = state.commenters.find(c => c.id === comment?.commenterId);
    dispatch({
      type: 'SET_COMMENT_STATUS',
      payload: {
        commentId,
        status: 'rejected',
        label: `Rejected draft reply to ${commenter?.displayName || 'commenter'}`,
        detail: 'No reply sent.',
        published: false,
      },
    });
    showToast('Draft rejected. Nothing was sent.', 'info');
  }, [state.comments, state.commenters, showToast]);

  const useTone = useCallback((commentId, tone) => {
    dispatch({ type: 'USE_TONE', payload: { commentId, tone } });
  }, []);

  const setResponse = useCallback((commentId, text) => {
    dispatch({ type: 'SET_RESPONSE_TEXT', payload: { commentId, text } });
  }, []);

  const regenerate = useCallback((commentId) => {
    dispatch({ type: 'REGENERATE', payload: { commentId } });
    const current = stateFor(commentId);
    showToast(`Regenerated response in next tone register.`, 'info');
  }, [stateFor, showToast]);

  const saveAsExample = useCallback((commentId) => {
    dispatch({ type: 'SAVE_AS_EXAMPLE', payload: { commentId } });
    showToast('Saved as a voice-training example — visible in Creator Voice.', 'success');
  }, [showToast]);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_WORKSPACE' });
    showToast('Workspace reset. Demo data restored.', 'info');
  }, [showToast]);

  const exportData = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ghost_guardian_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Workspace data exported successfully.', 'success');
  }, [state, showToast]);

  const value = {
    ...state,
    updateSettings,
    updateVoice,
    addKnowledge,
    removeKnowledge,
    stateFor,
    setStatus,
    approve,
    reject,
    useTone,
    setResponse,
    regenerate,
    saveAsExample,
    resetDemo,
    exportData,
    showToast,
    dispatch,
  };

  return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
}

export function useGuardian() {
  const ctx = useContext(GuardianContext);
  if (!ctx) throw new Error('useGuardian must be used within GuardianProvider');
  return ctx;
}
