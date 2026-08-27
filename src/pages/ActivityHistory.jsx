import React, { useState } from 'react';
import {
  Activity,
  Check,
  Search,
  Filter,
  EyeOff,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import {
  Chip,
  EmptyState,
  SectionTitle,
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

    if (search.trim()) {
      const q = search.toLowerCase();
      const comment = comments.find((c) => c.id === entry.commentId);
      const person = commenters.find((p) => p.id === comment?.commenterId);
      const labelMatch = entry.label.toLowerCase().includes(q);
      const detailMatch = (entry.detail || '').toLowerCase().includes(q);
      const commentMatch = (comment?.text || '').toLowerCase().includes(q);
      const nameMatch = (person?.displayName || '').toLowerCase().includes(q);
      if (!labelMatch && !detailMatch && !commentMatch && !nameMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionTitle
        title="Guardian Activity & Audit Trail"
        subtitle="A complete, transparent log: every comment analyzed, AI recommendation generated, creator decision made, and published outcome."
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: `All Actions (${activity.length})` },
            { id: 'published', label: 'Published Only' },
            { id: 'escalated', label: 'Escalations' },
            { id: 'rejected', label: 'Rejected' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === t.id
                  ? 'bg-[#4de1dc] text-[#091a1a]'
                  : 'bg-[#1e2235] text-[#8f97b0] hover:text-white'
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
            placeholder="Search audit trail..."
            className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/80 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/60 focus:border-[#4de1dc] focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Log List */}
      {filtered.length === 0 ? (
        <EmptyState>
          Nothing logged yet matching your filter. Moderate or approve comments in the Inbox and events will appear here in real-time.
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
                    <Chip variant={entry.finalAction === 'escalated' ? 'critical' : 'muted'}>
                      {entry.finalAction}
                    </Chip>
                    <Chip variant={entry.published ? 'positive' : 'outline'}>
                      {entry.published ? 'Published to YouTube' : 'Not Published'}
                    </Chip>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white">{entry.label}</h4>

                {comment && (
                  <div className="rounded-xl border border-white/5 bg-[#0d0f17]/50 p-3 space-y-1 text-xs">
                    <p className="text-[#8f97b0]">
                      <strong className="text-white">{person?.displayName || 'User'}</strong> ({person?.handle}) ·{' '}
                      <span className="text-[#4de1dc]">{comment.classification.replace(/_/g, ' ')}</span> ·{' '}
                      <span>{comment.risk} risk</span> ·{' '}
                      <span>{Math.round(comment.confidence * 100)}% match</span>
                    </p>
                    <p className="text-white italic">"{comment.text}"</p>
                  </div>
                )}

                {entry.detail && (
                  <p className="text-xs text-[#8f97b0] rounded-lg bg-white/5 p-2.5">
                    <strong>Decision Detail:</strong> {entry.detail}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
