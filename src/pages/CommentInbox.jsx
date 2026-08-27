import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  EyeOff,
  Flag,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ActionChip,
  Button,
  Chip,
  ClassificationChip,
  EmptyState,
  RiskChip,
  SectionTitle,
  StrategyChip,
  Textarea,
} from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

const tones = ['calm', 'direct', 'warm', 'humorous'];

export default function CommentInbox() {
  const { comments, commenters, videos, stateFor } = useGuardian();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = comments.filter((c) => {
    const s = stateFor(c.id);
    if (filter === 'pending' && s.status !== 'pending') return false;
    if (filter === 'approved' && s.status !== 'approved' && s.status !== 'edited') return false;
    if (filter === 'attention' && c.risk !== 'critical' && c.risk !== 'high' && c.recommendedAction !== 'human_review') return false;
    if (filter === 'questions' && c.classification !== 'QUESTION') return false;
    if (filter === 'praise' && c.classification !== 'PRAISE') return false;
    if (filter === 'criticism' && c.classification !== 'CONSTRUCTIVE_CRITICISM' && c.classification !== 'DISAGREEMENT') return false;
    if (filter === 'hostile' && !['TROLLING', 'HARASSMENT', 'HATE', 'THREAT'].includes(c.classification)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const person = commenters.find((p) => p.id === c.commenterId);
      const textMatch = c.text.toLowerCase().includes(q);
      const authorMatch = (person?.displayName || '').toLowerCase().includes(q) || (person?.handle || '').toLowerCase().includes(q);
      const responseMatch = (s.responseText || '').toLowerCase().includes(q);
      if (!textMatch && !authorMatch && !responseMatch) return false;
    }

    return true;
  });

  const pendingCount = comments.filter((c) => stateFor(c.id).status === 'pending').length;
  const attentionCount = comments.filter((c) => (c.risk === 'critical' || c.risk === 'high' || c.recommendedAction === 'human_review') && stateFor(c.id).status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionTitle
        title="Comment Inbox"
        subtitle="Review, calibrate, and approve responses. Nothing publishes without your consent in Copilot mode."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${comments.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'attention', label: `Needs Attention (${attentionCount})` },
            { id: 'questions', label: 'Questions' },
            { id: 'praise', label: 'Praise' },
            { id: 'criticism', label: 'Criticism' },
            { id: 'hostile', label: 'Hostile & Threats' },
            { id: 'approved', label: 'Approved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-[#4de1dc] text-[#091a1a] shadow-sm'
                  : 'bg-[#1e2235] text-[#8f97b0] hover:text-white hover:bg-[#262b42]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f97b0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments or users..."
            className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/80 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/60 focus:border-[#4de1dc] focus:outline-none"
          />
        </div>
      </div>

      {/* Comments List */}
      {filtered.length === 0 ? (
        <EmptyState>No comments match your search or filter selection.</EmptyState>
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }) {
  const guardian = useGuardian();
  const state = guardian.stateFor(comment.id);
  const person = guardian.commenters.find((p) => p.id === comment.commenterId);
  const video = guardian.videos.find((v) => v.id === comment.videoId);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const locked = comment.risk === 'critical' || comment.recommendedAction === 'human_review';
  const hasDraft = Object.values(comment.drafts || {}).some(Boolean);

  const timeString = new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="ghost-panel p-5 sm:p-6 transition-all duration-200">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#1e2235] border border-white/10 text-[#4de1dc] flex items-center justify-center font-bold text-xs shrink-0">
            {person?.displayName?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{person?.displayName || 'User'}</span>
              <span className="text-xs text-[#8f97b0]">{person?.handle}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8f97b0] mt-0.5">
              <span>{timeString}</span>
              {video && <span className="truncate max-w-[200px] sm:max-w-xs">· on {video.title}</span>}
              {comment.likes > 0 && <span>· 👍 {comment.likes.toLocaleString()}</span>}
            </div>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ClassificationChip value={comment.classification} />
          <RiskChip risk={comment.risk} />
          <StrategyChip value={comment.strategy} />
          <ActionChip value={comment.recommendedAction} />
          <Chip variant="outline">{Math.round(comment.confidence * 100)}% match</Chip>
        </div>
      </div>

      {/* Comment Body */}
      <p className="mt-4 text-sm sm:text-base text-white leading-relaxed font-normal">
        "{comment.text}"
      </p>

      {/* Expandable Reasoning */}
      <div className="mt-3">
        <button
          onClick={() => setReasoningOpen(!reasoningOpen)}
          className="inline-flex items-center gap-1.5 text-xs text-[#4de1dc] hover:underline cursor-pointer"
        >
          <Info size={13} /> Why this recommendation?
          {reasoningOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {reasoningOpen && (
          <div className="mt-2.5 rounded-xl border border-white/10 bg-[#0d0f17]/70 p-4 text-xs space-y-2">
            <div>
              <span className="text-[10px] tracking-widest text-[#8f97b0] uppercase font-semibold">Underlying Intent:</span>
              <p className="text-white mt-0.5">{comment.intent}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-widest text-[#8f97b0] uppercase font-semibold">Guardian Reasoning:</span>
              <ul className="mt-1 space-y-1 text-[#8f97b0]">
                {comment.reasoning?.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#4de1dc]">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Alert */}
      {comment.escalationReason && (
        <div className="mt-4 rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 p-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#f87171] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#f87171] uppercase tracking-wider">Human Attention Required</p>
            <p className="mt-1 text-xs text-white leading-relaxed">{comment.escalationReason}</p>
          </div>
        </div>
      )}

      {/* Status Badges if Handled */}
      {state.status !== 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <Chip variant={state.status === 'rejected' ? 'outline' : 'positive'}>
            Status: {state.status}
          </Chip>
          {state.savedAsExample && <Chip variant="guardian">✨ Saved as Voice Example</Chip>}
          <span className="text-xs text-[#8f97b0]">
            Handled at {new Date(state.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Response Drafting & Tone Registers */}
      {locked ? (
        <div className="mt-4 flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              guardian.setStatus(comment.id, 'escalated', 'Escalated to creator — direct human intervention');
              guardian.showToast('Escalated to creator. Thread locked & logged.', 'warning');
            }}
          >
            <AlertTriangle size={14} /> Escalate to Me
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              guardian.setStatus(comment.id, 'reported', 'Reported to YouTube platform');
              guardian.showToast('Reported and hidden.', 'success');
            }}
          >
            <Flag size={14} /> Report Abuse
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              guardian.setStatus(comment.id, 'hidden', 'Hidden from public feed');
              guardian.showToast('Comment hidden.', 'info');
            }}
          >
            <EyeOff size={14} /> Hide
          </Button>
        </div>
      ) : hasDraft ? (
        <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
          {/* Tone Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#8f97b0] uppercase font-bold">Guardian Draft Registers:</span>
              <div className="flex flex-wrap gap-1">
                {tones
                  .filter((t) => comment.drafts?.[t])
                  .map((tone) => (
                    <button
                      key={tone}
                      onClick={() => guardian.useTone(comment.id, tone)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
                        state.activeTone === tone
                          ? 'border border-[#4de1dc]/50 bg-[#4de1dc]/20 text-[#4de1dc]'
                          : 'border border-white/10 text-[#8f97b0] hover:text-white hover:border-white/25'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
              </div>
            </div>
            {state.wasEdited && <Chip variant="attention">Edited by you</Chip>}
          </div>

          <Textarea
            value={state.responseText}
            rows={3}
            onChange={(e) => guardian.setResponse(comment.id, e.target.value)}
            placeholder="Edit draft response..."
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              disabled={state.status === 'approved' || state.status === 'edited'}
              onClick={() => guardian.approve(comment.id)}
            >
              <Check size={14} /> Approve & Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => guardian.regenerate(comment.id)}
            >
              <RefreshCw size={14} /> Regenerate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => guardian.saveAsExample(comment.id)}
            >
              <Sparkles size={14} /> Save as Example
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => guardian.reject(comment.id)}
            >
              <X size={14} /> Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => guardian.setStatus(comment.id, 'ignored', 'Comment ignored without response')}
            >
              Ignore
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => guardian.setStatus(comment.id, 'hidden', 'Comment hidden')}
            >
              <EyeOff size={14} /> Hide
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
          <p className="text-xs text-[#8f97b0]">
            No reply drafted — recommended action: <strong>{comment.recommendedAction.replace(/_/g, ' ')}</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                guardian.setStatus(comment.id, 'reported', 'Reported spam/scam');
                guardian.showToast('Reported and logged.', 'success');
              }}
            >
              <Flag size={14} /> Report
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => guardian.setStatus(comment.id, 'ignored', 'Left without reply')}
            >
              Leave It
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
