import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Video,
  Bell,
  Sliders,
  Database,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { SectionTitle, Chip } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import WorkspaceIdentity from '../components/settings/WorkspaceIdentity';
import PlatformConnections from '../components/settings/PlatformConnections';
import NotificationCenter from '../components/settings/NotificationCenter';
import GuardianModeSummary from '../components/settings/GuardianModeSummary';
import DataPortability from '../components/settings/DataPortability';
import DangerZone from '../components/settings/DangerZone';

export default function Settings() {
  const { creator } = useGuardian();
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'platforms' | 'notifications' | 'mode' | 'data' | 'danger'

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#4de1dc]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Workspace Control Center
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
              Settings, Portability & Operational Control
            </h1>
            <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
              Manage workspace identity, connected platforms, attention notification triggers, operational mode status, and full data backups.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Chip variant="guardian" className="font-mono">
              🛡️ {creator?.displayName || 'Alex Chen'}
            </Chip>
            <span className="text-[11px] text-[#8f97b0]">
              {creator?.channelName || 'The Long Signal'} · Demo Mode
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141724] border border-white/5 overflow-x-auto">
        {[
          { id: 'identity', label: '1. Workspace Identity', icon: User },
          { id: 'platforms', label: '2. Platforms', icon: Video },
          { id: 'notifications', label: '3. Notification Center', icon: Bell },
          { id: 'mode', label: '4. Operational Mode', icon: Sliders },
          { id: 'data', label: '5. Data & Backups', icon: Database },
          { id: 'danger', label: '6. Danger Zone', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-[#1e2235] text-[#4de1dc] border-[#4de1dc]/40 shadow-[0_0_15px_rgba(77,225,220,0.15)]'
                  : 'border-transparent text-[#8f97b0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE TAB CONTENT */}
      {activeTab === 'identity' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Workspace Identity"
            subtitle="Configure creator profile, channel naming, and display metadata."
          />
          <WorkspaceIdentity />
        </div>
      )}

      {activeTab === 'platforms' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Platform Connections"
            subtitle="Manage YouTube synchronization and review upcoming social integrations."
          />
          <PlatformConnections />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Notification Triggers"
            subtitle="Configure real-time Guardian interruptions, digest schedules, and quiet hours."
          />
          <NotificationCenter />
        </div>
      )}

      {activeTab === 'mode' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Operational Mode Summary"
            subtitle="Overview of Ghost Guardian's active posture and link to the Policy Studio."
          />
          <GuardianModeSummary />
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Data Portability & Backup"
            subtitle="Export deterministic JSON backups or restore previous workspace states safely."
          />
          <DataPortability />
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <SectionTitle
            title="Danger Zone & Session Actions"
            subtitle="Reset demo fixtures or clear local browser storage."
          />
          <DangerZone />
        </div>
      )}
    </div>
  );
}
