/**
 * Ghost Guardian — Server API Router
 */

import { db } from '../db/database.js';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../security/auth.js';
import { encrypt, decrypt } from '../security/encryption.js';
import { youtubeClient } from '../youtube/youtubeClient.js';
import { llmGuardianProvider } from '../llm/llmProvider.js';
import { evaluateCommentPolicy, defaultGuardianPolicy } from '../../src/domain/policy/guardianPolicy.js';
import { Category, RecommendedAction } from '../../src/domain/guardian/contracts.js';

export function createApiRouter() {
  return async function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Helper functions
    const sendJson = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    const parseBody = async () => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (err) {
            reject(new Error('Invalid JSON body'));
          }
        });
        req.on('error', reject);
      });
    };

    const getAuthSession = () => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
      const token = authHeader.split(' ')[1];
      return verifySessionToken(token);
    };

    try {
      // ----------------------------------------------------
      // AUTH ENDPOINTS
      // ----------------------------------------------------
      if (pathname === '/api/auth/register' && method === 'POST') {
        const { email, password, name } = await parseBody();
        if (!email || !password) return sendJson(400, { error: 'Email and password are required.' });

        const existing = db.findUserByEmail(email);
        if (existing) return sendJson(409, { error: 'An account with this email already exists.' });

        const passwordHash = hashPassword(password);
        const user = db.createUser({ email, passwordHash, name: name || 'Creator' });
        const workspace = db.createWorkspace({ userId: user.id, name: `${user.name}'s Workspace` });

        // Initialize default workspace configurations
        db.saveCreatorProfile(workspace.id, { displayName: user.name, handle: `@${email.split('@')[0]}` });
        db.saveGuardianPolicy(workspace.id, defaultGuardianPolicy);
        db.saveVoiceProfile(workspace.id, { warmth: 75, directness: 65, formality: 40, humor: 40 });

        const token = createSessionToken({ userId: user.id, workspaceId: workspace.id });
        return sendJson(201, {
          token,
          user: { id: user.id, email: user.email, name: user.name },
          workspace: { id: workspace.id, name: workspace.name },
        });
      }

      if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, password } = await parseBody();
        if (!email || !password) return sendJson(400, { error: 'Email and password are required.' });

        const user = db.findUserByEmail(email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          return sendJson(401, { error: 'Invalid email or password.' });
        }

        const workspaces = db.findWorkspacesByUserId(user.id);
        const workspace = workspaces[0] || db.createWorkspace({ userId: user.id });

        const token = createSessionToken({ userId: user.id, workspaceId: workspace.id });
        return sendJson(200, {
          token,
          user: { id: user.id, email: user.email, name: user.name },
          workspace: { id: workspace.id, name: workspace.name },
        });
      }

      if (pathname === '/api/auth/me' && method === 'GET') {
        const session = getAuthSession();
        if (!session) return sendJson(401, { error: 'Unauthorized: Session is invalid or expired.' });

        const user = db.findUserById(session.userId);
        const workspace = db.findWorkspaceById(session.workspaceId);
        if (!user || !workspace) return sendJson(404, { error: 'User or workspace not found.' });

        return sendJson(200, {
          user: { id: user.id, email: user.email, name: user.name },
          workspace: { id: workspace.id, name: workspace.name },
        });
      }

      // ----------------------------------------------------
      // WORKSPACE ENDPOINTS (PROTECTED)
      // ----------------------------------------------------
      const session = getAuthSession();

      if (pathname === '/api/workspace' && method === 'GET') {
        if (!session) return sendJson(401, { error: 'Unauthorized.' });
        const workspaceId = session.workspaceId;

        const creator = db.getCreatorProfile(workspaceId) || { displayName: 'Creator', handle: '@creator' };
        const voice = db.getVoiceProfile(workspaceId) || {};
        const policy = db.getGuardianPolicy(workspaceId) || defaultGuardianPolicy;
        const comments = db.getComments(workspaceId);
        const activity = db.getActivityEvents(workspaceId);
        const platformConn = db.getPlatformConnection(workspaceId, 'youtube');

        return sendJson(200, {
          workspaceId,
          creator,
          voice,
          policy,
          comments,
          activity,
          platformConnection: platformConn
            ? {
                platform: platformConn.platform,
                status: platformConn.status,
                channelTitle: platformConn.channelTitle,
                lastSyncAt: platformConn.lastSyncAt,
              }
            : null,
        });
      }

      // ----------------------------------------------------
      // YOUTUBE OAUTH & INTEGRATION ENDPOINTS
      // ----------------------------------------------------
      if (pathname === '/api/integrations/youtube/connect' && method === 'GET') {
        if (!session) return sendJson(401, { error: 'Unauthorized.' });
        try {
          const authUrl = youtubeClient.getAuthorizationUrl({ state: session.workspaceId });
          return sendJson(200, { authUrl });
        } catch (err) {
          return sendJson(503, { error: err.message });
        }
      }

      if (pathname === '/api/integrations/youtube/callback' && method === 'POST') {
        if (!session) return sendJson(401, { error: 'Unauthorized.' });
        const { code } = await parseBody();
        if (!code) return sendJson(400, { error: 'Authorization code is required.' });

        try {
          const tokens = await youtubeClient.exchangeCodeForTokens(code);
          const channel = await youtubeClient.getChannelDetails(tokens.access_token);

          // Encrypt tokens before storage
          const encryptedAccess = encrypt(tokens.access_token);
          const encryptedRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
          const tokenExpiry = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;

          db.savePlatformConnection(session.workspaceId, {
            platform: 'youtube',
            status: 'connected',
            channelId: channel.channelId,
            channelTitle: channel.title,
            encryptedAccessToken: encryptedAccess,
            encryptedRefreshToken: encryptedRefresh,
            tokenExpiresAt: tokenExpiry,
            lastSyncAt: new Date().toISOString(),
          });

          db.saveCreatorProfile(session.workspaceId, {
            displayName: channel.title,
            handle: channel.handle,
            channelName: channel.title,
          });

          db.logAuditEvent(session.workspaceId, {
            eventType: 'PLATFORM_CONNECTED',
            details: `YouTube channel "${channel.title}" connected via OAuth 2.0.`,
          });

          return sendJson(200, {
            success: true,
            channel: { title: channel.title, handle: channel.handle },
          });
        } catch (err) {
          return sendJson(500, { error: `OAuth authorization failed: ${err.message}` });
        }
      }

      if (pathname === '/api/integrations/youtube/sync' && method === 'POST') {
        if (!session) return sendJson(401, { error: 'Unauthorized.' });
        const conn = db.getPlatformConnection(session.workspaceId, 'youtube');
        if (!conn || !conn.encryptedAccessToken) {
          return sendJson(400, { error: 'No active YouTube connection found. Connect via OAuth first.' });
        }

        let accessToken = decrypt(conn.encryptedAccessToken);
        if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt) < new Date() && conn.encryptedRefreshToken) {
          const refreshToken = decrypt(conn.encryptedRefreshToken);
          const refreshed = await youtubeClient.refreshAccessToken(refreshToken);
          accessToken = refreshed.access_token;
          db.savePlatformConnection(session.workspaceId, {
            encryptedAccessToken: encrypt(accessToken),
            tokenExpiresAt: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000).toISOString(),
          });
        }

        try {
          const { comments: rawComments } = await youtubeClient.fetchRecentCommentThreads(accessToken, { maxResults: 20 });
          const policy = db.getGuardianPolicy(session.workspaceId) || defaultGuardianPolicy;
          const voiceProfile = db.getVoiceProfile(session.workspaceId) || {};

          // Process comments through the hybrid Guardian pipeline
          const processed = [];
          for (const raw of rawComments) {
            const decision = await llmGuardianProvider.processComment({
              comment: raw,
              policy,
              voiceProfile,
            });
            processed.push({
              ...raw,
              category: decision.category,
              intent: decision.intent,
              sentiment: decision.sentiment,
              risk: decision.risk,
              recommendedAction: decision.recommendedAction,
              requiresHumanReview: decision.requiresHumanReview,
              draft: decision.draft,
              reasoningSummary: decision.reasoningSummary,
              policyDecision: decision.policyDecision,
              signals: decision.signals,
            });
          }

          db.saveComments(session.workspaceId, processed);
          db.savePlatformConnection(session.workspaceId, { lastSyncAt: new Date().toISOString() });

          return sendJson(200, {
            success: true,
            syncedCount: processed.length,
            comments: processed,
          });
        } catch (err) {
          return sendJson(500, { error: `Failed to sync YouTube comments: ${err.message}` });
        }
      }

      // ----------------------------------------------------
      // COMMENT PUBLISHING (FAIL-CLOSED BOUNDARY)
      // ----------------------------------------------------
      if (pathname.startsWith('/api/comments/') && pathname.endsWith('/publish') && method === 'POST') {
        if (!session) return sendJson(401, { error: 'Unauthorized.' });
        const commentId = pathname.replace('/api/comments/', '').replace('/publish', '');
        const { text } = await parseBody();

        if (!text || !text.trim()) {
          return sendJson(400, { error: 'Publishing requires non-empty response text.' });
        }

        const comment = db.findCommentById(session.workspaceId, commentId);
        if (!comment) return sendJson(404, { error: 'Comment not found in workspace.' });

        const policy = db.getGuardianPolicy(session.workspaceId) || defaultGuardianPolicy;

        // PRE-PUBLICATION SAFETY & CONSTITUTIONAL POLICY CHECK
        const preCheck = evaluateCommentPolicy(text, Category.UNKNOWN, { policy });
        if (preCheck.requiresHumanReview && preCheck.finalAction !== RecommendedAction.DRAFT) {
          return sendJson(403, {
            error: 'Publishing rejected: Response text violates active creator policy or safety boundaries.',
            reason: preCheck.explanation,
          });
        }

        // Check platform connection
        const conn = db.getPlatformConnection(session.workspaceId, 'youtube');
        if (!conn || !conn.encryptedAccessToken) {
          return sendJson(400, { error: 'Cannot publish: Active YouTube connection is required.' });
        }

        const accessToken = decrypt(conn.encryptedAccessToken);
        try {
          const publishResult = await youtubeClient.postCommentReply(accessToken, { commentId, text });

          db.saveCommentDecision(session.workspaceId, commentId, {
            status: 'approved',
            response: text,
            publishedAt: publishResult.publishedAt,
            platformActionStatus: 'published',
          });

          db.logActivityEvent(session.workspaceId, {
            commentId,
            label: 'Approved Reply Published to YouTube',
            detail: `Published response to ${comment.author || 'commenter'}: "${text.slice(0, 60)}..."`,
            finalAction: 'approved',
            platformAction: 'youtube_comment_reply',
          });

          return sendJson(200, { success: true, publishResult });
        } catch (err) {
          return sendJson(500, { error: `Failed to post reply to YouTube: ${err.message}` });
        }
      }

      // Route Not Found
      return sendJson(404, { error: 'Endpoint not found.' });
    } catch (err) {
      console.error('Unhandled server error:', err);
      return sendJson(500, { error: `Internal server error: ${err.message}` });
    }
  };
}
