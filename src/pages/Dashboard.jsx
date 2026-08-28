import React, { useMemo } from 'react';
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
  Pause,
  Play,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  FolderPlus,
} from 'lucide-react';
import {
  Button,
  Chip,
  ClassificationChip,
  HumanMomentChip,
  PriorityChip,
  RiskChip,
  RuleSignalChip,
  SectionTitle,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import {
  getGuardianSummary,
  getNeedsYouItems,
  getHandledSummary,
} from '../domain/intelligence/intelligenceEngine';
import { isHumanMoment } from '../components/comments/CommentPriority';

export default function Dashboard() {
  const {
    comments,
    commenters,
    commentStates,
    settings,
    updateSettings,
    approve,
    regenerate,
    contentOpportunities,
    updateOpportunityStatus,
    showToast,
  } = useGuardian();

  // Domain derived selectors
  const summary = useMemo(
    () => getGuardianSummary(comments, commentStates),
    [comments, commentStates]
  );
  const needsYouList = useMemo(
    () => getNeedsYouItems(comments, commentStates),
    [comments, commentStates]
  );
  const handledSummary = useMemo(
    () => getHandledSummary(comments, commentStates),
    [comments, commentStates]
  );

  // Surface top Human Moment if present
  const topHumanMoment = useMemo(() => {
    return comments.find((c) => isHumanMoment(c));
  }, [comments]);

  const topHumanMomentAuthor = useMemo(() => {
    if (!topHumanMoment) return null;
    return commenters.find((p) => p.id === topHumanMoment.commenterId);
  }, [topHumanMoment, commenters]);

  // Top Audience Content Opportunity
  const topOpportunity = contentOpportunities?.[0] || {
    id: 'opp1',
    title: 'Full Episode on Panpsychism',
    mentions: 137,
    evidence: '137 comments mentioned it this week. Viewers want to unpack the combination problem.',
    suggestedAngle: 'Lead directly with the objections Ep. 148 skipped.',
    trend: '+41% this week',
    status: 'new',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. CREATOR BRIEFING HERO */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#4de1dc]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Creator Briefing
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-white">
              While you were away
            </h1>
            <p className="text-sm sm:text-base text-[#e4e7f1] max-w-2xl leading-relaxed">
              {summary.narrative}
            </p>
          </div>

          {/* Quick Actions & Emergency Pause */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild size="md">
              <Link to="/app/inbox" className="gap-2">
                <MessageSquare size={16} /> Open Inbox ({summary.needsYouCount})
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => {
                const nextState = !settings.paused;
                updateSettings({ paused: nextState });
                showToast(
                  nextState ? 'Guardian protection paused.' : 'Guardian active and shielding.',
                  nextState ? 'warning' : 'info'
                );
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                settings.paused
                  ? 'border-[#fbbf24] bg-[#fbbf24]/15 text-[#fbbf24]'
                  : 'border-white/10 bg-[#1e2235] text-[#8f97b0] hover:text-white'
              }`}
            >
              {settings.paused ? <Play size={14} /> : <Pause size={14} />}
              {settings.paused ? 'Resume Guardian' : 'Pause Shield'}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8f97b0]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Shield size={14} className={settings.paused ? 'text-[#fbbf24]' : 'text-[#4de1dc]'} />
              Status: <strong className="text-[#4de1dc] uppercase">{settings.mode}</strong>
            </span>
            <span>·</span>
            <span>Shield Vault: Active</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Estimated Attention Protected:</span>
            <Chip variant="positive">~{handledSummary.estimatedMinutesSaved} minutes</Chip>
          </div>
        </div>
      </div>

      {/* 2. SECTION: NEEDS YOU */}
      <section className="space-y-4">
        <SectionTitle
          title="⚠️ Needs You"
          subtitle="The highest-value conversations: emotional disclosures, critical safety issues, and questions awaiting creator judgment."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/app/inbox" className="gap-1.5">
                Review in Inbox ({needsYouList.length}) <ArrowRight size={14} />
              </Link>
            </Button>
          }
        />

        {needsYouList.length === 0 ? (
          <div className="ghost-panel p-6 text-center text-sm text-[#8f97b0]">
            ✨ All clear! Nothing currently requires your direct intervention.
          </div>
        ) : (
          <div className="space-y-3">
            {needsYouList.slice(0, 3).map((comment) => {
              const person = commenters.find((p) => p.id === comment.commenterId);
              const isHuman = isHumanMoment(comment);
              const isThreat = comment.classification === 'THREAT' || comment.risk === 'critical';

              return (
                <div
                  key={comment.id}
                  className={`ghost-panel p-5 transition-all ${
                    isHuman
                      ? 'border-[#c084fc]/40 bg-[#c084fc]/5'
                      : isThreat
                      ? 'border-[#f87171]/40 bg-[#f87171]/5'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isHuman
                            ? 'bg-[#c084fc]/20 text-[#c084fc]'
                            : 'bg-[#1e2235] text-[#4de1dc]'
                        }`}
                      >
                        {person?.displayName?.[0] || '?'}
                      </div>
                      <span className="font-bold text-sm text-white truncate">
                        {person?.displayName || 'User'}
                      </span>
                      {isHuman && <HumanMomentChip />}
                      <ClassificationChip value={comment.classification} />
                      <RiskChip risk={comment.risk} />
                    </div>

                    <span className="text-xs text-[#8f97b0]">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-white leading-relaxed">"{comment.text}"</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                    <span className="text-[#8f97b0] italic">
                      {isHuman
                        ? '🤍 Human Moment — Ghost Guardian holds this for your authentic voice.'
                        : `⚠️ Guardian Note: ${comment.reasoningSummary}`}
                    </span>

                    <Button asChild size="sm" variant={isHuman ? 'default' : 'outline'}>
                      <Link to="/app/inbox">Triage in Inbox</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SECTION: GUARDIAN HANDLED (ATTENTION PROTECTED FRAMING) */}
      <section className="ghost-panel p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#34d399]" />
            <h3 className="font-display text-base text-white">Your Attention Was Protected</h3>
          </div>
          <span className="text-xs text-[#8f97b0]">
            Autonomous Guardian filtering & strategic silence
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Spam Filtered</span>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {handledSummary.spamCount}
            </p>
            <p className="text-[11px] text-[#34d399] mt-0.5">Isolated from notification feed</p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Troll Bait Silenced</span>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {handledSummary.trollingCount}
            </p>
            <p className="text-[11px] text-[#8f97b0] mt-0.5">Left unanswered strategically</p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Routine Triaged</span>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {handledSummary.routineCount}
            </p>
            <p className="text-[11px] text-[#4de1dc] mt-0.5">Acknowledged in voice</p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Hostile Shielded</span>
            <p className="text-2xl font-display font-bold text-white mt-1">
              {handledSummary.shieldedCount}
            </p>
            <p className="text-[11px] text-[#818cf8] mt-0.5">Concealed in Shield Vault</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-[#8f97b0]">
          <span>~{handledSummary.estimatedMinutesSaved} minutes of creator cognitive load saved</span>
          <Link to="/app/inbox" className="text-[#4de1dc] hover:underline">
            Inspect Handled Records in Inbox →
          </Link>
        </div>
      </section>

      {/* 4. SECTION: HUMAN MOMENT SPOTLIGHT */}
      {topHumanMoment && (
        <section className="ghost-panel p-6 sm:p-8 border-[#c084fc]/35 bg-gradient-to-r from-[#19142e]/90 to-[#121422]/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-[#c084fc]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                Someone shared something personal
              </span>
            </div>
            <Chip variant="human">Worth hearing personally</Chip>
          </div>

          <div className="space-y-2">
            <p className="text-sm sm:text-base text-white leading-relaxed font-normal">
              "{topHumanMoment.text}"
            </p>
            <p className="text-xs text-[#8f97b0]">
              From <strong className="text-white">{topHumanMomentAuthor?.displayName}</strong> · Ghost Guardian left this un-automated so you can respond with genuine human connection.
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#8f97b0]">
              No automated draft will be sent without your explicit choice.
            </span>
            <Button asChild size="sm">
              <Link to="/app/inbox">Open Human Moments</Link>
            </Button>
          </div>
        </section>
      )}

      {/* 5. TWO-COLUMN: AUDIENCE SIGNAL & CONTENT OPPORTUNITY */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AUDIENCE SIGNAL */}
        <section className="ghost-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-[#fbbf24]" />
              <h3 className="font-display text-base text-white">Your Audience Keeps Asking</h3>
            </div>
            <Chip variant="attention">Recurring Inquiry</Chip>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-sm font-bold text-white block">
              "Will you do a full episode on panpsychism?"
            </span>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              Multiple viewers are asking for the full philosophical counter-arguments skipped in Ep. 148.
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
            <span className="text-[#34d399] font-medium">+41% inquiry momentum</span>
            <Link to="/app/audience" className="text-[#4de1dc] hover:underline">
              View Audience Intelligence →
            </Link>
          </div>
        </section>

        {/* CONTENT OPPORTUNITY ROADMAP CARD */}
        <section className="ghost-panel p-6 space-y-4 border-[#4de1dc]/30 bg-gradient-to-br from-[#121b24]/90 to-[#121422]/95">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-[#4de1dc]" />
              <h3 className="font-display text-base text-white">Content Opportunity</h3>
            </div>
            <Chip variant="guardian">Actionable</Chip>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-sm font-bold text-white block">
              "{topOpportunity.title}"
            </span>
            <p className="text-xs text-[#e4e7f1] leading-relaxed">
              {topOpportunity.evidence}
            </p>
            <div className="text-[11px] text-[#8f97b0] pt-1">
              Suggested: <strong className="text-white">Short Explainer → Deep Dive Episode</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
            <button
              type="button"
              onClick={() => {
                updateOpportunityStatus(topOpportunity.id, 'saved');
                showToast('Opportunity saved to Content Roadmap.', 'success');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#4de1dc] hover:underline cursor-pointer"
            >
              <FolderPlus size={13} /> Save to Roadmap
            </button>
            <Link to="/app/audience" className="text-[#4de1dc] hover:underline">
              Explore All Opportunities →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
