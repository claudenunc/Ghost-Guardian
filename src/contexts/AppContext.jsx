import React, { createContext, useContext, useReducer, useCallback } from 'react';
import storage from '../services/storage';
import { demoCreator } from '../data/demoCreator';
import { demoComments, demoIntelligence } from '../data/demoComments';
import { demoVideos } from '../data/demoVideos';
import { demoCommenters } from '../data/demoCommenters';
import { processCommentBatch } from '../services/ai/pipeline';

const AppContext = createContext(null);

const initialState = {
  // Auth
  isLoggedIn: false,
  isDemo: false,
  user: null,

  // Creator
  creator: null,
  onboarded: false,

  // Guardian
  guardianMode: 'copilot', // copilot | autopilot | guardian
  guardianPaused: false,
  guardianWit: false,

  // Comments
  comments: [],
  processedComments: [],
  selectedCommentId: null,

  // Data
  videos: [],
  intelligence: null,
  communityMembers: {},
  activity: [],
  analytics: {
    commentsProcessed: 0,
    commentsClassified: 0,
    repliesGenerated: 0,
    repliesApproved: 0,
    repliesEdited: 0,
    repliesRejected: 0,
    commentsIgnored: 0,
    commentsEscalated: 0,
    avgResponseTime: 0,
    timeSavedMinutes: 0,
  },
  voiceExamples: [],
  knowledge: [],
  recentResponses: [],

  // UI
  sidebarOpen: false,
  notifications: [],
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true, user: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_DEMO':
      return { ...state, isDemo: action.payload };
    case 'SET_CREATOR':
      storage.setCreator(action.payload);
      return { ...state, creator: action.payload };
    case 'SET_ONBOARDED':
      storage.setOnboarded(action.payload);
      return { ...state, onboarded: action.payload };
    case 'SET_GUARDIAN_MODE':
      storage.setGuardianMode(action.payload);
      return { ...state, guardianMode: action.payload };
    case 'SET_GUARDIAN_PAUSED':
      storage.setGuardianPaused(action.payload);
      return { ...state, guardianPaused: action.payload };
    case 'SET_GUARDIAN_WIT':
      return { ...state, guardianWit: action.payload };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'SET_PROCESSED_COMMENTS':
      return { ...state, processedComments: action.payload };
    case 'UPDATE_PROCESSED_COMMENT': {
      const updated = state.processedComments.map(pc =>
        pc.comment.id === action.payload.commentId
          ? { ...pc, ...action.payload.updates }
          : pc
      );
      return { ...state, processedComments: updated };
    }
    case 'SET_VIDEOS':
      return { ...state, videos: action.payload };
    case 'SET_INTELLIGENCE':
      return { ...state, intelligence: action.payload };
    case 'SET_COMMUNITY_MEMBERS':
      return { ...state, communityMembers: action.payload };
    case 'ADD_ACTIVITY': {
      const entry = { ...action.payload, id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), timestamp: new Date().toISOString() };
      const newActivity = [entry, ...state.activity].slice(0, 500);
      storage.set('activity', newActivity);
      return { ...state, activity: newActivity };
    }
    case 'SET_ANALYTICS':
      storage.setAnalytics(action.payload);
      return { ...state, analytics: action.payload };
    case 'INCREMENT_ANALYTIC': {
      const a = { ...state.analytics, [action.payload.key]: (state.analytics[action.payload.key] || 0) + (action.payload.amount || 1) };
      storage.setAnalytics(a);
      return { ...state, analytics: a };
    }
    case 'ADD_VOICE_EXAMPLE': {
      const examples = [...state.voiceExamples, { ...action.payload, id: Date.now().toString(36), savedAt: new Date().toISOString() }];
      storage.set('voice_examples', examples);
      return { ...state, voiceExamples: examples };
    }
    case 'ADD_RECENT_RESPONSE': {
      const recent = [...state.recentResponses, action.payload].slice(-50);
      storage.set('recent_responses', recent);
      return { ...state, recentResponses: recent };
    }
    case 'SET_KNOWLEDGE':
      storage.setKnowledge(action.payload);
      return { ...state, knowledge: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false };
    case 'ADD_TOAST': {
      const toast = { ...action.payload, id: Date.now() };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadDemoData = useCallback(() => {
    const creator = demoCreator;
    dispatch({ type: 'SET_DEMO', payload: true });
    dispatch({ type: 'LOGIN', payload: { name: creator.name, email: 'alex@thesignal.show' } });
    dispatch({ type: 'SET_CREATOR', payload: creator });
    dispatch({ type: 'SET_ONBOARDED', payload: true });
    dispatch({ type: 'SET_VIDEOS', payload: demoVideos });
    dispatch({ type: 'SET_COMMENTS', payload: demoComments });
    dispatch({ type: 'SET_INTELLIGENCE', payload: demoIntelligence });
    dispatch({ type: 'SET_COMMUNITY_MEMBERS', payload: demoCommenters });
    dispatch({ type: 'SET_KNOWLEDGE', payload: creator.knowledge });

    // Process all demo comments through the AI pipeline
    const processed = processCommentBatch(demoComments, {
      creatorVoice: creator.voice,
      guardianWit: false,
      recentResponses: [],
    });

    // Add statuses
    const withStatus = processed.map(p => ({
      ...p,
      status: 'pending', // pending | approved | rejected | ignored | escalated | published
      creatorEdit: null,
      publishedAt: null,
    }));

    dispatch({ type: 'SET_PROCESSED_COMMENTS', payload: withStatus });

    // Set demo analytics
    dispatch({ type: 'SET_ANALYTICS', payload: {
      commentsProcessed: demoComments.length,
      commentsClassified: demoComments.length,
      repliesGenerated: withStatus.filter(p => p.response?.text).length,
      repliesApproved: 12,
      repliesEdited: 4,
      repliesRejected: 2,
      commentsIgnored: 3,
      commentsEscalated: 2,
      avgResponseTime: 1.2,
      timeSavedMinutes: 180,
    }});

    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Demo mode activated — your Guardian is watching.' } });
  }, []);

  const loadSavedState = useCallback(() => {
    const creator = storage.getCreator();
    if (creator) {
      dispatch({ type: 'LOGIN', payload: { name: creator.name, email: 'user@ghostguardian.com' } });
      dispatch({ type: 'SET_CREATOR', payload: creator });
      dispatch({ type: 'SET_ONBOARDED', payload: storage.isOnboarded() });
      dispatch({ type: 'SET_GUARDIAN_MODE', payload: storage.getGuardianMode() });
      dispatch({ type: 'SET_GUARDIAN_PAUSED', payload: storage.isGuardianPaused() });
      const activity = storage.getActivity();
      if (activity.length) dispatch({ type: 'LOAD_SAVED_STATE', payload: { activity } });
      const analytics = storage.getAnalytics();
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
      const knowledge = storage.getKnowledge();
      dispatch({ type: 'SET_KNOWLEDGE', payload: knowledge });
      return true;
    }
    return false;
  }, []);

  const approveComment = useCallback((commentId) => {
    const pc = state.processedComments.find(p => p.comment.id === commentId);
    if (!pc) return;
    dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { status: 'approved', publishedAt: new Date().toISOString() } } });
    dispatch({ type: 'INCREMENT_ANALYTIC', payload: { key: 'repliesApproved' } });
    if (pc.response?.text) dispatch({ type: 'ADD_RECENT_RESPONSE', payload: pc.response.text });
    dispatch({ type: 'ADD_ACTIVITY', payload: { action: 'approved', commentId, comment: pc.comment.text?.slice(0, 80), response: pc.response?.text?.slice(0, 100), platform: pc.comment.platform } });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Response approved and published.' } });
  }, [state.processedComments]);

  const editComment = useCallback((commentId, editedText) => {
    dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { status: 'approved', creatorEdit: editedText, publishedAt: new Date().toISOString() } } });
    dispatch({ type: 'INCREMENT_ANALYTIC', payload: { key: 'repliesEdited' } });
    dispatch({ type: 'ADD_RECENT_RESPONSE', payload: editedText });
    dispatch({ type: 'ADD_ACTIVITY', payload: { action: 'edited', commentId, response: editedText?.slice(0, 100) } });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Edited response published.' } });
  }, []);

  const rejectComment = useCallback((commentId) => {
    dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { status: 'rejected' } } });
    dispatch({ type: 'INCREMENT_ANALYTIC', payload: { key: 'repliesRejected' } });
    dispatch({ type: 'ADD_ACTIVITY', payload: { action: 'rejected', commentId } });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: 'Response rejected.' } });
  }, []);

  const ignoreComment = useCallback((commentId) => {
    dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { status: 'ignored' } } });
    dispatch({ type: 'INCREMENT_ANALYTIC', payload: { key: 'commentsIgnored' } });
    dispatch({ type: 'ADD_ACTIVITY', payload: { action: 'ignored', commentId } });
  }, []);

  const escalateComment = useCallback((commentId) => {
    dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { status: 'escalated' } } });
    dispatch({ type: 'INCREMENT_ANALYTIC', payload: { key: 'commentsEscalated' } });
    dispatch({ type: 'ADD_ACTIVITY', payload: { action: 'escalated', commentId } });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'warning', message: 'Comment escalated for human review.' } });
  }, []);

  const regenerateResponse = useCallback((commentId) => {
    const pc = state.processedComments.find(p => p.comment.id === commentId);
    if (!pc) return;
    const reprocessed = processCommentBatch([pc.comment], {
      creatorVoice: state.creator?.voice,
      guardianWit: state.guardianWit,
      recentResponses: state.recentResponses,
    });
    if (reprocessed[0]) {
      dispatch({ type: 'UPDATE_PROCESSED_COMMENT', payload: { commentId, updates: { response: reprocessed[0].response, quality: reprocessed[0].quality, status: 'pending' } } });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: 'Response regenerated.' } });
    }
  }, [state.processedComments, state.creator, state.guardianWit, state.recentResponses]);

  const saveAsExample = useCallback((commentId) => {
    const pc = state.processedComments.find(p => p.comment.id === commentId);
    if (!pc) return;
    dispatch({ type: 'ADD_VOICE_EXAMPLE', payload: {
      comment: pc.comment.text,
      response: pc.creatorEdit || pc.response?.text,
      category: pc.classification?.category,
    }});
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Saved as voice training example.' } });
  }, [state.processedComments]);

  const addToast = useCallback((type, message) => {
    dispatch({ type: 'ADD_TOAST', payload: { type, message } });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const value = {
    state,
    dispatch,
    loadDemoData,
    loadSavedState,
    approveComment,
    editComment,
    rejectComment,
    ignoreComment,
    escalateComment,
    regenerateResponse,
    saveAsExample,
    addToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
