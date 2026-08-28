import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Check,
  Search,
  Filter,
  EyeOff,
  Flag,
  AlertTriangle,
  Shield,
  ShieldAlert,
  Sparkles,
  Heart,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import {
  Chip,
  EmptyState,
  SectionTitle,
  ClassificationChip,
  RuleSignalChip,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function ActivityHistory() {
  const { activity, comments, commenters, videos } = useGuardian();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = activity.filter((entry) => {
    if (filter === 'published' && !entry.published) return false;
    if (filter === 'escalated' && entry.finalAction !== 'escalated') return false;
    if (filter === 'rejected' && entry.finalAction !== 'rejected') return false;
    if (filter === 'shielded' && entry.finalAction !== 'ignored') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const comment = comments.find((c) => c.id === entry.commentId);
      const person = commenters.find((p) => p.id === comment?.commenterId);
      const labelMatch = (entry.label || '').toLowerCase().includes(q);
      const detailMatch = (entry.detail || '').toLowerCase().includes(q);
      const commentMatch = (comment?.text || '').toLowerCase().includes(q);
      const nameMatch = (person?.displayName || '').toLowerCase().includes(q);
      if (!labelMatch && !detailMatch && !commentMatch && !nameMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* HERO SECTION */}
      <div className="ghost-panel ghost-glow p-6 sm:p-8 border-[#4de1dc]/30 bg-gradient-to-r from-[#141829]/95 via-[#131726]/95 to-[#1c1830]/95">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot bg-[#4de1dc]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#4de1dc] uppercase">
                Guardian Journal
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl text-white">
              Activity History & Audit Trail
            </h1>
            <p className="mt-2 text-sm text-[#8f97b0] max-w-2xl leading-relaxed">
              A transparent, immutable log of every autonomous action taken, silence recommended, draft approved, and creator calibration recorded.
            </p>
          </div>

          <Chip variant="guardian" className="font-bold">
            🛡️ {activity.length} Logged Events
          </Chip>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: `All Events (${activity.length})` },
            { id: 'published', label: 'Published Only' },
            { id: 'shielded', label: 'Shielded / Filtered' },
            { id: 'escalated', label: 'Escalations' },
            { id: 'rejected', label: 'Rejected' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                filter === t.id
                  ? 'border-[#4de1dc] bg-[#4de1dc]/15 text-[#4de1dc]'
                  : 'border-white/10 bg-[#1e2235] text-[#8f97b0] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f97b0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Journal audit trail..."
            className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/80 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/60 focus:border-[#4de1dc] focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Log Entries */}
      {filtered.length === 0 ? (
        <EmptyState>
          Nothing logged matching your filter. Actions and decisions taken in the Inbox and Dashboard appear here in real time.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const comment = comments.find((c) => c.id === entry.commentId);
            const person = commenters.find((p) => p.id === comment?.commenterId);
            const video = videos.find((v) => v.id === comment?.videoId);

            return (
              <div key={entry.id} className="ghost-panel p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8f97b0]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                    <Chip variant="outline">YouTube</Chip>
                    {video && (
                      <span className="text-white font-medium truncate max-w-xs">
                        · on "{video.title}"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip variant={entry.finalAction === 'escalated' ? 'critical' : entry.finalAction === 'approved' ? 'positive' : 'muted'}>
                      {entry.finalAction}
                    </Chip>
                    <Chip variant={entry.published ? 'positive' : 'outline'}>
                      {entry.published ? 'Published to Platform' : 'Internal Action'}
                    </Chip>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{entry.label}</h4>
                  <Link to="/app/inbox" className="text-xs text-[#4de1dc] hover:underline flex items-center gap-1">
                    Inspect in Inbox <ArrowRight size={12} />
                  </Link>
                </div>

                {comment && (
                  <div className="rounded-xl border border-white/5 bg-[#0d0f17]/50 p-3.5 space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[#8f97b0]">
                      <div>
                        <strong className="text-white">{person?.displayName || 'User'}</strong> ({person?.handle})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClassificationChip value={comment.classification} />
                        <RuleSignalChip signal={comment.ruleSignal} />
                      </div>
                    </div>
                    <p className="text-white italic">"{comment.text}"</p>
                  </div>
                )}

                {entry.detail && (
                  <div className="text-xs text-[#8f97b0] rounded-lg bg-white/5 p-2.5">
                    <strong className="text-white">Reasoning & Action:</strong> {entry.detail}
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
