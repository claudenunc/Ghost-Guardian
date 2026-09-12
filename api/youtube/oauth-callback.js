/**
 * Ghost Guardian: Vercel Serverless Function
 * GET /api/youtube/oauth-callback?code=...&state=...
 *
 * Google redirects here after consent. Exchanges the code for tokens, reads the
 * channel, stores tokens server-side (service role, never sent to the browser),
 * then redirects back into the app. Tokens live only in youtube_connections.
 */

import { CORS, serviceClient, verifyState } from '../_shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
  const back = (status) => {
    // On success land on the inbox (where the creator picks a video to import);
    // on error return to settings so they can retry the connection.
    const dest = status === 'connected' ? '/app/inbox' : '/app/settings';
    res.writeHead(302, { Location: `${appUrl}${dest}?youtube=${status}` });
    res.end();
  };

  const code = req.query?.code;
  const state = req.query?.state;
  const userId = verifyState(state);
  if (!code || !userId) return back('error');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return back('error');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Google token exchange failed:', tokens);
      return back('error');
    }

    // Read the connected channel (best effort).
    let channelId = null;
    let channelTitle = null;
    try {
      const chRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      const ch = await chRes.json().catch(() => ({}));
      const item = (ch.items || [])[0];
      if (item) {
        channelId = item.id || null;
        channelTitle = item.snippet?.title || null;
      }
    } catch (_) {
      // non-fatal
    }

    const client = serviceClient();
    if (!client) return back('error');

    const expiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const row = {
      creator_id: userId,
      channel_id: channelId,
      channel_title: channelTitle,
      access_token: tokens.access_token,
      token_expiry: expiry,
      scopes: tokens.scope || null,
      updated_at: new Date().toISOString(),
    };
    // Only overwrite the refresh token when Google actually returns one, so a
    // re-consent that omits it doesn't wipe the stored one.
    if (tokens.refresh_token) row.refresh_token = tokens.refresh_token;

    const { error } = await client.from('youtube_connections').upsert(row);
    if (error) {
      console.error('youtube_connections upsert failed:', error);
      return back('error');
    }

    return back('connected');
  } catch (err) {
    console.error('oauth-callback failed:', err);
    return back('error');
  }
}
