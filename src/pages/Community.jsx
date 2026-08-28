import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Star,
  Heart,
  TrendingUp,
  Award,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Chip,
  EmptyState,
  SectionTitle,
  StatBlock,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import { getCommunityRelationships } from '../domain/intelligence/intelligenceEngine';

export default function Community() {
  const { commenters, comments } = useGuardian();
  const [tab, setTab] = useState('all');

  const relationships = useMemo(
    () => getCommunityRelationships(commenters, comments),
    [commenters, comments]
  );

  const displayedMembers = useMemo(() => {
    if (tab === 'supporters') return relationships.supporters;
    if (tab === 'returning') return relationships.returning;
    if (tab === 'critics') return relationships.constructiveCritics;
    if (tab === 'human') return relationships.humanConnections;
    if (tab === 'risks') return relationships.boundaryRisks;
    return [
      ...relationships.humanConnections,
      ...relationships.constructiveCritics,
      ...relationships.returning,
      ...relationships.supporters,
      ...relationships.boundaryRisks,
    ];
  }, [tab, relationships]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#4de1dc]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Relationship Intelligence
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
              Community Roster & Relationship Patterns
            </h1>
            <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
              Understand recurring audience relationships: loyal supporters, thoughtful intellectual critics, deep human connections, and detected boundary risks.
            </p>
          </div>

          <Chip variant="guardian" className="font-bold">
            🛡️ {commenters.length} Tracked Contributors
          </Chip>
        </div>
      </div>

      {/* RELATIONSHIP METRIC STATS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatBlock
          label="Human Connections"
          value={relationships.humanConnections.length}
          tone="positive"
          hint="Shared personal impact"
        />
        <StatBlock
          label="Constructive Critics"
          value={relationships.constructiveCritics.length}
          tone="guardian"
          hint="Thoughtful skeptics"
        />
        <StatBlock
          label="Returning Voices"
          value={relationships.returning.length}
          hint="Multi-episode loyalty"
        />
        <StatBlock
          label="Supporters"
          value={relationships.supporters.length}
          tone="positive"
          hint="Positive contributors"
        />
        <StatBlock
          label="Boundary Risks"
          value={relationships.boundaryRisks.length}
          tone={relationships.boundaryRisks.length > 0 ? 'attention' : 'default'}
          hint="Repeated disruption"
        />
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'all', label: `All Profiles (${commenters.length})`, icon: Users },
          { id: 'human', label: `Human Connections (${relationships.humanConnections.length})`, icon: Heart },
          { id: 'critics', label: `Constructive Critics (${relationships.constructiveCritics.length})`, icon: Star },
          { id: 'returning', label: `Returning Voices (${relationships.returning.length})`, icon: TrendingUp },
          { id: 'supporters', label: `Supporters (${relationships.supporters.length})`, icon: Award },
          { id: 'risks', label: `Boundary Risks (${relationships.boundaryRisks.length})`, icon: ShieldAlert },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                active
                  ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc] shadow-[0_0_12px_rgba(77,225,220,0.15)]'
                  : 'border-white/10 bg-[#1e2235] text-[#8f97b0] hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMMUNITY RELATIONSHIP CARDS */}
      {displayedMembers.length === 0 ? (
        <EmptyState>No community contributors found in this category.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedMembers.map((m) => {
            const memberComments = comments.filter((c) => c.commenterId === m.id);
            const isRisk = m.relationshipType === 'Boundary Risk';
            const isHuman = m.relationshipType === 'Human Connection';

            return (
              <div
                key={m.id}
                className={`ghost-panel p-5 flex flex-col justify-between space-y-4 border ${
                  isHuman
                    ? 'border-[#c084fc]/35 bg-[#c084fc]/5'
                    : isRisk
                    ? 'border-[#f87171]/35 bg-[#f87171]/5'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display text-base font-bold text-white">{m.displayName}</h4>
                      <p className="text-xs font-mono text-[#8f97b0]">{m.handle}</p>
                    </div>
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isHuman
                          ? 'bg-[#c084fc]/20 text-[#c084fc]'
                          : isRisk
                          ? 'bg-[#f87171]/20 text-[#f87171]'
                          : 'bg-[#4de1dc]/15 text-[#4de1dc]'
                      }`}
                    >
                      {m.displayName?.[0] || '?'}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[#8f97b0] font-medium">
                    {m.episodesParticipated || 1} episodes · {m.interactions || memberComments.length} interactions
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Chip
                      variant={
                        isHuman
                          ? 'human'
                          : isRisk
                          ? 'critical'
                          : m.relationshipType === 'Constructive Critic'
                          ? 'attention'
                          : 'guardian'
                      }
                    >
                      {m.relationshipType}
                    </Chip>
                    {m.tags?.slice(0, 2).map((tag) => (
                      <Chip key={tag} variant="outline">
                        {tag}
                      </Chip>
                    ))}
                  </div>

                  {m.evidenceNote && (
                    <div className="mt-3 rounded-xl border border-white/5 bg-[#0d0f17]/50 p-3 text-xs text-[#e4e7f1] leading-relaxed">
                      📌 {m.evidenceNote}
                    </div>
                  )}
                </div>

                {memberComments.length > 0 && (
                  <div className="pt-3 border-t border-white/5 text-[11px] text-[#8f97b0]">
                    <span className="font-semibold text-white">Recent interaction:</span>
                    <p className="mt-1 italic line-clamp-2">"{memberComments[0].text}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
