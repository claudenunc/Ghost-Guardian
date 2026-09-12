/**
 * Ghost Guardian: shared serverless helpers.
 *
 * Files prefixed with "_" are ignored by Vercel's file-based routing, so this
 * module is bundled into functions that import it but is never a route itself.
 *
 * SECURITY: the service-role Supabase client and OAuth tokens live ONLY here,
 * server-side. Nothing in this file is ever shipped to the browser.
 */

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(data));
}

export function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

/** Service-role client (bypasses RLS). Only ever used inside serverless code. */
export function serviceClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Verifies the caller's Supabase JWT and returns their user id, or null. */
export async function getUserId(req) {
  const header = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const client = serviceClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/** Signs an OAuth `state` so the callback can trust the user id it carries. */
export function signState(userId) {
  const secret = process.env.GOOGLE_CLIENT_SECRET || 'ghost-guardian-fallback';
  const sig = crypto.createHmac('sha256', secret).update(userId).digest('hex').slice(0, 32);
  return `${userId}.${sig}`;
}

/** Verifies a signed `state` and returns the user id, or null if tampered. */
export function verifyState(state) {
  if (!state || typeof state !== 'string' || !state.includes('.')) return null;
  const idx = state.lastIndexOf('.');
  const userId = state.slice(0, idx);
  const sig = state.slice(idx + 1);
  const secret = process.env.GOOGLE_CLIENT_SECRET || 'ghost-guardian-fallback';
  const expected = crypto.createHmac('sha256', secret).update(userId).digest('hex').slice(0, 32);
  // timing-safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? userId : null;
}

/**
 * Loads the creator's YouTube connection and returns a valid access token,
 * refreshing it if expired. Returns { accessToken } or { error }.
 */
export async function getValidAccessToken(client, creatorId) {
  const { data: row } = await client
    .from('youtube_connections')
    .select('*')
    .eq('creator_id', creatorId)
    .maybeSingle();
  if (!row) return { error: 'not_connected' };

  const now = Date.now();
  const expiry = row.token_expiry ? new Date(row.token_expiry).getTime() : 0;
  if (row.access_token && expiry - 60000 > now) return { accessToken: row.access_token };
  if (!row.refresh_token) return { accessToken: row.access_token };

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
  if (!res.ok || !t.access_token) return { error: 'reauth' };

  const newExpiry = t.expires_in ? new Date(Date.now() + t.expires_in * 1000).toISOString() : null;
  await client
    .from('youtube_connections')
    .update({ access_token: t.access_token, token_expiry: newExpiry, updated_at: new Date().toISOString() })
    .eq('creator_id', creatorId);
  return { accessToken: t.access_token };
}

/** Reads a JSON body whether or not the runtime pre-parsed it. */
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
