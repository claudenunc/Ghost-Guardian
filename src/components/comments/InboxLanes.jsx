import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Heart,
  ShieldAlert,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';

export const INBOX_LANES = [
  {
    id: 'needs_you',
    label: 'Needs You',
    icon: AlertTriangle,
    tone: 'attention',
    description: 'Highest-value creator judgment',
  },
  {
    id: 'review_queue',
    label: 'Review Queue',
    icon: Sparkles,
    tone: 'guardian',
    description: 'Calibrated drafts ready to approve',
  },
  {
    id: 'human_moments',
    label: 'Human Moments',
    icon: Heart,
    tone: 'human',
    description: 'Vulnerable & meaningful connections',
  },
  {
    id: 'shield_vault',
    label: 'Shield Vault',
    icon: ShieldAlert,
    tone: 'shield',
    description: 'Buffered hostile & high-risk material',
  },
  {
    id: 'handled',
    label: 'Handled',
    icon: CheckCircle2,
    tone: 'positive',
    description: 'Filtered noise & completed responses',
  },
  {
    id: 'all',
    label: 'All Comments',
    icon: ListFilter,
    tone: 'default',
    description: 'Complete workspace stream',
  },
];

export default function InboxLanes({ activeLane, onSelectLane, laneCounts }) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center gap-1.5 min-w-max p-1 rounded-2xl bg-[#141724] border border-white/5">
        {INBOX_LANES.map((lane) => {
          const Icon = lane.icon;
          const isActive = activeLane === lane.id;
          const count = laneCounts[lane.id] ?? 0;

          const activeColors = {
            attention: 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]',
            guardian: 'bg-[#4de1dc]/15 text-[#4de1dc] border-[#4de1dc]/40 shadow-[0_0_15px_rgba(77,225,220,0.15)]',
            human: 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/40 shadow-[0_0_15px_rgba(192,132,252,0.15)]',
            shield: 'bg-[#818cf8]/15 text-[#818cf8] border-[#818cf8]/40 shadow-[0_0_15px_rgba(129,140,248,0.15)]',
            positive: 'bg-[#34d399]/15 text-[#34d399] border-[#34d399]/40 shadow-[0_0_15px_rgba(52,211,153,0.15)]',
            default: 'bg-white/15 text-white border-white/30',
          }[lane.tone] || 'bg-white/10 text-white border-white/20';

          return (
            <button
              key={lane.id}
              type="button"
              onClick={() => onSelectLane(lane.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? activeColors
                  : 'border-transparent text-[#8f97b0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{lane.label}</span>
              <span
                className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-black/30 text-white'
                    : 'bg-[#1e2235] text-[#8f97b0]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
