/**
 * Ghost Guardian: client helpers for YouTube channel connection + publishing.
 *
 * All calls attach the current Supabase access token so the serverless
 * functions can identify the creator. Tokens for YouTube itself never touch
 * the browser — they live server-side in youtube_connections.
 */

import { getSupabaseClient } from '../app/supabaseClient.js';

async function authHeaders() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : null;
  } catch {
    return null;
  }
}

/** Kicks off the Google consent flow by redirecting the browser. */
export async function startYouTubeConnect() {
  const headers = await authHeaders();
  if (!headers) throw new Error('Sign in first.');
  const res = await fetch('/api/youtube/oauth-start', { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Could not start the YouTube connection.');
  }
  window.location.href = data.url;
}

/** Returns { connected, channelTitle }. Never throws. */
export async function getYouTubeConnection() {
  const headers = await authHeaders();
  if (!headers) return { connected: false, channelTitle: null };
  try {
    const res = await fetch('/api/youtube/connection', { headers });
    if (!res.ok) return { connected: false, channelTitle: null };
    return await res.json();
  } catch {
    return { connected: false, channelTitle: null };
  }
}

/** Disconnects the channel. Returns true on success. */
export async function disconnectYouTube() {
  const headers = await authHeaders();
  if (!headers) return false;
  try {
    const res = await fetch('/api/youtube/disconnect', { method: 'POST', headers });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Publishes a reply. Returns { success, id } or { success:false, code, error }.
 * code 'not_connected' means the creator hasn't linked a channel yet.
 */
export async function publishYouTubeReply({ parentId, text }) {
  const headers = await authHeaders();
  if (!headers) return { success: false, code: 'not_authenticated', error: 'Sign in first.' };
  try {
    const res = await fetch('/api/youtube/publish-reply', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, code: data.code || 'error', error: data.error || `Failed (${res.status})` };
    }
    return { success: true, id: data.id || null };
  } catch {
    return { success: false, code: 'network', error: 'Could not reach the publish service.' };
  }
}
