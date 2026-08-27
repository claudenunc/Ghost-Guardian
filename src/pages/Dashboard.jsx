import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Zap,
  Clock,
  Check,
  ArrowRight,
  AlertTriangle,
  Heart,
  Sparkles,
  Bot,
  RefreshCw,
  Eye,
  Lock,
  MessageSquare,
  Flame,
  UserCheck,
} from 'lucide-react';
import {
  Chip,
  ClassificationChip,
  RiskChip,
  SectionTitle,
  StatBlock,
  Button,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function Dashboard() {
  const { comments, commenters, videos, stateFor, settings, updateSettings, approve, regenerate, activity } = useGuardian();

  const pending = comments.filter((c) => stateFor(c.id).status === 'pending');
  const escalations = pending.filter(
    (c) => c.risk === 'critical' || c.risk === 'high' || c.recommendedAction === 'human_review'
  );
  
  const highEngagement = comments.filter((c) => c.likes > 500);
  const shieldedSpamCount = comments.filter((c) => c.classification === 'SPAM' || c.classification === 'HARASSMENT' || c.classification === 'THREAT').length;
  
  // Ready to quick-approve (low risk, high confidence, not escalated)
  const quickApproveQueue = pending
    .filter((c) => c.risk === 'low' && c.confidence > 0.88 && c.drafts?.warm)
    .slice(0, 3);

  const approvedCount = Object.values(stateFor).filter(
    (s) => s.status === 'approved' || s.status === 'edited'
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Pulse Header */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-[#4de1dc]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="pulse-dot bg-[#4de1dc]" />
            <span className="text-xs font-semibold tracking-[0.2em] text-[#4de1dc] uppercase">
              Creator Command Center
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
            Your Guardian is actively shielding your attention.
          </h1>
          <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl">
            {settings.paused
              ? '⏸ Shield is currently paused — automated filtering and drafting are suspended.'
              : `Operating in ${settings.mode.toUpperCase()} mode. ${shieldedSpamCount} hostile or spam messages shielded from your focus.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button asChild size="md">
            <Link to="/app/inbox" className="gap-2">
              <MessageSquare size={16} /> Open Inbox ({pending.length})
            </Link>
          </Button>
          <Button asChild size="md" variant="outline">
            <Link to="/app/voice" className="gap-2">
              <Sparkles size={16} /> Test Voice
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Pulse Operations Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          label="Mental Bandwidth Shielded"
          value={`${shieldedSpamCount} items`}
          tone="positive"
          hint="Hostile & spam comments isolated"
        />
        <StatBlock
          label="Estimated Time Saved"
          value="184 min"
          tone="positive"
          hint="~3 min per triaged discussion"
        />
        <StatBlock
          label="Needs Your Eye"
          value={escalations.length}
          tone={escalations.length > 0 ? 'critical' : 'positive'}
          hint="Critical risk or personal inquiry"
        />
        <StatBlock
          label="Quick Approvals Ready"
          value={quickApproveQueue.length}
          tone="attention"
          hint="High-confidence grounded drafts"
        />
      </div>

      {/* URGENT ESCALATIONS STATION */}
      {escalations.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            title="⚠️ Urgent Human Attention Required"
            subtitle="Ghost Guardian identified safety risks or delicate disclosures. These will never be auto-answered."
            action={
              <Button asChild size="sm" variant="destructive">
                <Link to="/app/inbox">Triage in Inbox</Link>
              </Button>
            }
          />
          <div className="space-y-3">
            {escalations.map((c) => {
              const person = commenters.find((p) => p.id === c.commenterId);
              return (
                <div key={c.id} className="ghost-panel border-[#f87171]/40 bg-[#f87171]/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldAlert size={16} className="text-[#f87171]" />
                      <span className="font-semibold text-sm text-white">{person?.displayName || c.commenterId}</span>
                      <ClassificationChip value={c.classification} />
                      <RiskChip risk={c.risk} />
                    </div>
                    <span className="text-xs text-[#8f97b0]">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white font-medium">"{c.text}"</p>
                  <p className="mt-2 text-xs text-[#f87171]">
                    ⚠️ Reason: {c.escalationReason || c.reasoning?.[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* QUICK APPROVAL STATION (1-Click Action from Dashboard) */}
      <section className="space-y-4">
        <SectionTitle
          title="⚡ Quick-Action Approvals Station"
          subtitle="Top high-confidence drafts ready for 1-click review directly from the Command Center."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/app/inbox">
                View Full Queue <ArrowRight size={14} />
              </Link>
            </Button>
          }
        />
        {quickApproveQueue.length === 0 ? (
          <div className="ghost-panel p-6 text-center text-sm text-[#8f97b0]">
            ✨ All quick-action drafts have been reviewed! Check the Inbox for remaining items.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {quickApproveQueue.map((c) => {
              const person = commenters.find((p) => p.id === c.commenterId);
              const state = stateFor(c.id);
              return (
                <div key={c.id} className="ghost-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white truncate">{person?.displayName}</span>
                      <ClassificationChip value={c.classification} />
                    </div>
                    <p className="mt-2 text-xs text-[#8f97b0] line-clamp-2 italic">
                      "{c.text}"
                    </p>
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#0d0f17]/60 p-3">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#4de1dc] mb-1">
                        <span>Draft ({state.activeTone})</span>
                        <span>{Math.round(c.confidence * 100)}% match</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed line-clamp-3">
                        {state.responseText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => approve(c.id)}
                    >
                      <Check size={14} /> 1-Click Approve
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      title="Regenerate in different tone"
                      onClick={() => regenerate(c.id)}
                    >
                      <RefreshCw size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TWO COLUMN SECTION: HIGH-IMPACT THREADS & RECENT GUARDIAN OPERATIONS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* High Engagement & VIP Discussions */}
        <section className="space-y-4">
          <SectionTitle
            title="🔥 High-Impact Discussions"
            subtitle="Comments driving significant engagement in the community."
          />
          <div className="space-y-3">
            {highEngagement.slice(0, 3).map((c) => {
              const person = commenters.find((p) => p.id === c.commenterId);
              return (
                <div key={c.id} className="ghost-panel p-4 flex items-start gap-3.5">
                  <div className="size-9 rounded-xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center shrink-0 font-bold text-xs">
                    {person?.displayName?.[0] || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{person?.displayName}</span>
                      <Chip variant="attention">
                        <Flame size={12} /> {c.likes.toLocaleString()} likes
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs text-[#e4e7f1] line-clamp-2">"{c.text}"</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#8f97b0]">
                      <ClassificationChip value={c.classification} />
                      <span>· {c.replies} replies on YouTube</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Operations & Audit Stream */}
        <section className="space-y-4">
          <SectionTitle
            title="🛡️ Live Shield Operations Log"
            subtitle="Real-time audit trail of actions handled by the Guardian."
            action={
              <Button asChild size="sm" variant="ghost">
                <Link to="/app/activity">View All</Link>
              </Button>
            }
          />
          <div className="ghost-panel divide-y divide-white/5 p-2">
            {activity.slice(0, 4).map((act) => (
              <div key={act.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{act.label}</p>
                  <p className="text-[11px] text-[#8f97b0] truncate mt-0.5">{act.detail || 'Executed autonomously'}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Chip variant={act.published ? 'positive' : 'outline'}>
                    {act.finalAction}
                  </Chip>
                  <span className="text-[10px] text-[#8f97b0]">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* QUICK WORKSPACE CONTROLS */}
      <section className="ghost-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-white">Guardian Mode Shortcuts</h3>
            <p className="text-xs text-[#8f97b0]">Switch your response automation level instantly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['copilot', 'autopilot', 'guardian'].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={settings.mode === m ? 'default' : 'outline'}
                onClick={() => updateSettings({ mode: m })}
                className="capitalize text-xs"
              >
                {m === 'copilot' && '🧑‍✈️ '}
                {m === 'autopilot' && '⚡ '}
                {m === 'guardian' && '🛡️ '}
                {m} Mode
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
