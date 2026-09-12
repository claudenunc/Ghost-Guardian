import { createClient } from '@supabase/supabase-js';

let client = null;

function readEnv() {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  return {
    url: metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || '',
    anonKey: metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function hasSupabaseConfig() {
  const { url, anonKey } = readEnv();
  return Boolean(url && anonKey);
}

/**
 * One Supabase client for the whole app. Auth and persistence share it so
 * every database call carries the signed-in creator's token and Row Level
 * Security applies.
 */
export function getSupabaseClient() {
  if (client) return client;
  const { url, anonKey } = readEnv();
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
