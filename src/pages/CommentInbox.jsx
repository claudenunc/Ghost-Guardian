import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Button, EmptyState, SectionTitle } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import InboxPulse from '../components/comments/InboxPulse';
import InboxLanes from '../components/comments/InboxLanes';
import CommentCard from '../components/comments/CommentCard';
import {
  getCommentPriority,
  isHandled,
  isHumanMoment,
  isNeedsYou,
  isReviewQueue,
  isShieldVault,
} from '../components/comments/CommentPriority';

const categoryFilters = [
  { id: 'all', label: 'All Categories' },
  { id: 'questions', label: 'Questions' },
  { id: 'criticism', label: 'Constructive Criticism' },
  { id: 'disagreement', label: 'Disagreements' },
  { id: 'praise', label: 'Praise & Support' },
  { id: 'humor', label: 'Humor' },
  { id: 'hostile', label: 'Hostile & Harassment' },
  { id: 'spam', label: 'Spam & Scams' },
];

export default function CommentInbox() {
  const { comments, commenters, videos, stateFor, approve, showToast } = useGuardian();

  const [activeLane, setActiveLane] = useState('needs_you');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // 1. Calculate live counts for each lane
  const laneCounts = useMemo(() => {
    let needsYou = 0;
    let reviewQueue = 0;
    let humanMoments = 0;
    let shieldVault = 0;
    let handled = 0;

    comments.forEach((c) => {
      const s = stateFor(c.id);
      if (isHandled(s)) handled++;
      if (isNeedsYou(c, s)) needsYou++;
      if (isReviewQueue(c, s)) reviewQueue++;
      if (isHumanMoment(c) && s.status === 'pending') humanMoments++;
      if (isShieldVault(c) && s.status === 'pending') shieldVault++;
    });

    return {
      needs_you: needsYou,
      review_queue: reviewQueue,
      human_moments: humanMoments,
      shield_vault: shieldVault,
      handled,
      all: comments.length,
    };
  }, [comments, stateFor]);

  // 2. Filter comments by active lane, category filter, and search text
  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => {
        const s = stateFor(c.id);

        // Active lane filtering
        if (activeLane === 'needs_you' && !isNeedsYou(c, s)) return false;
        if (activeLane === 'review_queue' && !isReviewQueue(c, s)) return false;
        if (activeLane === 'human_moments' && (!isHumanMoment(c) || s.status !== 'pending')) return false;
        if (activeLane === 'shield_vault' && (!isShieldVault(c) || s.status !== 'pending')) return false;
        if (activeLane === 'handled' && !isHandled(s)) return false;

        // Category filter
        if (categoryFilter === 'questions' && c.classification !== 'QUESTION') return false;
        if (categoryFilter === 'criticism' && c.classification !== 'CONSTRUCTIVE_CRITICISM') return false;
        if (categoryFilter === 'disagreement' && c.classification !== 'DISAGREEMENT') return false;
        if (categoryFilter === 'praise' && c.classification !== 'PRAISE') return false;
        if (categoryFilter === 'humor' && c.classification !== 'HUMOR') return false;
        if (categoryFilter === 'hostile' && !['TROLLING', 'HARASSMENT', 'HATE', 'THREAT'].includes(c.classification)) return false;
        if (categoryFilter === 'spam' && !['SPAM', 'SCAM'].includes(c.classification)) return false;

        // Search filtering
        if (search.trim()) {
          const q = search.toLowerCase();
          const person = commenters.find((p) => p.id === c.commenterId);
          const video = videos.find((v) => v.id === c.videoId);
          const textMatch = (c.text || '').toLowerCase().includes(q);
          const authorMatch =
            (person?.displayName || '').toLowerCase().includes(q) ||
            (person?.handle || '').toLowerCase().includes(q);
          const videoMatch = (video?.title || '').toLowerCase().includes(q);
          const responseMatch = (s.responseText || '').toLowerCase().includes(q);
          if (!textMatch && !authorMatch && !videoMatch && !responseMatch) return false;
        }

        return true;
      })
      // Intelligent prioritization sorting
      .sort((a, b) => {
        const priorityA = getCommentPriority(a);
        const priorityB = getCommentPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [activeLane, categoryFilter, comments, commenters, search, stateFor, videos]);

  // Quick action: approve all ready drafts in review queue
  const handleApproveAllReady = () => {
    const readyInReview = filteredComments.filter(
      (c) => isReviewQueue(c, stateFor(c.id))
    );
    readyInReview.forEach((c) => approve(c.id));
    showToast(`Approved ${readyInReview.length} drafts. Handled!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Title */}
      <SectionTitle
        title="Comment Inbox"
        subtitle="Intelligent triage, human attention calibration, and protective buffering."
      />

      {/* 1. The Pulse: Situation Overview answering the 3 questions */}
      <InboxPulse
        needsYouCount={laneCounts.needs_you}
        handledCount={laneCounts.handled}
        humanMomentsCount={laneCounts.human_moments}
        shieldedCount={laneCounts.shield_vault}
        onSelectLane={(lane) => {
          setActiveLane(lane);
          setCategoryFilter('all');
        }}
      />

      {/* 2. Lanes Segmented Control */}
      <div className="space-y-3">
        <InboxLanes
          activeLane={activeLane}
          onSelectLane={(lane) => {
            setActiveLane(lane);
          }}
          laneCounts={laneCounts}
        />

        {/* 3. Search & Sub-category Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pt-1">
          {/* Sub-category pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#1e2235] text-[#4de1dc] border border-[#4de1dc]/40'
                    : 'bg-transparent text-[#8f97b0] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search input & bulk action */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative min-w-[220px] w-full sm:w-auto">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f97b0]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search comments, users, videos..."
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/90 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none"
              />
            </div>

            {activeLane === 'review_queue' && filteredComments.length > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={handleApproveAllReady}
                title="1-click approve all pending drafts in this lane"
              >
                <CheckCheck size={14} /> Approve All ({filteredComments.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Filtered Comments List */}
      {filteredComments.length === 0 ? (
        <EmptyState>
          <div className="py-8 space-y-2">
            <p className="text-base text-white font-semibold">
              {activeLane === 'needs_you' && '✨ Nothing requires your attention right now.'}
              {activeLane === 'review_queue' && '✨ All pending drafts in review queue have been resolved.'}
              {activeLane === 'human_moments' && '🤍 No pending Human Moments in this filter.'}
              {activeLane === 'shield_vault' && '🛡️ Shield Vault is clear — no unhandled hostile comments.'}
              {activeLane === 'handled' && 'No resolved comments found for this query.'}
              {activeLane === 'all' && 'No comments match your search criteria.'}
            </p>
            <p className="text-xs text-[#8f97b0]">
              Switch lanes or reset filters to explore other community conversations.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveLane('all');
                  setCategoryFilter('all');
                  setSearch('');
                }}
              >
                <RotateCcw size={13} /> View All Comments
              </Button>
            </div>
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
