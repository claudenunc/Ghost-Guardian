/**
 * Ghost Guardian: Vercel Serverless Function
 * GET /api/youtube-comments?videoId=...&pageToken=...
 *
 * Fetches public comments and basic video metadata from YouTube Data API v3
 * using the server-side YOUTUBE_API_KEY. Errors are translated into calm,
 * user-safe messages; raw Google error text never reaches the browser.
 *
 * Self-contained. No imports from /server/.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  try {
    const videoId = String(req.query?.videoId || '').trim();
    const pageToken = String(req.query?.pageToken || '').trim();

    if (!videoId) {
      return sendJson(res, 400, { error: 'Paste a YouTube video link or ID to import comments.' });
    }
    if (!VIDEO_ID_PATTERN.test(videoId)) {
      return sendJson(res, 400, { error: 'That does not look like a YouTube video link. Check it and try again.' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return sendJson(res, 503, {
        error: 'YouTube import is not configured yet. The YOUTUBE_API_KEY environment variable is missing on the server.',
        code: 'not_configured',
      });
    }

    const videoParams = new URLSearchParams({ part: 'snippet,statistics', id: videoId, key: apiKey });
    const commentParams = new URLSearchParams({
      part: 'snippet',
      videoId,
      maxResults: '50',
      textFormat: 'plainText',
      order: 'relevance',
      key: apiKey,
    });
    // Include inline replies so we can tell if the channel owner already replied.
    commentParams.set('part', 'snippet,replies');
    if (pageToken) commentParams.set('pageToken', pageToken);

    const [videoResponse, commentResponse] = await Promise.all([
      fetch(`${YOUTUBE_API_BASE}/videos?${videoParams.toString()}`),
      fetch(`${YOUTUBE_API_BASE}/commentThreads?${commentParams.toString()}`),
    ]);

    if (!videoResponse.ok) {
      const mapped = await mapYouTubeError(videoResponse);
      return sendJson(res, mapped.status, { error: mapped.message, code: mapped.code });
    }

    const videoData = await videoResponse.json();
    const videoItem = (videoData.items || [])[0];
    if (!videoItem) {
      return sendJson(res, 404, { error: 'That video could not be found. It may be private or removed.', code: 'video_not_found' });
    }

    const video = {
      id: videoId,
      title: videoItem.snippet?.title || `YouTube video ${videoId}`,
      channelTitle: videoItem.snippet?.channelTitle || '',
      channelId: videoItem.snippet?.channelId || null,
      publishedAt: videoItem.snippet?.publishedAt || null,
      thumbnail: videoItem.snippet?.thumbnails?.medium?.url || videoItem.snippet?.thumbnails?.default?.url || null,
      viewCount: Number(videoItem.statistics?.viewCount || 0),
      likeCount: Number(videoItem.statistics?.likeCount || 0),
      commentCount: Number(videoItem.statistics?.commentCount || 0),
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    if (!commentResponse.ok) {
      const mapped = await mapYouTubeError(commentResponse);
      return sendJson(res, mapped.status, { error: mapped.message, code: mapped.code, video });
    }

    const data = await commentResponse.json();
    const rawItems = data.items || [];

    const ownerChannelId = video.channelId || null;

    const comments = rawItems.map((item) => {
      const topComment = item.snippet?.topLevelComment?.snippet || {};
      const displayName = topComment.authorDisplayName || 'YouTube viewer';
      // Did the channel owner already reply in this thread? (inline replies, up to 5)
      const replies = item.replies?.comments || [];
      const ownerReplied = ownerChannelId
        ? replies.some((r) => r.snippet?.authorChannelId?.value === ownerChannelId)
        : false;
      return {
        id: `yt-${item.id}`,
        externalId: item.id,
        platform: 'youtube',
        videoId: item.snippet?.videoId || videoId,
        author: displayName,
        authorHandle: displayName.startsWith('@')
          ? displayName
          : `@${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'viewer'}`,
        authorChannelId: topComment.authorChannelId?.value || null,
        authorChannelUrl: topComment.authorChannelUrl || null,
        authorAvatar: topComment.authorProfileImageUrl || null,
        text: topComment.textOriginal || topComment.textDisplay || '',
        publishedAt: topComment.publishedAt || new Date().toISOString(),
        likeCount: topComment.likeCount || 0,
        totalReplyCount: item.snippet?.totalReplyCount || 0,
        canReply: item.snippet?.canReply ?? true,
        ownerReplied,
      };
    });

    return sendJson(res, 200, {
      comments,
      video,
      videoId,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || comments.length,
    });
  } catch (err) {
    console.error('youtube-comments failed:', err);
    return sendJson(res, 502, { error: 'YouTube is not responding right now. Try again in a moment.', code: 'upstream_error' });
  }
}

async function mapYouTubeError(response) {
  let reason = '';
  try {
    const body = await response.json();
    reason = body?.error?.errors?.[0]?.reason || body?.error?.status || '';
  } catch (_) {
    reason = '';
  }

  if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded' || reason === 'rateLimitExceeded') {
    return {
      status: 429,
      code: 'quota_exceeded',
      message: 'YouTube has paused imports for today. The limit resets at midnight Pacific time.',
    };
  }
  if (reason === 'commentsDisabled') {
    return { status: 400, code: 'comments_disabled', message: 'Comments are turned off for this video.' };
  }
  if (reason === 'videoNotFound' || response.status === 404) {
    return { status: 404, code: 'video_not_found', message: 'That video could not be found. It may be private or removed.' };
  }
  if (reason === 'forbidden' || response.status === 403) {
    return { status: 403, code: 'forbidden', message: 'YouTube would not share the comments for this video.' };
  }
  if (reason === 'keyInvalid' || reason === 'badRequest' && response.status === 400) {
    return { status: 503, code: 'not_configured', message: 'YouTube import is not configured correctly on the server.' };
  }
  return { status: 502, code: 'upstream_error', message: 'YouTube is not responding right now. Try again in a moment.' };
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}