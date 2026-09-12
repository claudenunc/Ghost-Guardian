import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  Heart,
  HelpCircle,
  FolderPlus,
} from 'lucide-react';
import {
  Button,
  Chip,
  ClassificationChip,
  HumanMomentChip,
  SectionTitle,
  EmptyState,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import {
  getAudienceSignals,
} from '../domain/intelligence/intelligenceEngine';

export default function AudienceIntelligence() {
  const {
    comments = [],
    commenters = [],
    questionClusters = [],
    topics = [],
    contentOpportunities = [],
    updateOpportunityStatus,
    showToast,
  } = useGuardian();

  const signals = useMemo(
    () => getAudienceSignals(comments, questionClusters, topics),
    [comments, questionClusters, topics]
  );

  const [activeRoadmapFilter, setActiveRoadmapFilter] = useState('all');

  const filteredOpportunities = useMemo(() => {
    if (!Array.isArray(contentOpportunities)) return [];
    if (activeRoadmapFilter === 'all') return contentOpportunities;
    return contentOpportunities.filter((op) => (op.status || 'new').toLowerCase() === activeRoadmapFilter);
  }, [contentOpportunities, activeRoadmapFilter]);

  const handleStatusChange = (id, newStatus) => {
    updateOpportunityStatus?.(id, newStatus);
    showToast?.(`Opportunity marked as ${newStatus.toUpperCase()}.`, 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-[#FF007A]/20 bg-[#000000] shadow-[0_0_32px_rgba(255,0,122,0.06)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#FF007A]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#FF007A] uppercase font-mono">
                Content Strategy Intelligence
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
              Your audience is already telling you what to make
            </h1>
            <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
              Synthesizing recurring questions, constructive critique, and personal human disclosures into an actionable content roadmap.
            </p>
          </div>

          <Chip variant="human" className="font-bold">
            {contentOpportunities.length} Active Opportunities
          </Chip>
        </div>
      </div>

      {/* 1. WHAT PEOPLE ARE ASKING (RECURRING QUESTION CLUSTERS) */}
      <section className="space-y-4">
        <SectionTitle
          title="Recurring Question Clusters"
          subtitle="Recurring community questions automatically clustered across videos with evidence threads."
        />

        {signals.topQuestions.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No recurring question clusters yet"
            description="Ghost Guardian groups recurring questions once comments are ingested across your videos."
          />
        ) : (
          <div className="space-y-3">
            {signals.topQuestions.map((cluster) => (
              <div key={cluster.id} className="ghost-panel p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Chip variant="attention">
                      <HelpCircle size={12} /> {cluster.mentions} people asked this
                    </Chip>
                    <span className="text-xs font-mono text-[#00FF66] font-semibold">{cluster.momentum}</span>
                  </div>
                  <Chip variant="outline" className="text-xs">
                    {cluster.theme}
                  </Chip>
                </div>

                <h4 className="font-display text-base sm:text-lg text-white font-bold">
                  "{cluster.canonicalQuestion}"
                </h4>

                <div className="rounded-xl border border-white/5 bg-[#0d0f17]/70 p-3 text-xs text-[#8f97b0] italic">
                  Example: "{cluster.evidenceSnippet}"
                </div>

                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#8f97b0]">
                    Action: <strong className="text-white">{cluster.suggestedAction}</strong>
                  </span>
                  <Link to="/app/inbox" className="text-xs text-[#0200F1] hover:underline">
                    View Associated Comments →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. CONTENT ROADMAP & ACTIONABLE OPPORTUNITIES */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Content Opportunities Roadmap"
            subtitle="High-potential topics synthesized from repeated requests and unaddressed objections."
          />

          {/* Roadmap Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0d0f17] border border-white/10 text-xs">
            {['all', 'new', 'saved', 'planned', 'published'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveRoadmapFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  activeRoadmapFilter === filter
                    ? 'bg-[#0200F1] text-white shadow-md'
                    : 'text-[#8f97b0] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="No content opportunities detected"
            description="Opportunities will be synthesized as viewers ask for specific topics, clarifications, and deep dives."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {filteredOpportunities.map((op) => (
              <div
                key={op.id}
                className="ghost-panel ghost-glow p-6 flex flex-col justify-between space-y-4 border-white/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Chip variant="attention">
                      <Lightbulb size={12} /> {op.status || 'new'}
                    </Chip>
                    <span className="text-xs font-mono text-[#00FF66] font-bold">{op.trend}</span>
                  </div>

                  <h4 className="mt-3 font-display text-base sm:text-lg text-white font-bold">
                    {op.title}
                  </h4>
                  <p className="mt-2 text-xs text-[#8f97b0] leading-relaxed">{op.evidence}</p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0f17]/70 p-3.5 space-y-1">
                    <span className="text-[10px] tracking-wider text-[#0200F1] uppercase font-bold">
                      Suggested Format & Angle:
                    </span>
                    <p className="text-xs text-[#e4e7f1] leading-relaxed">{op.suggestedAngle}</p>
                  </div>
                </div>

                {/* Action bar and status selector */}
                <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#8f97b0]">
                    <span>{op.mentions} mentions</span>
                    <span className="font-semibold text-white">{op.explicitRequests} direct asks</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <select
                      value={op.status || 'new'}
                      onChange={(e) => handleStatusChange(op.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0d0f17] px-2.5 py-1 text-xs text-white font-semibold focus:outline-none"
                    >
                      <option value="new">Status: New</option>
                      <option value="saved">Status: Saved</option>
                      <option value="exploring">Status: Exploring</option>
                      <option value="planned">Status: Planned</option>
                      <option value="published">Status: Published</option>
                      <option value="dismissed">Status: Dismissed</option>
                    </select>

                    <Link to="/app/inbox" className="text-xs text-[#0200F1] hover:underline">
                      View Evidence →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. TWO COLUMNS: HUMAN SIGNALS & CONSTRUCTIVE SIGNALS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* HUMAN SIGNALS */}
        <section className="space-y-4">
          <SectionTitle
            title="Human Signals"
            subtitle="Gratitude, personal impact, and emotional connections separated from ordinary metrics."
          />

          {signals.humanSignals.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No human moments flagged"
              description="Meaningful viewer disclosures and personal impact comments will appear here."
            />
          ) : (
            <div className="space-y-3">
              {signals.humanSignals.map((c) => {
                const person = commenters.find((p) => p.id === c.commenterId);
                return (
                  <div
                    key={c.id}
                    className="ghost-panel p-4 space-y-2 border-[#FF007A]/20 bg-[#000000]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{person?.displayName || c.author || 'Viewer'}</span>
                      <HumanMomentChip />
                    </div>
                    <p className="text-xs sm:text-sm text-white italic leading-relaxed">
                      "{c.text}"
                    </p>
                    <div className="flex justify-end pt-1">
                      <Link to="/app/inbox" className="text-[11px] text-[#FF007A] hover:underline">
                        Open in Inbox →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CONSTRUCTIVE SIGNALS */}
        <section className="space-y-4">
          <SectionTitle
            title="Constructive Feedback"
            subtitle="Substantive pushback, counter-arguments, and requests for depth."
          />

          {signals.constructiveSignals.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No constructive critique yet"
              description="Substantive intellectual feedback and counter-arguments will cluster here."
            />
          ) : (
            <div className="space-y-3">
              {signals.constructiveSignals.map((c) => {
                const person = commenters.find((p) => p.id === c.commenterId);
                return (
                  <div key={c.id} className="ghost-panel p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{person?.displayName || c.author || 'Viewer'}</span>
                      <ClassificationChip value={c.classification} />
                    </div>
                    <p className="text-xs sm:text-sm text-white italic leading-relaxed">
                      "{c.text}"
                    </p>
                    <div className="flex justify-end pt-1">
                      <Link to="/app/inbox" className="text-[11px] text-[#0200F1] hover:underline">
                        Review Thread →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
