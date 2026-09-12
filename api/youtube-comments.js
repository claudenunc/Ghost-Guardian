/**
 * Ghost Guardian — Vercel Serverless Function
 * GET /api/youtube-comments
 *
 * Fetches public comments from a YouTube video using YouTube Data API v3.
 * Uses server-side YOUTUBE_API_KEY — no OAuth required.
 *
 * Self-contained — no imports from /server/.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  try {
    const videoId = req.query?.videoId;

    if (!videoId) {
      return sendJson(res, 400, { error: 'videoId query parameter is required.' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return sendJson(res, 500, {
        error: 'YouTube API key is missing. Set YOUTUBE_API_KEY in your environment variables.',
      });
    }

    const params = new URLSearchParams({
      part: 'snippet',
      videoId,
      maxResults: '50',
      textFormat: 'plainText',
      order: 'relevance',
      key: apiKey,
    });

    const url = `${YOUTUBE_API_BASE}/commentThreads?${params.toString()}`;
    const ytResponse = await fetch(url);

    if (!ytResponse.ok) {
      const errText = await ytResponse.text();
      let parsedErr = errText;
      try {
        parsedErr = JSON.parse(errText)?.error?.message || errText;
      } catch (_) {}
      return sendJson(res, ytResponse.status, {
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
        videoId: item.snippet?.videoId || videoId,
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

    return sendJson(res, 200, {
      comments,
      videoId,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || comments.length,
    });
  } catch (err) {
    return sendJson(res, 500, { error: `Internal server error: ${err.message}` });
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}
