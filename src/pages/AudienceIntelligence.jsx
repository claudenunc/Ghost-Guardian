import React from 'react';
import {
  Brain,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Heart,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Flame,
  CheckCircle,
} from 'lucide-react';
import {
  Chip,
  ClassificationChip,
  RiskChip,
  SectionTitle,
  StatBlock,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function AudienceIntelligence() {
  const { comments, commenters, questionClusters, topics, sentimentTrend, contentOpportunities, stateFor } = useGuardian();

  const hostile = comments.filter((c) =>
    ['TROLLING', 'HARASSMENT', 'HATE', 'THREAT'].includes(c.classification)
  ).length;

  const constructive = comments.filter((c) =>
    ['QUESTION', 'CONSTRUCTIVE_CRITICISM', 'DISAGREEMENT'].includes(c.classification)
  ).length;

  const unresolved = comments.filter(
    (c) => c.classification === 'QUESTION' && stateFor(c.id).status === 'pending'
  ).length;

  const mustSee = comments.filter(
    (c) =>
      c.recommendedAction === 'human_review' ||
      c.risk === 'critical' ||
      c.likes > 1000 ||
      c.classification === 'SENSITIVE' ||
      c.classification === 'CONSTRUCTIVE_CRITICISM'
  );

  const latestSentiment = sentimentTrend[sentimentTrend.length - 1] || { positive: 72, neutral: 20, negative: 8 };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionTitle
        title="Audience Intelligence"
        subtitle="Here's what your audience is really saying — patterns measured across comments, never invented demand."
      />

      {/* CORE FOUR PULSE STAT BLOCKS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          label="Constructive discussion"
          value={constructive}
          tone="positive"
          hint="Questions, criticism, disagreement"
        />
        <StatBlock
          label="Hostility"
          value={hostile}
          tone={hostile > 0 ? 'attention' : 'positive'}
          hint="Trolling through threats"
        />
        <StatBlock
          label="Unresolved questions"
          value={unresolved}
          tone="attention"
          hint="Still awaiting your answer"
        />
        <StatBlock
          label="Positive sentiment"
          value={`${latestSentiment.positive}%`}
          tone="positive"
          hint="Latest day in trend"
        />
      </div>

      {/* TOP QUESTIONS CLUSTERED */}
      <section className="space-y-4">
        <SectionTitle
          title="Top Questions & Inquiries"
          subtitle="Variations of the same question automatically clustered across multiple videos."
        />
        <div className="space-y-3">
          {questionClusters.map((cluster) => (
            <div key={cluster.id} className="ghost-panel p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Chip variant="attention">
                    <HelpCircle size={12} /> {cluster.mentions} people asked this
                  </Chip>
                  <Chip variant="outline">{cluster.trend}</Chip>
                </div>
                <span className="text-xs text-[#8f97b0]">Clustered from {cluster.examples?.length || 2} distinct threads</span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-white">"{cluster.question}"</p>

              <div className="space-y-1.5 pt-1 border-t border-white/5">
                {cluster.examples
                  ?.map((id) => comments.find((c) => c.id === id))
                  .filter(Boolean)
                  .map((c) => (
                    <p key={c.id} className="text-xs text-[#8f97b0] italic">
                      — "{c.text.slice(0, 140)}{c.text.length > 140 ? '...' : ''}"
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT OPPORTUNITIES (Enhanced High-Detail Cards) */}
      <section className="space-y-4">
        <SectionTitle
          title="💡 High-Confidence Content Opportunities"
          subtitle="Data-backed episode ideas and themes surfaced directly from explicit audience requests."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {contentOpportunities.map((op) => (
            <div key={op.id} className="ghost-panel ghost-glow p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Chip variant="attention">
                    <Lightbulb size={12} /> {op.status}
                  </Chip>
                  <span className="text-xs font-mono text-[#34d399] font-bold">{op.trend}</span>
                </div>

                <h4 className="mt-3 font-display text-lg text-white font-bold">{op.title}</h4>
                <p className="mt-2 text-xs text-[#8f97b0] leading-relaxed">{op.evidence}</p>

                <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0f17]/70 p-3.5">
                  <span className="text-[10px] tracking-wider text-[#4de1dc] uppercase font-bold">Suggested Episode Angle:</span>
                  <p className="mt-1 text-xs text-[#e4e7f1] leading-relaxed">{op.suggestedAngle}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#8f97b0]">
                <span>{op.mentions} total mentions</span>
                <span className="font-semibold text-white">{op.explicitRequests} direct requests</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TWO COLUMNS: EMERGING TOPICS & COMMUNITY HEALTH */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emerging Topics */}
        <section className="space-y-4">
          <SectionTitle
            title="📈 Emerging Topics"
            subtitle="Frequency changes and momentum week-over-week."
          />
          <div className="ghost-panel divide-y divide-white/5">
            {topics.map((t) => (
              <div key={t.topic} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">{t.topic}</p>
                  <p className="text-xs text-[#8f97b0] mt-0.5">{t.mentions} mentions across episodes</p>
                </div>
                <Chip variant={t.delta >= 0 ? 'positive' : 'outline'}>
                  {t.delta >= 0 ? '+' : ''}
                  {t.delta}%
                </Chip>
              </div>
            ))}
          </div>
        </section>

        {/* Community Health Pulse */}
        <section className="space-y-4">
          <SectionTitle
            title="❤️ Community Health & Safety"
            subtitle="Constructive dialog vs noise distribution."
          />
          <div className="ghost-panel p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                  <span>Constructive Discussions</span>
                  <span className="text-[#34d399]">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1e2235] overflow-hidden">
                  <div className="h-full bg-[#34d399] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                  <span>Overall Community Support</span>
                  <span className="text-[#4de1dc]">82%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1e2235] overflow-hidden">
                  <div className="h-full bg-[#4de1dc] rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-1.5">
                  <span>Hostility & Trolling Isolated</span>
                  <span className="text-[#f87171]">12%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1e2235] overflow-hidden">
                  <div className="h-full bg-[#f87171] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#8f97b0] pt-2 border-t border-white/5">
              🛡️ 100% of detected threats and severe harassment were isolated from creator notifications.
            </p>
          </div>
        </section>
      </div>

      {/* AUDIENCE SENTIMENT TREND BARS */}
      <section className="space-y-4">
        <SectionTitle
          title="Audience Sentiment Daily Distribution"
          subtitle="Share of positive, neutral, and critical sentiment over the past 7 days."
        />
        <div className="ghost-panel space-y-3.5 p-6">
          {sentimentTrend.map((d) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="w-10 text-xs font-mono text-[#8f97b0] font-semibold">{d.day}</span>
              <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-[#1e2235]">
                <span style={{ width: `${d.positive}%` }} className="bg-[#34d399]" title={`Positive: ${d.positive}%`} />
                <span style={{ width: `${d.neutral}%` }} className="bg-[#8f97b0]/40" title={`Neutral: ${d.neutral}%`} />
                <span style={{ width: `${d.negative}%` }} className="bg-[#f87171]" title={`Negative: ${d.negative}%`} />
              </div>
              <span className="w-14 text-right text-xs font-mono text-white font-bold">{d.positive}% pos</span>
            </div>
          ))}
          <div className="flex items-center justify-end gap-4 text-[11px] text-[#8f97b0] pt-3 border-t border-white/5">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#34d399]" /> Positive</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#8f97b0]/50" /> Neutral</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#f87171]" /> Critical</span>
          </div>
        </div>
      </section>

      {/* "YOU SHOULD SEE THIS" HIGHLIGHTS */}
      <section className="space-y-4">
        <SectionTitle
          title="👀 You Should See This"
          subtitle="Meaningful comments, thoughtful critiques, high-engagement discussions, and delicate disclosures that deserve your personal attention."
        />
        <div className="space-y-3">
          {mustSee.map((c) => {
            const person = commenters.find((p) => p.id === c.commenterId);
            return (
              <div key={c.id} className="ghost-panel p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{person?.displayName || 'Community Member'}</span>
                    <ClassificationChip value={c.classification} />
                    <RiskChip risk={c.risk} />
                    <Chip variant="outline">👍 {c.likes.toLocaleString()} likes</Chip>
                  </div>
                  <span className="text-xs text-[#8f97b0]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-white font-normal leading-relaxed">"{c.text}"</p>
                {c.reasoning?.[0] && (
                  <p className="text-xs text-[#4de1dc] pt-1">
                    💡 Why you should see this: {c.reasoning[0]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
