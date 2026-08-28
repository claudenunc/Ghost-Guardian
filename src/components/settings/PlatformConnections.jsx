import React, { useState } from 'react';
import {
  Video,
  Link2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Unlink,
} from 'lucide-react';
import { Button, Chip, SectionTitle } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function PlatformConnections() {
  const { creator, showToast } = useGuardian();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Today at 4:12 PM (Simulated)');

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Just now (Simulated)');
      showToast('Simulated YouTube comments synced.', 'success');
    }, 600);
  };

  const handleDisconnect = () => {
    showToast('Demo YouTube connection reset.', 'info');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h3 className="font-display text-lg text-white font-bold">Platform Connections</h3>
          <p className="text-xs text-[#8f97b0] mt-0.5">
            Connect your public content platforms to feed the Guardian attention protection engine.
          </p>
        </div>
        <Chip variant="outline">Multi-Platform Ready</Chip>
      </div>

      {/* Primary YouTube Connection Card */}
      <div className="rounded-2xl border border-[#f87171]/25 bg-gradient-to-r from-[#1b1417]/80 to-[#121422]/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-xl bg-[#f87171]/15 text-[#f87171] flex items-center justify-center shrink-0">
              <Video size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold">YouTube Channel</h4>
                <Chip variant="positive">Simulated (Demo)</Chip>
              </div>
              <p className="text-xs text-[#8f97b0] mt-0.5">
                Channel: <strong className="text-white">{creator?.channelName || 'The Long Signal'}</strong> ({creator?.handle || '@alexchen'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleSimulateSync} disabled={isSyncing}>
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Simulate Sync'}</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleDisconnect}>
              <Unlink size={13} /> Disconnect
            </Button>
          </div>
        </div>

        {/* Status & Scope Detail */}
        <div className="grid gap-3 pt-3 border-t border-white/5 sm:grid-cols-2 text-xs text-[#8f97b0]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
              Last Sync Timestamp
            </span>
            <span className="text-white font-medium">{lastSync}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f97b0] block">
              Authorized Scopes (Conceptual)
            </span>
            <span className="text-[#4de1dc] font-medium">Read comments · Post approved replies</span>
          </div>
        </div>

        {/* Security & Production Disclaimer */}
        <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-start gap-2.5 text-xs text-[#8f97b0]">
          <Shield size={14} className="text-[#4de1dc] shrink-0 mt-0.5" />
          <span>
            <strong>Production Architecture Note:</strong> Live platform connections use OAuth 2.0 authorization codes stored server-side. Ghost Guardian never collects or stores your YouTube account passwords or personal credentials in local browser storage.
          </span>
        </div>
      </div>

      {/* Planned Platforms Suite */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8f97b0] block">
          Upcoming Platform Integrations
        </span>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Instagram Threads & Comments', desc: 'Direct Creator DM & Post ingestion' },
            { name: 'TikTok Creator Hub', desc: 'High-velocity short form triage' },
            { name: 'X / Twitter Mentions', desc: 'Provocation filtering and quote analysis' },
            { name: 'Reddit Community Threads', desc: 'Subreddit moderation and question mining' },
            { name: 'Discord Server Channels', desc: 'Community sentiment and helper responses' },
            { name: 'Substack Notes & Comments', desc: 'Longform newsletter discussions' },
          ].map((item) => (
            <div key={item.name} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.name}</span>
                <span className="text-[10px] text-[#8f97b0] font-mono">Planned</span>
              </div>
              <p className="text-[11px] text-[#8f97b0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
