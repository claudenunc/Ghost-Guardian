/**
 * Ghost Guardian — Server-Side YouTube Data API v3 & OAuth 2.0 Client
 */

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
].join(' ');

export class YouTubeClient {
  constructor({ clientId, clientSecret, redirectUri } = {}) {
    this.clientId = clientId || process.env.YOUTUBE_CLIENT_ID;
    this.clientSecret = clientSecret || process.env.YOUTUBE_CLIENT_SECRET;
    this.redirectUri = redirectUri || process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/integrations/youtube/callback';
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Generates the Google OAuth 2.0 authorization URL.
   */
  getAuthorizationUrl({ state } = {}) {
    if (!this.isConfigured()) {
      throw new Error('YouTube OAuth is not configured: Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: REQUIRED_SCOPES,
      access_type: 'offline', // Request refresh token
      prompt: 'consent',
      state: state || 'ghost-guardian-state',
    });

    return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for access and refresh tokens.
   */
  async exchangeCodeForTokens(code) {
    if (!this.isConfigured()) {
      throw new Error('YouTube OAuth is not configured.');
    }

    const body = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Failed to exchange OAuth code for tokens: ${response.status} ${errBody}`);
    }

    return await response.json(); // { access_token, refresh_token, expires_in, token_type }
  }

  /**
   * Refreshes an expired access token using the stored refresh token.
   */
  async refreshAccessToken(refreshToken) {
    if (!this.isConfigured()) {
      throw new Error('YouTube OAuth is not configured.');
    }

    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Failed to refresh YouTube access token: ${response.status} ${errBody}`);
    }

    return await response.json();
  }

  /**
   * Retrieves authenticated channel profile and metadata.
   */
  async getChannelDetails(accessToken) {
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YouTube API error (getChannelDetails): ${response.status} ${errText}`);
    }

    const data = await response.json();
    const channel = data.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for authenticated account.');
    }

    return {
      channelId: channel.id,
      title: channel.snippet?.title || 'YouTube Creator',
      handle: channel.snippet?.customUrl || `@${channel.snippet?.title?.toLowerCase().replace(/\s+/g, '')}`,
      subscriberCount: Number(channel.statistics?.subscriberCount || 0),
      videoCount: Number(channel.statistics?.videoCount || 0),
      avatarUrl: channel.snippet?.thumbnails?.default?.url || null,
    };
  }

  /**
   * Fetches comment threads from the creator's channel.
   */
  async fetchRecentCommentThreads(accessToken, { maxResults = 25, pageToken = null } = {}) {
    const params = new URLSearchParams({
      part: 'snippet,replies',
      allThreadsRelatedToChannelId: 'mine',
      maxResults: String(maxResults),
      textFormat: 'plainText',
    });

    if (pageToken) params.set('pageToken', pageToken);

    const url = `${YOUTUBE_API_BASE}/commentThreads?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YouTube API error (fetchRecentCommentThreads): ${response.status} ${errText}`);
    }

    const data = await response.json();
    const rawItems = data.items || [];

    const normalizedComments = rawItems.map((item) => this.normalizeYouTubeCommentThread(item));

    return {
      comments: normalizedComments,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || normalizedComments.length,
    };
  }

  /**
   * Normalizes a raw YouTube CommentThread item into Ghost Guardian's standard Comment model.
   */
  normalizeYouTubeCommentThread(thread) {
    const topComment = thread.snippet?.topLevelComment?.snippet || {};
    return {
      id: `yt-${thread.id}`,
      externalId: thread.id,
      platform: 'youtube',
      videoId: thread.snippet?.videoId || null,
      author: topComment.authorDisplayName || 'Anonymous User',
      authorHandle: topComment.authorChannelUrl ? `@${topComment.authorDisplayName?.toLowerCase().replace(/\s+/g, '')}` : '@user',
      authorAvatar: topComment.authorProfileImageUrl || null,
      text: topComment.textDisplay || topComment.textOriginal || '',
      publishedAt: topComment.publishedAt || new Date().toISOString(),
      likeCount: topComment.likeCount || 0,
      totalReplyCount: thread.snippet?.totalReplyCount || 0,
      canReply: thread.snippet?.canReply ?? true,
    };
  }

  /**
   * Posts an approved response as a reply to a YouTube comment.
   */
  async postCommentReply(accessToken, { commentId, text }) {
    const rawCommentId = commentId.replace(/^yt-/, '');
    const url = `${YOUTUBE_API_BASE}/comments?part=snippet`;

    const body = {
      snippet: {
        parentId: rawCommentId,
        textOriginal: text,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YouTube API error (postCommentReply): ${response.status} ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      publishedCommentId: data.id,
      publishedAt: data.snippet?.publishedAt || new Date().toISOString(),
    };
  }
}

export const youtubeClient = new YouTubeClient();
