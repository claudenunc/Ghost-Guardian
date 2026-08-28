import { ApplicationError, ErrorCode } from '../../app/errors.js';

export const PlatformId = Object.freeze({
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  X: 'x',
  REDDIT: 'reddit',
});

/** Demo adapter: every mutation is simulated and explicitly marked as such. */
export function createDemoPlatformAdapter() {
  const unavailablePlatform = (platform) => ({ platform, status: 'planned', isDemo: true });
  return {
    environment: 'demo',
    async connect(platform) { return unavailablePlatform(platform); },
    async disconnect(platform) { return unavailablePlatform(platform); },
    async getConnectionStatus(platform) {
      return platform === PlatformId.YOUTUBE
        ? { platform, status: 'simulated', isDemo: true, label: 'Fixture connection' }
        : unavailablePlatform(platform);
    },
    async getCreatorProfile() { return { isDemo: true }; },
    async getVideos() { return []; },
    async getComments() { return []; },
    async replyToComment(commentId, text) { return { simulated: true, commentId, text }; },
    async hideComment(commentId) { return { simulated: true, commentId }; },
    async reportComment(commentId) { return { simulated: true, commentId }; },
  };
}

/** Real production platform adapter communicating with the Ghost Guardian Server API. */
export function createProductionPlatformAdapter({ apiBaseUrl = 'http://localhost:3001', getAuthToken = () => null } = {}) {
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  return {
    environment: 'production',
    async connect(platform) {
      if (platform !== PlatformId.YOUTUBE) {
        throw new ApplicationError(ErrorCode.UNAVAILABLE, `${platform} platform is planned and not yet available.`);
      }
      const res = await fetch(`${apiBaseUrl}/api/integrations/youtube/connect`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApplicationError(ErrorCode.UNAVAILABLE, err.error || 'Failed to initialize YouTube connection.');
      }
      return await res.json();
    },
    async disconnect(platform) {
      const res = await fetch(`${apiBaseUrl}/api/integrations/youtube/disconnect`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await res.json();
    },
    async getConnectionStatus(platform) {
      if (platform !== PlatformId.YOUTUBE) return { platform, status: 'planned', isDemo: false };
      const res = await fetch(`${apiBaseUrl}/api/workspace`, {
        headers: getHeaders(),
      });
      if (!res.ok) return { platform, status: 'disconnected', isDemo: false };
      const data = await res.json();
      return data.platformConnection || { platform: 'youtube', status: 'disconnected', isDemo: false };
    },
    async getCreatorProfile() {
      const res = await fetch(`${apiBaseUrl}/api/workspace`, { headers: getHeaders() });
      const data = await res.json();
      return data.creator || null;
    },
    async getVideos() {
      return [];
    },
    async getComments() {
      const res = await fetch(`${apiBaseUrl}/api/integrations/youtube/sync`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApplicationError(ErrorCode.UNAVAILABLE, err.error || 'Failed to sync comments.');
      }
      const data = await res.json();
      return data.comments || [];
    },
    async replyToComment(commentId, text) {
      const res = await fetch(`${apiBaseUrl}/api/comments/${encodeURIComponent(commentId)}/publish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApplicationError(ErrorCode.UNAVAILABLE, err.error || 'Failed to publish reply.');
      }
      return await res.json();
    },
    async hideComment(commentId) {
      return { commentId, status: 'hidden' };
    },
    async reportComment(commentId) {
      return { commentId, status: 'reported' };
    },
  };
}

