/**
 * YouTube Utility Functions for Ghost Guardian
 */

/**
 * Extracts an 11-character YouTube video ID from various URL formats or raw IDs.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Direct 11-char ID check (alphanumeric, underscores, hyphens)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(urlStr);

    // youtu.be/ID
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split(/[?#&]/)[0];
      if (id && id.length === 11) return id;
    }

    // youtube.com / m.youtube.com
    if (url.hostname.includes('youtube.com')) {
      // ?v=ID
      if (url.searchParams.has('v')) {
        const id = url.searchParams.get('v');
        if (id && id.length === 11) return id;
      }

      // /embed/ID or /shorts/ID or /v/ID
      const paths = url.pathname.split('/').filter(Boolean);
      for (const prefix of ['embed', 'shorts', 'v', 'live']) {
        const idx = paths.indexOf(prefix);
        if (idx !== -1 && paths[idx + 1] && paths[idx + 1].length === 11) {
          return paths[idx + 1];
        }
      }
    }
  } catch (_) {
    // URL constructor failed, fallback to robust regex
  }

  const regexMatch = trimmed.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#&?]*).*/);
  if (regexMatch && regexMatch[1] && regexMatch[1].length === 11) {
    return regexMatch[1];
  }

  return null;
}

/**
 * Normalizes a raw comment returned from /api/youtube/comments into a full
 * Ghost Guardian comment model ready for CommentCard rendering.
 */
export function normalizeIncomingYouTubeComment(ytComment, { videoId = null, videoTitle = null } = {}) {
  const text = ytComment.text || '';
  const lower = text.toLowerCase();

  // Basic deterministic semantic categorization
  let classification = 'GENERAL_COMMENT';
  let sentiment = 'neutral';
  let risk = 'low';
  let strategy = 'ACKNOWLEDGE';
  let recommendedAction = 'draft';
  let requiresHumanReview = false;
  let ruleSignal = 'match';

  // Human disclosure / sensitive emotional moments
  if (
    lower.includes('my mother') ||
    lower.includes('my dad') ||
    lower.includes('passed away') ||
    lower.includes('crying') ||
    lower.includes('depress') ||
    lower.includes('saved my life') ||
    lower.includes('grief') ||
    lower.includes('terminal')
  ) {
    classification = 'SENSITIVE';
    sentiment = 'positive';
    risk = 'low';
    strategy = 'EMPATHIZE';
    requiresHumanReview = true;
    ruleSignal = 'strong_match';
  }
  // Hostile / Harassment / Threats
  else if (
    lower.includes('die') ||
    lower.includes('kill') ||
    lower.includes('fraud') ||
    lower.includes('idiot') ||
    lower.includes('scam') ||
    lower.includes('hate you')
  ) {
    classification = lower.includes('kill') || lower.includes('die') ? 'THREAT' : 'HARASSMENT';
    sentiment = 'negative';
    risk = 'critical';
    strategy = 'SILENCE';
    recommendedAction = 'silence';
    requiresHumanReview = true;
    ruleSignal = 'strong_match';
  }
  // Questions
  else if (text.includes('?') || lower.startsWith('how') || lower.startsWith('why') || lower.startsWith('what')) {
    classification = 'QUESTION';
    sentiment = 'neutral';
    strategy = 'ANSWER';
    recommendedAction = 'draft';
    ruleSignal = 'match';
  }
  // Praise
  else if (
    lower.includes('love') ||
    lower.includes('great video') ||
    lower.includes('amazing') ||
    lower.includes('best explanation') ||
    lower.includes('thank you')
  ) {
    classification = 'PRAISE';
    sentiment = 'positive';
    strategy = 'APPRECIATE';
    recommendedAction = 'draft';
    ruleSignal = 'strong_match';
  }
  // Constructive criticism
  else if (lower.includes('however') || lower.includes('disagree') || lower.includes('point out') || lower.includes('missed')) {
    classification = 'CONSTRUCTIVE_CRITICISM';
    sentiment = 'neutral';
    strategy = 'ENGAGE_CONSTRUCTIVELY';
    recommendedAction = 'draft';
    ruleSignal = 'match';
  }

  const authorName = ytComment.author || 'YouTube Viewer';
  const firstName = authorName.split(' ')[0] || 'there';

  return {
    id: ytComment.id || `yt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    externalId: ytComment.externalId || ytComment.id,
    platform: 'youtube',
    videoId: videoId || ytComment.videoId || 'live-video',
    author: authorName,
    authorHandle: ytComment.authorHandle || `@${authorName.toLowerCase().replace(/\s+/g, '')}`,
    authorAvatar: ytComment.authorAvatar || null,
    text: text,
    createdAt: ytComment.publishedAt || new Date().toISOString(),
    likes: ytComment.likeCount || ytComment.likes || 0,
    replies: ytComment.totalReplyCount || ytComment.replies || 0,
    classification,
    sentiment,
    risk,
    ruleSignal,
    strategy,
    recommendedAction,
    requiresHumanReview,
    reasoning: [
      `Ingested live from YouTube Data API v3.`,
      `Classified as ${classification} based on semantic structure.`,
      `Guardian calculated risk: ${risk}.`,
    ],
    drafts: {
      warm: `Thank you for sharing this, ${firstName}! Really appreciate your perspective and time watching.`,
      calm: `Appreciate the comment, ${firstName}. Glad this sparked a thought.`,
      direct: `Thanks for the input, ${firstName}.`,
      humorous: `Appreciate you tuning in, ${firstName}! Hope the algorithms treat you well.`,
    },
  };
}
