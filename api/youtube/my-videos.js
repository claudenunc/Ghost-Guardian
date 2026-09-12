/**
 * Ghost Guardian: Vercel Serverless Function
 * GET /api/youtube/my-videos?pageToken=...
 *
 * Lists the signed-in creator's own uploaded videos (via their connected
 * channel's uploads playlist). Requires a YouTube connection.
 */

import { CORS, sendJson, serviceClient, getUserId, getValidAccessToken } from '../_shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  const userId = await getUserId(req);
  if (!userId) return sendJson(res, 401, { error: 'Sign in first.', code: 'not_authenticated' });

  const client = serviceClient();
  if (!client) return sendJson(res, 503, { error: 'Not configured yet.', code: 'not_configured' });

  const tok = await getValidAccessToken(client, userId);
  if (tok.error === 'not_connected') {
    return sendJson(res, 400, { error: 'Connect your YouTube channel first.', code: 'not_connected' });
  }
  if (!tok.accessToken) {
    return sendJson(res, 401, { error: 'Your YouTube connection expired. Reconnect in Settings.', code: 'reauth' });
  }

  try {
    // 1. Find the creator's uploads playlist.
    const chRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
      { headers: { Authorization: `Bearer ${tok.accessToken}` } }
    );
    const ch = await chRes.json().catch(() => ({}));
    if (!chRes.ok) {
      return sendJson(res, 502, { error: 'Could not read your channel from YouTube.', code: 'upstream' });
    }
    const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return sendJson(res, 200, { videos: [], nextPageToken: null });

    // 2. List videos in that playlist.
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId: uploads,
      maxResults: '50',
    });
    const pageToken = String(req.query?.pageToken || '').trim();
    if (pageToken) params.set('pageToken', pageToken);

    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
      { headers: { Authorization: `Bearer ${tok.accessToken}` } }
    );
    const pl = await plRes.json().catch(() => ({}));
    if (!plRes.ok) {
      const reason = pl?.error?.errors?.[0]?.reason || '';
      if (reason === 'quotaExceeded' || reason === 'rateLimitExceeded') {
        return sendJson(res, 429, { error: 'YouTube paused requests for today. Try again tomorrow.', code: 'quota' });
      }
      return sendJson(res, 502, { error: 'Could not load your videos from YouTube.', code: 'upstream' });
    }

    const videos = (pl.items || [])
      .map((it) => ({
        videoId: it.contentDetails?.videoId || null,
        title: it.snippet?.title || 'Untitled video',
        thumbnail:
          it.snippet?.thumbnails?.medium?.url ||
          it.snippet?.thumbnails?.default?.url ||
          null,
        publishedAt: it.contentDetails?.videoPublishedAt || it.snippet?.publishedAt || null,
      }))
      .filter((v) => v.videoId);

    return sendJson(res, 200, { videos, nextPageToken: pl.nextPageToken || null });
  } catch (err) {
    console.error('my-videos failed:', err);
    return sendJson(res, 502, { error: 'Could not reach YouTube. Try again in a moment.', code: 'network' });
  }
}
