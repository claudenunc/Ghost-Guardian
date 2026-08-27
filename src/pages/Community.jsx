import React, { useState } from 'react';
import {
  Users,
  Star,
  Heart,
  TrendingUp,
  Award,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  Chip,
  EmptyState,
  SectionTitle,
  StatBlock,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function Community() {
  const { commenters, comments } = useGuardian();
  const [tab, setTab] = useState('all');

  const members = [...commenters].filter((m) => {
    if (tab === 'frequent') return m.episodesParticipated >= 10 || m.interactions >= 20;
    if (tab === 'returning') return m.tags.includes('Returning member') || m.episodesParticipated >= 5;
    if (tab === 'thoughtful') return m.tags.some((t) => ['Thoughtful contributor', 'Intelligent skeptic', 'Critical but constructive', 'Builder'].includes(t));
    if (tab === 'new') return m.tags.includes('New supporter') || m.tags.includes('First-time commenter') || m.episodesParticipated === 1;
    return true;
  });

  const frequentCount = commenters.filter((m) => m.episodesParticipated >= 10 || m.interactions >= 20).length;
  const returningCount = commenters.filter((m) => m.tags.includes('Returning member') || m.episodesParticipated >= 5).length;
  const thoughtfulCount = commenters.filter((m) => m.tags.some((t) => ['Thoughtful contributor', 'Intelligent skeptic', 'Critical but constructive', 'Builder'].includes(t))).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionTitle
        title="Community Roster & VIP Supporters"
        subtitle="Recognize the people who consistently show up, ask thoughtful questions, and shape your show."
      />

      {/* STATS OVERVIEW */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          label="Tracked Community Members"
          value={commenters.length}
          tone="positive"
          hint="Recurring & engaged voices"
        />
        <StatBlock
          label="Frequent Contributors"
          value={frequentCount}
          tone="positive"
          hint="10+ episodes participated"
        />
        <StatBlock
          label="Returning Members"
          value={returningCount}
          hint="Long-term show loyalty"
        />
        <StatBlock
          label="Thoughtful Skeptics"
          value={thoughtfulCount}
          tone="attention"
          hint="Deep intellectual engagement"
        />
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { id: 'all', label: `All Members (${commenters.length})`, icon: Users },
          { id: 'frequent', label: `Frequent Contributors (${frequentCount})`, icon: TrendingUp },
          { id: 'returning', label: `Returning Members (${returningCount})`, icon: Heart },
          { id: 'thoughtful', label: `Thoughtful Contributors (${thoughtfulCount})`, icon: Star },
          { id: 'new', label: 'New Supporters', icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#4de1dc] text-[#091a1a] shadow-sm'
                  : 'bg-[#1e2235] text-[#8f97b0] hover:text-white hover:bg-[#262b42]'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMMUNITY CARDS GRID (EXACT LOVABLE SPEC) */}
      {members.length === 0 ? (
        <EmptyState>No community members found in this category.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const memberComments = comments.filter((c) => c.commenterId === m.id);
            return (
              <div key={m.id} className="ghost-panel p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display text-base font-bold text-white">{m.displayName}</h4>
                      <p className="text-xs font-mono text-[#8f97b0]">{m.handle}</p>
                    </div>
                    <div className="size-8 rounded-xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center font-bold text-xs shrink-0">
                      {m.displayName?.[0] || '?'}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[#8f97b0] font-medium">
                    {m.episodesParticipated} episodes · {m.interactions} interactions
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.tags.map((tag) => (
                      <Chip
                        key={tag}
                        variant={
                          tag === 'Returning member'
                            ? 'guardian'
                            : tag === 'Thoughtful contributor' || tag === 'Intelligent skeptic'
                            ? 'positive'
                            : tag === 'Spam pattern' || tag === 'Threat actor'
                            ? 'critical'
                            : 'outline'
                        }
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>

                  {m.note && (
                    <div className="mt-3 rounded-xl border border-white/5 bg-[#0d0f17]/50 p-3">
                      <p className="text-xs text-[#e4e7f1] leading-relaxed">
                        📌 {m.note}
                      </p>
                    </div>
                  )}
                </div>

                {memberComments.length > 0 && (
                  <div className="pt-3 border-t border-white/5 text-[11px] text-[#8f97b0]">
                    <span className="font-semibold text-white">Recent comment:</span>
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
