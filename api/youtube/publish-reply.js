/**
 * Ghost Guardian: Vercel Serverless Function
 * POST /api/youtube/publish-reply   Body: { parentId, text }
 *
 * Posts an approved reply to a YouTube comment thread on behalf of the
 * signed-in creator. Refreshes the access token if expired. Tokens never
 * leave the server. Only ever called from the creator's Approve action.
 */

import { CORS, sendJson, serviceClient, getUserId, readJsonBody } from '../_shared.js';

async function ensureAccessToken(client, row) {
  const now = Date.now();
  const expiry = row.token_expiry ? new Date(row.token_expiry).getTime() : 0;
  // Still valid (60s safety margin)?
  if (row.access_token && expiry - 60000 > now) return row.access_token;
  if (!row.refresh_token) return row.access_token; // best effort

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: row.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const t = await res.json().catch(() => ({}));
  if (!res.ok || !t.access_token) return null;

  const newExpiry = t.expires_in ? new Date(Date.now() + t.expires_in * 1000).toISOString() : null;
  await client
    .from('youtube_connections')
    .update({ access_token: t.access_token, token_expiry: newExpiry, updated_at: new Date().toISOString() })
    .eq('creator_id', row.creator_id);
  return t.access_token;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  const userId = await getUserId(req);
  if (!userId) return sendJson(res, 401, { error: 'Sign in to publish.', code: 'not_authenticated' });

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid request body.' });
  }

  const { parentId, text } = body || {};
  if (!parentId || !text || !String(text).trim()) {
    return sendJson(res, 400, { error: 'A reply and a target comment are required.' });
  }

  const client = serviceClient();
  if (!client) return sendJson(res, 503, { error: 'Publishing is not configured yet.', code: 'not_configured' });

  const { data: row } = await client
    .from('youtube_connections')
    .select('*')
    .eq('creator_id', userId)
    .maybeSingle();

  if (!row) {
    return sendJson(res, 400, { error: 'Connect your YouTube channel first.', code: 'not_connected' });
  }

  const accessToken = await ensureAccessToken(client, row);
  if (!accessToken) {
    return sendJson(res, 401, { error: 'Your YouTube connection expired. Reconnect in Settings.', code: 'reauth' });
  }

  try {
    const ytRes = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippet: { parentId, textOriginal: text } }),
    });
    const data = await ytRes.json().catch(() => ({}));

    if (!ytRes.ok) {
      const reason = data?.error?.errors?.[0]?.reason || '';
      if (reason === 'quotaExceeded' || reason === 'rateLimitExceeded' || reason === 'dailyLimitExceeded') {
        return sendJson(res, 429, { error: 'YouTube has paused posting for today. Try again tomorrow.', code: 'quota' });
      }
      if (ytRes.status === 401 || reason === 'authError') {
        return sendJson(res, 401, { error: 'Your YouTube connection expired. Reconnect in Settings.', code: 'reauth' });
      }
      if (reason === 'commentsDisabled') {
        return sendJson(res, 400, { error: 'Comments are turned off for this video.', code: 'comments_disabled' });
      }
      if (reason === 'processingFailure' || reason === 'parentCommentNotFound') {
        return sendJson(res, 400, { error: 'That comment is no longer available on YouTube.', code: 'not_found' });
      }
      console.error('YouTube comments.insert failed:', data);
      return sendJson(res, 502, { error: 'YouTube would not accept the reply right now.', code: 'upstream' });
    }

    return sendJson(res, 200, { success: true, id: data.id || null });
  } catch (err) {
    console.error('publish-reply failed:', err);
    return sendJson(res, 502, { error: 'Could not reach YouTube. Try again in a moment.', code: 'network' });
  }
}
