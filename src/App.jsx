import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CommentInbox from './pages/CommentInbox';
import CreatorVoice from './pages/CreatorVoice';
import GuardianRules from './pages/GuardianRules';
import AudienceIntelligence from './pages/AudienceIntelligence';
import Analytics from './pages/Analytics';
import Community from './pages/Community';
import ActivityHistory from './pages/ActivityHistory';
import SystemCloudHub from './pages/SystemCloudHub';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Main Protected Application */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inbox" element={<CommentInbox />} />
        <Route path="voice" element={<CreatorVoice />} />
        <Route path="rules" element={<GuardianRules />} />
        <Route path="audience" element={<AudienceIntelligence />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="community" element={<Community />} />
        <Route path="activity" element={<ActivityHistory />} />
        <Route path="system" element={<SystemCloudHub />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
