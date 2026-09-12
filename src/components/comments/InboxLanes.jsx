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
      <div
        role="tablist"
        aria-label="Comment triage lanes"
        className="flex items-center gap-1.5 min-w-max p-1 rounded-2xl bg-[#0a0a0a] border border-white/10"
      >
        {INBOX_LANES.map((lane) => {
          const Icon = lane.icon;
          const isActive = activeLane === lane.id;
          const count = laneCounts[lane.id] ?? 0;

          const activeColors = {
            attention: 'bg-[#FF6A00]/15 text-[#FF6A00] border-[#FF6A00]/40 shadow-[0_0_15px_rgba(255,106,0,0.15)]',
            guardian: 'bg-[#0200F1]/15 text-[#0200F1] border-[#0200F1]/40 shadow-[0_0_15px_rgba(2,0,241,0.15)]',
            human: 'bg-[#FF007A]/15 text-[#FF007A] border-[#FF007A]/40 shadow-[0_0_15px_rgba(255,0,122,0.15)]',
            shield: 'bg-[#7A00FF]/15 text-[#7A00FF] border-[#7A00FF]/40 shadow-[0_0_15px_rgba(122,0,255,0.15)]',
            positive: 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)]',
            default: 'bg-white/15 text-white border-white/30',
          }[lane.tone] || 'bg-white/10 text-white border-white/20';

          return (
            <button
              key={lane.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${lane.label} lane (${count} comments)`}
              onClick={() => onSelectLane(lane.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? activeColors
                  : 'border-transparent text-[#a0a0a0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{lane.label}</span>
              <span
                className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-black/30 text-white'
                    : 'bg-[#161616] text-[#a0a0a0]'
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
