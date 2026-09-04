import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Shield,
  Video,
  Download,
  AlertCircle,
  KeyRound,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button, Chip, EmptyState, SectionTitle } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import InboxPulse from '../components/comments/InboxPulse';
import InboxLanes from '../components/comments/InboxLanes';
import CommentCard from '../components/comments/CommentCard';
import { extractYouTubeVideoId, normalizeIncomingYouTubeComment } from '../lib/youtubeUtils';
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
  const {
    comments,
    commenters,
    videos,
    stateFor,
    approve,
    showToast,
    fetchYouTubeComments,
    ingestComments,
  } = useGuardian();

  const [activeLane, setActiveLane] = useState('needs_you');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // YouTube live ingestion state
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isLoadingYouTube, setIsLoadingYouTube] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const detectedVideoId = useMemo(() => {
    return extractYouTubeVideoId(videoUrlInput);
  }, [videoUrlInput]);

  const handleLoadRealComments = async (overrideApiKey = null) => {
    const videoId = detectedVideoId || extractYouTubeVideoId(videoUrlInput);
    if (!videoId) {
      showToast('Please enter a valid YouTube video URL or 11-character video ID.', 'error');
      return;
    }

    setIsLoadingYouTube(true);
    try {
      const activeKey = overrideApiKey !== null ? overrideApiKey : (apiKeyInput.trim() || '');
      const data = await fetchYouTubeComments({ videoId, apiKey: activeKey });

      if (data.error) {
        if (data.error.includes('YouTube API key is missing')) {
          setShowApiKeyModal(true);
          return;
        }
        showToast(data.error, 'error');
        return;
      }

      const rawList = data.comments || [];
      if (rawList.length === 0) {
        showToast('No public comments found for this video.', 'info');
        return;
      }

      // Normalize raw comments into Ghost Guardian comment models
      const normalized = rawList.map((item) =>
        normalizeIncomingYouTubeComment(item, { videoId })
      );

      ingestComments({
        comments: normalized,
        video: {
          id: videoId,
          title: `YouTube Video (${videoId})`,
          publishedAt: new Date().toISOString(),
          views: 12500,
          likes: 850,
          commentCount: normalized.length,
        },
      });

      showToast(`Ingested ${normalized.length} real YouTube comments!`, 'success');
      setActiveLane('all');
      setVideoUrlInput('');
      setShowApiKeyModal(false);
    } catch (err) {
      showToast(`Failed to load comments: ${err.message}`, 'error');
    } finally {
      setIsLoadingYouTube(false);
    }
  };

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
      <h1 className="sr-only">Comment Inbox</h1>
      {/* Page Title */}
      <SectionTitle
        title="Comment Inbox"
        subtitle="Intelligent triage, human attention calibration, and protective buffering."
      />

      {/* Real YouTube Ingestion Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#000000] p-4 sm:p-5 space-y-3 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#FF1400]/15 text-[#FF2A00] border border-[#FF1400]/30 shadow-[0_0_12px_rgba(255,20,0,0.25)]">
              <Video size={14} />
            </span>
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-white block">
                Live YouTube Comment Ingestion
              </span>
              <span className="text-[11px] text-[#a0a0a0]">
                Extract comments directly from any YouTube video URL or ID into Guardian triage
              </span>
            </div>
          </div>
          {detectedVideoId && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-1 rounded-md border border-[#00FF66]/30 self-start sm:self-center">
              Extracted Video ID: <strong>{detectedVideoId}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=... or shorts / youtu.be) or 11-char Video ID"
              aria-label="YouTube Video URL or Video ID"
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-xs text-white placeholder:text-[#a0a0a0]/60 focus:border-[#0A00FF] focus:outline-none focus:ring-1 focus:ring-[#0A00FF] font-mono"
            />
          </div>

          <Button
            size="sm"
            variant="default"
            disabled={isLoadingYouTube || !videoUrlInput.trim()}
            onClick={() => handleLoadRealComments()}
            className="shrink-0 gap-2 font-mono uppercase tracking-wider"
          >
            <Download size={13} className={isLoadingYouTube ? 'animate-bounce' : ''} />
            <span>{isLoadingYouTube ? 'Fetching Comments...' : 'Load Real Comments'}</span>
          </Button>
        </div>
      </div>

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
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full lg:w-auto">
            <div className="relative min-w-0 w-full sm:w-auto sm:min-w-[220px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f97b0]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search comments, users, videos..."
                aria-label="Search comments"
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/90 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/50 focus:border-[#4de1dc] focus:outline-none"
              />
            </div>

            {activeLane === 'review_queue' && filteredComments.length > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={handleApproveAllReady}
                title="1-click approve all pending drafts in this lane"
                className="shrink-0"
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

      {/* YouTube API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg rounded-xl border border-white/20 bg-[#0a0a0a] p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-white font-display font-bold text-base">
                <KeyRound size={18} className="text-[#FF1400]" />
                <span>YouTube Data API Key Required</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-[#a0a0a0] hover:text-white p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#a0a0a0] leading-relaxed">
              <p className="text-white">
                The server's <code className="text-[#00FF66] font-mono">YOUTUBE_API_KEY</code> environment variable is not configured.
              </p>
              <p>
                You can add <code className="text-white font-mono">YOUTUBE_API_KEY=AIzaSy...</code> to your local <code className="text-white font-mono">.env</code> file, or provide your key below to fetch comments immediately in this session:
              </p>

              <div className="space-y-1.5 pt-1">
                <label htmlFor="youtube-api-key-input" className="text-[11px] font-mono text-white font-semibold block">
                  YouTube Data API Key:
                </label>
                <input
                  id="youtube-api-key-input"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  aria-label="YouTube Data API Key"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white font-mono focus:border-[#0A00FF] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-[#a0a0a0]">
                Keys are never stored persistently or sent to external trackers. Only passed to the local server proxy to query YouTube's official commentThreads endpoint.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <Button size="sm" variant="outline" onClick={() => setShowApiKeyModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                disabled={!apiKeyInput.trim() || isLoadingYouTube}
                onClick={() => handleLoadRealComments(apiKeyInput.trim())}
                className="gap-1.5"
              >
                <Download size={13} />
                <span>{isLoadingYouTube ? 'Fetching...' : 'Fetch with API Key'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
