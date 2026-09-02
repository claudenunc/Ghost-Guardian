/**
 * Ghost Guardian — GET /api/youtube/comments
 * Fetches and normalizes comments from YouTube Data API v3 using server-side YOUTUBE_API_KEY.
 */

import { rateLimiter } from './rateLimiter.js';
import { logApiCall } from './logger.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function handleYoutubeComments(req, res, { query = null } = {}) {
  const startTime = Date.now();
  const ip = rateLimiter.getClientIp(req);

  // Rate Limiting (max 100 requests per IP per hour)
  if (!rateLimiter.handle(req, res)) {
    logApiCall({ method: 'GET', pathname: '/api/youtube/comments', ip, statusCode: 429, durationMs: Date.now() - startTime });
    return;
  }

  const sendJson = (statusCode, data) => {
    logApiCall({
      method: 'GET',
      pathname: '/api/youtube/comments',
      ip,
      statusCode,
      durationMs: Date.now() - startTime,
      details: statusCode >= 400 ? data : { count: data.comments?.length || 0 },
    });
    if (res.writeHead) {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end(JSON.stringify(data));
    } else if (res.status && res.json) {
      res.status(statusCode).json(data);
    }
  };

  try {
    let videoId = query?.videoId;
    let channelId = query?.channelId;
    let maxResults = query?.maxResults || '50';

    if (!videoId && !channelId) {
      // Parse query params from URL if req.url exists
      if (req.url) {
        const parsedUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
        videoId = parsedUrl.searchParams.get('videoId');
        channelId = parsedUrl.searchParams.get('channelId');
        maxResults = parsedUrl.searchParams.get('maxResults') || '50';
      }
    }

    if (!videoId && !channelId) {
      return sendJson(400, {
        error: 'Either videoId or channelId parameter is required.',
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return sendJson(500, {
        error: 'YouTube API key is missing. Set YOUTUBE_API_KEY in your environment variables.',
      });
    }

    const params = new URLSearchParams({
      part: 'snippet,replies',
      maxResults: String(Math.min(Number(maxResults) || 50, 100)),
      textFormat: 'plainText',
      key: apiKey,
    });

    if (videoId) {
      params.set('videoId', videoId);
    } else if (channelId) {
      params.set('allThreadsRelatedToChannelId', channelId);
    }

    const url = `${YOUTUBE_API_BASE}/commentThreads?${params.toString()}`;
    const ytResponse = await fetch(url);

    if (!ytResponse.ok) {
      const errText = await ytResponse.text();
      let parsedErr = errText;
      try {
        parsedErr = JSON.parse(errText)?.error?.message || errText;
      } catch (_) {}
      return sendJson(ytResponse.status, {
        error: `YouTube Data API Error (${ytResponse.status}): ${parsedErr}`,
      });
    }

    const data = await ytResponse.json();
    const rawItems = data.items || [];

    const comments = rawItems.map((item) => {
      const topComment = item.snippet?.topLevelComment?.snippet || {};
      return {
        id: `yt-${item.id}`,
        externalId: item.id,
        platform: 'youtube',
        videoId: item.snippet?.videoId || videoId || null,
        author: topComment.authorDisplayName || 'Anonymous User',
        authorHandle: topComment.authorChannelUrl
          ? `@${topComment.authorDisplayName?.toLowerCase().replace(/\s+/g, '')}`
          : '@user',
        authorAvatar: topComment.authorProfileImageUrl || null,
        text: topComment.textDisplay || topComment.textOriginal || '',
        publishedAt: topComment.publishedAt || new Date().toISOString(),
        likeCount: topComment.likeCount || 0,
        totalReplyCount: item.snippet?.totalReplyCount || 0,
        canReply: item.snippet?.canReply ?? true,
      };
    });

    return sendJson(200, {
      comments,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || comments.length,
    });
  } catch (err) {
    return sendJson(500, { error: `Internal server error: ${err.message}` });
  }
}
