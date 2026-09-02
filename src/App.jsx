import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useGuardian } from './lib/store';
import AppLayout from './components/layout/AppLayout';

// Route-level code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CommentInbox = lazy(() => import('./pages/CommentInbox'));
const CreatorVoice = lazy(() => import('./pages/CreatorVoice'));
const GuardianRules = lazy(() => import('./pages/GuardianRules'));
const AudienceIntelligence = lazy(() => import('./pages/AudienceIntelligence'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Community = lazy(() => import('./pages/Community'));
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'));
const Settings = lazy(() => import('./pages/Settings'));

function ScrollToTop({ children }) {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-[#a0a0a0]">
      <span className="pulse-dot bg-[#0A00FF] mr-2 shadow-[0_0_12px_#0A00FF]" />
      <span>Loading Guardian workspace...</span>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useGuardian();
  const location = useLocation();
  if (isAuthenticated) return children;
  return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

          {/* Authenticated workspace. Demo authentication is explicitly opted into. */}
          <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="inbox" element={<CommentInbox />} />
            <Route path="voice" element={<CreatorVoice />} />
            <Route path="rules" element={<GuardianRules />} />
            <Route path="audience" element={<AudienceIntelligence />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="community" element={<Community />} />
            <Route path="activity" element={<ActivityHistory />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ScrollToTop>
    </Suspense>
  );
}
