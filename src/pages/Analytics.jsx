import React, { useMemo } from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  Edit3,
  RefreshCw,
  EyeOff,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Heart,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import {
  Chip,
  SectionTitle,
  StatBlock,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import { getAnalyticsSummary } from '../domain/intelligence/intelligenceEngine';

export default function Analytics() {
  const { comments, commentStates, activity, sentimentTrend } = useGuardian();

  const stats = useMemo(
    () => getAnalyticsSummary(comments, commentStates, activity),
    [comments, commentStates, activity]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <SectionTitle
        title="Guardian Impact & Attention Analytics"
        subtitle="Transparent evaluation of attention protected, creator cognitive energy saved, and voice calibration quality."
      />

      {/* 1. ATTENTION PROTECTED HERO STATS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          label="Total Comments Analyzed"
          value={stats.commentsAnalyzed}
          hint="Processed through rule pipeline"
        />
        <StatBlock
          label="Handled Without Distraction"
          value={stats.totalHandled}
          tone="positive"
          hint="Autonomous filters + silence"
        />
        <StatBlock
          label="Hostile Material Shielded"
          value={stats.shieldedHostile}
          tone={stats.shieldedHostile > 0 ? 'attention' : 'positive'}
          hint="Concealed in Shield Vault"
        />
        <StatBlock
          label="Estimated Attention Saved"
          value={`~${stats.estimatedMinutesSaved} min`}
          tone="positive"
          hint="Based on standard review time"
        />
      </div>

      {/* 2. CREATOR TIME & ESTIMATE DISCLOSURE */}
      <section className="ghost-panel p-6 sm:p-8 space-y-4 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 to-[#121422]/95">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#4de1dc]" />
            <h3 className="font-display text-base text-white">Estimated Creator Attention Protected</h3>
          </div>
          <Chip variant="guardian">Demo Intelligence</Chip>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Replies Approved</span>
            <p className="text-2xl font-display font-bold text-white mt-1">{stats.approved + stats.edited}</p>
            <p className="text-[11px] text-[#34d399] mt-0.5">~3 min per reply avoided</p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Spam & Bait Silenced</span>
            <p className="text-2xl font-display font-bold text-white mt-1">{stats.silenced + stats.spamFiltered}</p>
            <p className="text-[11px] text-[#8f97b0] mt-0.5">~2 min cognitive drain avoided</p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-[#0d0f17]/70">
            <span className="text-[10px] uppercase text-[#8f97b0] font-bold">Total Estimated Time</span>
            <p className="text-2xl font-display font-bold text-[#4de1dc] mt-1">~{stats.estimatedMinutesSaved} min</p>
            <p className="text-[11px] text-[#8f97b0] mt-0.5">Cumulative time protected</p>
          </div>
        </div>

        <p className="text-xs text-[#8f97b0] pt-2 border-t border-white/5 italic">
          ℹ️ Estimated attention protected is calculated deterministically from handled actions in your current workspace, assuming ~3 minutes saved per handled interaction.
        </p>
      </section>

      {/* 3. TWO-COLUMN: RESPONSE QUALITY & GUARDIAN DECISIONS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RESPONSE QUALITY & VOICE ALIGNMENT */}
        <section className="ghost-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#c084fc]" />
              <h3 className="font-display text-base text-white">Voice Calibration & Alignment</h3>
            </div>
            <Chip variant="human">{stats.voiceAlignmentRate}% alignment</Chip>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                <span>Approved Without Edits</span>
                <span className="text-[#34d399] font-mono">{stats.voiceAlignmentRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1e2235] overflow-hidden">
                <div
                  className="h-full bg-[#34d399] rounded-full transition-all duration-500"
                  style={{ width: `${stats.voiceAlignmentRate}%` }}
                />
              </div>
              <p className="text-[11px] text-[#8f97b0] mt-1">
                Drafts approved with zero creator modifications
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                <span>Edited Before Publishing</span>
                <span className="text-[#4de1dc] font-mono">{stats.editRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1e2235] overflow-hidden">
                <div
                  className="h-full bg-[#4de1dc] rounded-full transition-all duration-500"
                  style={{ width: `${stats.editRate}%` }}
                />
              </div>
              <p className="text-[11px] text-[#8f97b0] mt-1">
                Drafts fine-tuned and saved back into your Voice Library
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
            <span>Model learns from every approved calibration.</span>
          </div>
        </section>

        {/* GUARDIAN DECISION DISTRIBUTION */}
        <section className="ghost-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#4de1dc]" />
              <h3 className="font-display text-base text-white">Guardian Decision Distribution</h3>
            </div>
            <Chip variant="outline">{stats.decisions.length} decision categories</Chip>
          </div>

          <div className="space-y-3">
            {stats.decisions.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0d0f17]/60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{d.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white">{d.count}</span>
                  <Chip variant={d.tone} className="text-[10px]">
                    {d.count > 0 ? 'Active' : 'Zero'}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. SENTIMENT TREND VIEW */}
      <section className="ghost-panel p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div>
            <h3 className="font-display text-base text-white">Community Sentiment Trend</h3>
            <p className="text-xs text-[#8f97b0] mt-0.5">
              Rule-based sentiment distribution over the past 7 days.
            </p>
          </div>
          <Chip variant="positive">72% positive peak</Chip>
        </div>

        <div className="space-y-3 pt-2">
          {sentimentTrend.map((d) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="w-10 text-xs font-mono text-[#8f97b0] font-semibold">{d.day}</span>
              <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-[#1e2235]">
                <span
                  style={{ width: `${d.positive}%` }}
                  className="bg-[#34d399]"
                  title={`Positive: ${d.positive}%`}
                />
                <span
                  style={{ width: `${d.neutral}%` }}
                  className="bg-[#8f97b0]/40"
                  title={`Neutral: ${d.neutral}%`}
                />
                <span
                  style={{ width: `${d.negative}%` }}
                  className="bg-[#f87171]"
                  title={`Negative: ${d.negative}%`}
                />
              </div>
              <span className="w-14 text-right text-xs font-mono text-white font-bold">
                {d.positive}% pos
              </span>
            </div>
          ))}

          <div className="flex items-center justify-end gap-4 text-[11px] text-[#8f97b0] pt-3 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#34d399]" /> Positive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#8f97b0]/50" /> Neutral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#f87171]" /> Critical
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
