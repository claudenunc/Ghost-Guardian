/**
 * Ghost Guardian: Vercel Serverless Function
 * POST /api/youtube/disconnect
 *
 * Removes the signed-in creator's stored YouTube tokens.
 */

import { CORS, sendJson, serviceClient, getUserId } from '../_shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  const userId = await getUserId(req);
  if (!userId) return sendJson(res, 401, { error: 'Sign in first.' });

  const client = serviceClient();
  if (client) {
    await client.from('youtube_connections').delete().eq('creator_id', userId);
  }
  return sendJson(res, 200, { success: true });
}
