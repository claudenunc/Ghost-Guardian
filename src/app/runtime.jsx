import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createDevelopmentAuthAdapter, createProductionAuthAdapter } from './authService';
import { runtimeConfig } from './config';
import { createBrowserWorkspaceRepository } from '../data/repositories/browserWorkspaceRepository';
import { createDemoRepositories, createUnavailableProductionRepositories } from '../data/repositories/demoRepositories';
import { createDemoWorkspace } from '../fixtures/demoWorkspace';
import { createWorkspaceExportPayload } from '../domain/settings/workspaceContracts';
import { createDemoGuardianProvider, createProductionGuardianProvider } from '../domain/guardian';
import { createDemoPlatformAdapter, createProductionPlatformAdapter } from '../domain/platform/platformAdapter';

const ApplicationContext = createContext(null);

function createServices(mode) {
  const isDemo = mode === 'demo';
  return {
    mode,
    auth: isDemo ? createDevelopmentAuthAdapter() : createProductionAuthAdapter(),
    repositories: isDemo
      ? createDemoRepositories({ ...createDemoWorkspace() })
      : createUnavailableProductionRepositories(),
    persistence: createBrowserWorkspaceRepository(),
    guardian: isDemo ? createDemoGuardianProvider() : createProductionGuardianProvider(),
    platform: isDemo ? createDemoPlatformAdapter() : createProductionPlatformAdapter(),
  };
}

function createInitialState(services) {
  const fixture = services.mode === 'demo' ? services.repositories.workspace.create() : {};
  const saved = services.persistence.load();
  const workspace = saved
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
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        creator: { ...state.creator, ...action.payload.creator, isFixture: true },
        voice: { ...state.voice, ...action.payload.voice },
        settings: { ...state.settings, mode: action.payload.mode },
      };
    case 'ADD_KNOWLEDGE': {
      const item = { ...action.payload, id: `knowledge-${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, knowledge: [item, ...state.knowledge] };
    }
    case 'REMOVE_KNOWLEDGE':
      return { ...state, knowledge: state.knowledge.filter((item) => item.id !== action.payload) };
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
      return { ...updated, activity: [activity, ...state.activity].slice(0, 200) };
    }
    case 'USE_TONE': {
      const comment = state.comments.find((item) => item.id === action.payload.commentId);
      return updateCommentState(state, action.payload.commentId, {
        activeTone: action.payload.tone,
        responseText: comment?.drafts?.[action.payload.tone] || '',
        wasEdited: false,
      });
    }
    case 'SET_RESPONSE_TEXT':
      return updateCommentState(state, action.payload.commentId, { responseText: action.payload.text, wasEdited: true });
    case 'REGENERATE': {
      const comment = state.comments.find((item) => item.id === action.payload);
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
      const comment = state.comments.find((item) => item.id === action.payload);
      const current = state.commentStates[action.payload] || {};
      const example = {
        id: `example-${Date.now()}`,
        before: comment?.drafts?.calm || comment?.drafts?.warm || '',
        after: current.responseText || '',
        createdAt: new Date().toISOString(),
      };
      const updated = updateCommentState(state, action.payload, { savedAsExample: true });
      return { ...updated, learning: [example, ...state.learning] };
    }
    case 'ADD_LEARNING_EXAMPLE': {
      const example = {
        ...action.payload,
        id: action.payload.id || `example-${Date.now()}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      return { ...state, learning: [example, ...state.learning] };
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
      return { ...action.payload, session: state.session, toast: null };
    case 'IMPORT_WORKSPACE':
      return { ...state, ...action.payload, toast: { message: 'Workspace restored from backup.', type: 'success' } };
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

  useEffect(() => {
    if (services.mode === 'demo') services.persistence.save(persistableState(state));
  }, [services, state]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type, id: Date.now() } });
  }, []);

  const stateFor = useCallback((commentId) => state.commentStates[commentId] || {
    status: 'pending', activeTone: 'warm', responseText: '', wasEdited: false, savedAsExample: false, regenerations: 0,
  }, [state.commentStates]);

  const startDemo = useCallback(() => {
    const session = services.auth.signIn();
    dispatch({ type: 'SET_SESSION', payload: session });
    return session;
  }, [services]);

  const signOut = useCallback(() => {
    services.auth.signOut();
    dispatch({ type: 'SET_SESSION', payload: null });
  }, [services]);

  const setStatus = useCallback((commentId, status, label, detail = '', platformAction = 'none') => {
    dispatch({ type: 'SET_COMMENT_STATUS', payload: { commentId, status, label, detail, platformAction } });
  }, []);

  const approve = useCallback((commentId) => {
    const current = stateFor(commentId);
    void services.platform.replyToComment(commentId, current.responseText);
    setStatus(commentId, current.wasEdited ? 'edited' : 'approved', 'Approved fixture draft in Demo Mode', 'Simulated approval only — no message was sent to YouTube.', 'simulated_reply');
    showToast('Demo approval recorded. No reply was sent to YouTube.', 'info');
  }, [services, setStatus, showToast, stateFor]);

  const reject = useCallback((commentId) => {
    setStatus(commentId, 'rejected', 'Rejected fixture draft', 'No reply was sent.', 'none');
    showToast('Draft rejected. Nothing was sent.', 'info');
  }, [setStatus, showToast]);

  const resetDemo = useCallback(() => {
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

  const value = useMemo(() => ({
    ...state,
    runtime: { mode: services.mode, isDemo: services.mode === 'demo', platform: services.platform, guardian: services.guardian },
    isAuthenticated: Boolean(state.session),
    startDemo,
    signOut,
    updateSettings: (updates) => dispatch({ type: 'UPDATE_SETTINGS', payload: updates }),
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
    resetDemo,
    exportData,
    importWorkspace,
    showToast,
    dispatch,
  }), [approve, exportData, importWorkspace, reject, resetDemo, services, signOut, showToast, startDemo, state, stateFor, setStatus]);

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error('useApplication must be used within ApplicationProvider');
  return context;
}

