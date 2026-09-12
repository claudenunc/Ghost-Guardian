/**
 * YouTube utility functions for Ghost Guardian.
 */

import { buildCommentFromYouTube } from './commentPipeline.js';

/**
 * Extracts an 11-character YouTube video ID from various URL formats or raw IDs.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(urlStr);

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split(/[?#&]/)[0];
      if (id && id.length === 11) return id;
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.has('v')) {
        const id = url.searchParams.get('v');
        if (id && id.length === 11) return id;
      }

      const paths = url.pathname.split('/').filter(Boolean);
      for (const prefix of ['embed', 'shorts', 'v', 'live']) {
        const idx = paths.indexOf(prefix);
        if (idx !== -1 && paths[idx + 1] && paths[idx + 1].length === 11) {
          return paths[idx + 1];
        }
      }
    }
  } catch (_) {
    // URL constructor failed, fall through to the regex.
  }

  const regexMatch = trimmed.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#&?]*).*/);
  if (regexMatch && regexMatch[1] && regexMatch[1].length === 11) {
    return regexMatch[1];
  }

  return null;
}

/**
 * Normalizes a raw comment returned from /api/youtube-comments into a Guardian
 * comment model. Classification comes from the tested rule engine; drafts are
 * produced later by the AI layer (see src/lib/commentPipeline.js).
 */
export function normalizeIncomingYouTubeComment(ytComment, options = {}) {
  return buildCommentFromYouTube(ytComment, options);
}
