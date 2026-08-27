import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CommentInbox from './pages/CommentInbox';
import CreatorVoice from './pages/CreatorVoice';
import GuardianRules from './pages/GuardianRules';
import AudienceIntelligence from './pages/AudienceIntelligence';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import PlatformConnections from './pages/PlatformConnections';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Toast from './components/shared/Toast';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.isLoggedIn) return <Navigate to="/auth" replace />;
  if (!state.onboarded && !state.isDemo) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const { state, removeToast } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="inbox" element={<CommentInbox />} />
          <Route path="voice" element={<CreatorVoice />} />
          <Route path="rules" element={<GuardianRules />} />
          <Route path="intelligence" element={<AudienceIntelligence />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<ActivityHistory />} />
          <Route path="platforms" element={<PlatformConnections />} />
          <Route path="community" element={<Community />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications */}
      {state.toasts.length > 0 && (
        <div className="toast-container">
          {state.toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </>
  );
}
