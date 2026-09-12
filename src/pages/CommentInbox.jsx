import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  CheckCheck,
  RotateCcw,
  Video,
  Download,
  Loader2,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, EmptyState, SectionTitle } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';
import InboxPulse from '../components/comments/InboxPulse';
import InboxLanes from '../components/comments/InboxLanes';
import CommentCard from '../components/comments/CommentCard';
import { normalizeIncomingYouTubeComment } from '../lib/youtubeUtils';
import { getYouTubeConnection, listMyVideos, startYouTubeConnect } from '../lib/youtubeConnect';
import { shouldDraftFor, runWithConcurrency, applyClassification } from '../lib/commentPipeline';
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
    videos = [],
    voice,
    stateFor,
    approve,
    showToast,
    fetchYouTubeComments,
    ingestComments,
    generateAiResponse,
    classifyComment,
    dispatch,
  } = useGuardian();

  const [activeLane, setActiveLane] = useState('needs_you');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('all');

  // Connected-channel video picker state
  const [connection, setConnection] = useState({ connected: false, channelTitle: null });
  const [myVideos, setMyVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videosError, setVideosError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [importingVideoId, setImportingVideoId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(true);

  // Videos not yet imported (imported ones drop out of the picker).
  const availableVideos = useMemo(
    () => myVideos.filter((v) => !videos.some((iv) => String(iv.id) === String(v.videoId))),
    [myVideos, videos]
  );

  const loadMyVideos = async () => {
    setLoadingVideos(true);
    setVideosError(null);
    const result = await listMyVideos();
    if (result.error) setVideosError(result.error);
    setMyVideos(result.videos || []);
    setLoadingVideos(false);
  };

  // On mount: detect connection, load the creator's videos, and surface the
  // result of a just-completed OAuth round-trip (?youtube=connected).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const conn = await getYouTubeConnection();
      if (cancelled) return;
      setConnection(conn);
      if (conn.connected) loadMyVideos();
    })();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('youtube');
      if (status === 'connected') {
        showToast('YouTube channel connected. Pick a video to import its comments.', 'success');
      } else if (status === 'error') {
        showToast('YouTube connection did not complete. Try again from Settings.', 'error');
      }
      if (status) {
        params.delete('youtube');
        const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', clean);
      }
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectChannel = async () => {
    setConnecting(true);
    try {
      await startYouTubeConnect(); // redirects the browser to Google
    } catch (err) {
      showToast(err.message || 'Could not start the connection.', 'error');
      setConnecting(false);
    }
  };

  // Import a video's comments (used by the video picker).
  const ingestVideo = async (videoId, knownTitle = null) => {
    if (!videoId) {
      showToast('Could not resolve that video.', 'error');
      return;
    }
    try {
      const data = await fetchYouTubeComments({ videoId });

      if (data.error) {
        showToast(data.error, 'error');
        return;
      }

      const rawList = data.comments || [];
      if (rawList.length === 0) {
        showToast('No public comments found for this video.', 'info');
        return;
      }

      const normalized = rawList.map((item) => normalizeIncomingYouTubeComment(item, { videoId }));
      const meta = data.video || {};

      ingestComments({
        comments: normalized,
        video: {
          id: videoId,
          title: knownTitle || meta.title || `YouTube video ${videoId}`,
          publishedAt: meta.publishedAt || new Date().toISOString(),
          views: meta.viewCount,
          likes: meta.likeCount,
          commentCount: normalized.length,
        },
      });

      showToast(
        `Imported ${normalized.length} comments${knownTitle ? ` from "${knownTitle}"` : ''}. Drafting replies in your voice…`,
        'success'
      );
      setActiveLane('all');
      setSelectedVideoId(videoId);

      // Layer 2 — nuanced AI classification. The instant rule pass (Layer 1)
      // already tagged every comment and can only be ESCALATED from here, never
      // downgraded (applyClassification refuses unsafe downgrades). This is what
      // lets Guardian tell a genuine troll from a thoughtful challenger, and a
      // hurting person from a routine question, before any draft is written.
      if (typeof classifyComment === 'function') {
        await runWithConcurrency(normalized, 4, async (c) => {
          const ai = await classifyComment(c.text);
          const fields = applyClassification(c, ai);
          if (fields) {
            Object.assign(c, fields); // keep local copy in sync for drafting below
            dispatch({ type: 'APPLY_CLASSIFICATION', payload: { commentId: c.id, fields } });
          }
        });
      }

      // Auto-draft replies in the creator's voice for eligible comments, in the
      // background (bounded + concurrency-limited). Crisis/sensitive/hostile/spam
      // are never drafted (shouldDraftFor enforces the safety rules) — and now the
      // classification it checks has been refined by Layer 2.
      const draftable = normalized.filter(shouldDraftFor).slice(0, 20);
      if (draftable.length > 0 && typeof generateAiResponse === 'function') {
        runWithConcurrency(draftable, 3, async (c) => {
          const result = await generateAiResponse({
            commentText: c.text,
            commentClassification: c.classification,
            creatorVoiceProfile: voice,
          });
          if (result?.responseText && !result.error) {
            dispatch({ type: 'SET_AI_DRAFT', payload: { commentId: c.id, text: result.responseText } });
          }
        }).then(() => {
          showToast(`Drafts ready for ${draftable.length} comments.`, 'success');
        }).catch(() => {});
      }
    } catch (err) {
      showToast(`Failed to load comments: ${err.message}`, 'error');
    }
  };

  const handlePickVideo = async (video) => {
    setImportingVideoId(video.videoId);
    try {
      await ingestVideo(video.videoId, video.title);
      // Collapse the picker so the imported comments are immediately visible.
      setPickerOpen(false);
    } finally {
      setImportingVideoId(null);
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

        // Specific video filter
        if (selectedVideoId !== 'all' && c.videoId !== selectedVideoId) return false;

        return true;
      })
      // Intelligent prioritization sorting
      .sort((a, b) => {
        const priorityA = getCommentPriority(a);
        const priorityB = getCommentPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [activeLane, categoryFilter, comments, commenters, search, selectedVideoId, stateFor, videos]);

  // Quick action: approve all ready drafts in review queue
  const handleApproveAllReady = () => {
    const readyInReview = filteredComments.filter(
      (c) => isReviewQueue(c, stateFor(c.id))
    );
    readyInReview.forEach((c) => approve(c.id));
    showToast(`Approved ${readyInReview.length} drafts. Handled!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-28 sm:pb-16">
      <h1 className="sr-only">Comment Inbox</h1>
      {/* Page Title */}
      <SectionTitle
        title="Comment Inbox"
        subtitle="Intelligent triage, human attention calibration, and protective buffering."
      />

      {/* Monitored Videos Filter Strip — filter the inbox by an imported video */}
      {videos.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#000000] p-4 sm:p-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#a0a0a0] flex items-center gap-1.5 shrink-0">
            <span className="size-1.5 rounded-full bg-[#00FF66]" />
            Imported Videos ({videos.length}):
          </span>
          <button
            type="button"
            onClick={() => setSelectedVideoId('all')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium transition-colors cursor-pointer ${
              selectedVideoId === 'all'
                ? 'bg-[#0200F1] text-white shadow-[0_0_8px_#0200F1]'
                : 'bg-white/5 text-[#a0a0a0] hover:text-white hover:bg-white/10'
            }`}
          >
            All Videos ({comments.length})
          </button>
          {videos.map((vid) => {
            const count = comments.filter((c) => c.videoId === vid.id).length;
            const isSelected = selectedVideoId === vid.id;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => setSelectedVideoId(isSelected ? 'all' : vid.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-[260px] ${
                  isSelected
                    ? 'bg-[#0200F1] text-white shadow-[0_0_8px_#0200F1]'
                    : 'bg-white/5 text-[#a0a0a0] hover:text-white hover:bg-white/10'
                }`}
                title={vid.title || vid.id}
              >
                {vid.title ? vid.title.replace(/^YouTube Video \((.+)\)$/, '$1') : vid.id} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Your Videos — pick one to import its comments (connected channels) */}
      <div className="rounded-xl border border-white/10 bg-[#050505] p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <button
            type="button"
            onClick={() => connection.connected && setPickerOpen((o) => !o)}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#0200F1]/15 text-[#0200F1] border border-[#0200F1]/30 shrink-0">
              <PlayCircle size={14} />
            </span>
            <div className="min-w-0">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-white block">
                Your Videos{connection.connected && availableVideos.length ? ` (${availableVideos.length})` : ''}
              </span>
              <span className="text-[11px] text-[#a0a0a0] block truncate">
                {connection.connected
                  ? 'Pick a video to import its comments.'
                  : 'Connect your channel to load your videos automatically.'}
              </span>
            </div>
          </button>
          {connection.connected && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={loadMyVideos}
                disabled={loadingVideos}
                className="gap-1.5"
              >
                {loadingVideos ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                aria-label={pickerOpen ? 'Hide videos' : 'Show videos'}
                className="p-2 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                {pickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}
        </div>

        {!connection.connected ? (
          <div className="rounded-lg border border-white/[0.08] bg-[#000000] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Authorize Ghost Guardian on your YouTube channel to see every video here and
              publish approved replies directly. Nothing posts without your approval.
            </p>
            <Button onClick={handleConnectChannel} disabled={connecting} className="shrink-0 gap-2">
              {connecting ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
              Connect YouTube
            </Button>
          </div>
        ) : !pickerOpen ? null : loadingVideos ? (
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0] py-6 justify-center">
            <Loader2 size={16} className="animate-spin" /> Loading your videos…
          </div>
        ) : videosError ? (
          <div className="rounded-lg border border-[#FF1400]/30 bg-[#FF1400]/10 p-3 text-xs text-[#FF1400]">
            {videosError}
          </div>
        ) : availableVideos.length === 0 ? (
          <p className="text-xs text-[#a0a0a0] py-4 text-center">
            {myVideos.length === 0
              ? 'No videos found on your channel yet.'
              : 'All your videos are imported. Tap Refresh to check for new ones.'}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableVideos.map((video) => {
              const importing = importingVideoId === video.videoId;
              return (
                <button
                  key={video.videoId}
                  type="button"
                  onClick={() => handlePickVideo(video)}
                  disabled={importing}
                  className="group text-left rounded-lg border border-white/10 bg-[#000000] overflow-hidden hover:border-[#0200F1]/60 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a0a0a0]">
                        <Video size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-white">
                        {importing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                        {importing ? 'Importing…' : 'Import comments'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-white font-medium line-clamp-2 leading-snug">
                      {video.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
                className="w-full rounded-xl border border-white/10 bg-[#0d0f17]/90 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#8f97b0]/50 focus:border-[#0200F1] focus:outline-none"
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
              {activeLane === 'needs_you' && 'Nothing requires your direct attention right now.'}
              {activeLane === 'review_queue' && 'All pending drafts in review queue have been resolved.'}
              {activeLane === 'human_moments' && 'No pending Human Moments in this filter.'}
              {activeLane === 'shield_vault' && 'Shield Vault is clear — no unhandled hostile comments.'}
              {activeLane === 'handled' && 'No resolved comments found for this query.'}
              {activeLane === 'all' && 'No comments match your search criteria.'}
            </p>
            <p className="text-xs text-[#a0a0a0]">
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
                  setSelectedVideoId('all');
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
