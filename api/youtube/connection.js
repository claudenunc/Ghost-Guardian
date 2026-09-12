/**
 * Ghost Guardian: Vercel Serverless Function
 * GET /api/youtube/connection
 *
 * Returns whether the signed-in creator has a connected YouTube channel.
 * Never returns tokens.
 */

import { CORS, sendJson, serviceClient, getUserId } from '../_shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  const userId = await getUserId(req);
  if (!userId) return sendJson(res, 401, { connected: false, channelTitle: null });

  const client = serviceClient();
  if (!client) return sendJson(res, 200, { connected: false, channelTitle: null });

  const { data } = await client
    .from('youtube_connections')
    .select('channel_title')
    .eq('creator_id', userId)
    .maybeSingle();

  return sendJson(res, 200, {
    connected: Boolean(data),
    channelTitle: data?.channel_title || null,
  });
}
