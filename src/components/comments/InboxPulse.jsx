import React from 'react';
import {
  Shield,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';
import { Chip } from '../guardian/atoms';

export default function InboxPulse({
  needsYouCount,
  handledCount,
  humanMomentsCount,
  shieldedCount,
  onSelectLane,
}) {
  return (
    <div className="ghost-panel p-5 sm:p-6 border-[#4de1dc]/20 bg-gradient-to-r from-[#141829]/90 via-[#131726]/90 to-[#19152b]/90">
      {/* Top micro banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="pulse-dot bg-[#4de1dc]" />
          <span className="text-[11px] font-bold tracking-widest text-[#4de1dc] uppercase">
            Guardian Community Pulse
          </span>
        </div>
        <span className="text-xs text-[#8f97b0]">
          Active Protection & Intelligence
        </span>
      </div>

      {/* 3 Core Questions Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 1. What needs me? */}
        <button
          type="button"
          onClick={() => onSelectLane('needs_you')}
          className="text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#fbbf24]/40 transition-all cursor-pointer group focus:outline-none"
        >
          <div className="flex items-center justify-between text-xs text-[#8f97b0] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#fbbf24] flex items-center gap-1.5">
              <AlertTriangle size={13} /> 1. Needs You
            </span>
            <span className="text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">
              {needsYouCount}
            </span>
          </div>
          <p className="text-xs text-[#e4e7f1] line-clamp-2">
            {needsYouCount > 0
              ? `${needsYouCount} items require direct judgment (Human moments, safety & key questions).`
              : 'All clear. No urgent items require your attention right now.'}
          </p>
        </button>

        {/* 2. What did Guardian handle? */}
        <button
          type="button"
          onClick={() => onSelectLane('handled')}
          className="text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#34d399]/40 transition-all cursor-pointer group focus:outline-none"
        >
          <div className="flex items-center justify-between text-xs text-[#8f97b0] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#34d399] flex items-center gap-1.5">
              <CheckCircle2 size={13} /> 2. Handled for You
            </span>
            <span className="text-sm font-bold text-white group-hover:text-[#34d399] transition-colors">
              {handledCount}
            </span>
          </div>
          <p className="text-xs text-[#e4e7f1] line-clamp-2">
            {handledCount > 0
              ? `${handledCount} items resolved (Spam isolated, routine praise triaged, bait ignored).`
              : 'Autonomous filtering is running in the background.'}
          </p>
        </button>

        {/* 3. Emotional Signal */}
        <button
          type="button"
          onClick={() => onSelectLane('human_moments')}
          className="text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#c084fc]/40 transition-all cursor-pointer group focus:outline-none"
        >
          <div className="flex items-center justify-between text-xs text-[#8f97b0] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[#c084fc] flex items-center gap-1.5">
              <Heart size={13} /> 3. Emotional Signal
            </span>
            <span className="text-sm font-bold text-white group-hover:text-[#c084fc] transition-colors">
              {humanMomentsCount}
            </span>
          </div>
          <p className="text-xs text-[#e4e7f1] line-clamp-2">
            {humanMomentsCount > 0
              ? `${humanMomentsCount} Human Moments detected. Personal disclosures awaiting your authentic voice.`
              : 'No sensitive personal disclosures in current queue.'}
          </p>
        </button>
      </div>
    </div>
  );
}
