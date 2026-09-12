/**
 * Ghost Guardian: Vercel Serverless Function
 * GET /api/youtube/oauth-start
 *
 * Requires the caller's Supabase JWT (Authorization: Bearer <token>). Returns
 * the Google consent URL to begin connecting the creator's YouTube channel.
 * Scope youtube.force-ssl is required to post comment replies.
 */

import { CORS, sendJson, getUserId, signState } from '../_shared.js';

const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  const userId = await getUserId(req);
  if (!userId) {
    return sendJson(res, 401, { error: 'Sign in to connect your YouTube channel.' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return sendJson(res, 503, {
      error: 'YouTube connect is not configured on the server yet.',
      code: 'not_configured',
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: SCOPE,
    state: signState(userId),
  });

  return sendJson(res, 200, {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
}
