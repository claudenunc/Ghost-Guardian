import React from 'react';
import {
  Video,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Chip, Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function PlatformConnections() {
  const { creator, videos } = useGuardian();

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <h3 className="font-display text-lg text-white font-bold tracking-wide uppercase">
            Platform Connections
          </h3>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            Connect your public content channels to feed the Ghost Guardian triage engine.
          </p>
        </div>
        <Chip variant="outline" className="border-white/10 text-white font-mono">
          Multi-Platform Architecture
        </Chip>
      </div>

      {/* 1. Active: YouTube Public Video Ingestion */}
      <div className="rounded-xl border border-[#00FF66]/30 bg-[#000000] p-5 sm:p-6 space-y-5 shadow-[0_0_24px_rgba(0,255,102,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#FF1400]/15 text-[#FF1400] flex items-center justify-center shrink-0 border border-[#FF1400]/30 shadow-[0_0_15px_rgba(255,20,0,0.2)]">
              <Video size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold tracking-wider">
                  YouTube Public Access
                </h4>
                <Chip variant="positive" className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                  <span className="pulse-dot bg-[#00FF66] mr-1" /> Active
                </Chip>
              </div>
              <p className="text-xs text-[#a0a0a0] mt-1 font-mono">
                Channel: <strong className="text-white">{creator?.channelName || 'Connected Channel'}</strong> ({creator?.handle || '@creator'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip variant="outline" className="text-xs border-white/10 font-mono text-[#a0a0a0]">
              {videos?.length || 0} Videos Tracked
            </Chip>
          </div>
        </div>

        <div className="grid gap-3 pt-4 border-t border-white/[0.08] sm:grid-cols-2 text-xs text-[#a0a0a0]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0a0] block font-mono">
              Access Level
            </span>
            <span className="text-white font-medium mt-0.5 block">
              Public Comment Ingestion via YouTube Data API v3
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0a0] block font-mono">
              Approval Flow
            </span>
            <span className="text-[#00FF66] font-medium mt-0.5 block">
              Copilot Mode — 1-click clipboard copy with direct video link
            </span>
          </div>
        </div>
      </div>

      {/* 2. Channel OAuth Direct Publishing Connection (Truthful state: Coming soon) */}
      <div className="rounded-xl border border-white/10 bg-[#050505] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/5 text-[#a0a0a0] flex items-center justify-center shrink-0 border border-white/10">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold tracking-wider">
                  Direct Channel OAuth (Auto-Publishing)
                </h4>
                <Chip variant="outline" className="text-[#a0a0a0] border-white/10">
                  Coming in publish release
                </Chip>
              </div>
              <p className="text-xs text-[#a0a0a0] mt-1">
                Full two-way channel OAuth allowing Ghost Guardian to post approved replies straight to YouTube threads.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-[#000000] p-3.5 flex items-start gap-3 text-xs text-[#a0a0a0]">
          <Clock size={16} className="text-[#0200F1] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-white">Safety Philosophy:</strong> In the current beta, approved replies are copied to your clipboard and opened directly on YouTube. Ghost Guardian will never auto-post comments to your channel without your explicit confirmation.
          </span>
        </div>
      </div>

      {/* Planned Platforms Suite */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#a0a0a0] block font-mono">
          Upcoming Platform Integrations
        </span>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Instagram Threads & Comments', desc: 'Direct Creator DM & Post ingestion' },
            { name: 'TikTok Creator Hub', desc: 'High-velocity short-form triage' },
            { name: 'X / Twitter Mentions', desc: 'Provocation filtering and quote analysis' },
            { name: 'Reddit Community Threads', desc: 'Subreddit moderation and question mining' },
            { name: 'Discord Server Channels', desc: 'Community sentiment and helper responses' },
            { name: 'Substack Notes & Comments', desc: 'Longform newsletter discussions' },
          ].map((item) => (
            <div key={item.name} className="p-3.5 rounded-lg bg-[#050505] border border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                <span className="text-[10px] text-[#a0a0a0] font-mono">Planned</span>
              </div>
              <p className="text-[11px] text-[#a0a0a0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
