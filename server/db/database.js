import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'data', 'ghost_guardian.json');

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export class Database {
  constructor(filePath = DB_FILE) {
    this.filePath = filePath;
    this.data = {
      users: [],
      workspaces: [],
      creator_profiles: [],
      platform_connections: [],
      voice_profiles: [],
      guardian_policies: [],
      comments: [],
      comment_decisions: [],
      activity_events: [],
      content_opportunities: [],
      audit_logs: [],
    };
    this.init();
  }

  init() {
    if (this.filePath === ':memory:') return;
    ensureDirectoryExistence(this.filePath);
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (err) {
        console.error('Failed to read database file, initializing empty store:', err);
      }
    } else {
      this.save();
    }
  }

  save() {
    if (this.filePath === ':memory:') return;
    ensureDirectoryExistence(this.filePath);
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  createUser({ id, email, passwordHash, name }) {
    const user = {
      id: id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: email.toLowerCase(),
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Workspaces ---
  findWorkspaceById(id) {
    return this.data.workspaces.find((w) => w.id === id) || null;
  }

  findWorkspacesByUserId(userId) {
    return this.data.workspaces.filter((w) => w.userId === userId);
  }

  createWorkspace({ id, userId, name }) {
    const workspace = {
      id: id || `ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      name: name || 'My Creator Workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.workspaces.push(workspace);
    this.save();
    return workspace;
  }

  // --- Creator Profile ---
  getCreatorProfile(workspaceId) {
    return this.data.creator_profiles.find((cp) => cp.workspaceId === workspaceId) || null;
  }

  saveCreatorProfile(workspaceId, profileData) {
    let profile = this.getCreatorProfile(workspaceId);
    if (profile) {
      Object.assign(profile, profileData, { updatedAt: new Date().toISOString() });
    } else {
      profile = {
        id: `cp-${Date.now()}`,
        workspaceId,
        displayName: profileData.displayName || 'Creator',
        handle: profileData.handle || '@creator',
        channelName: profileData.channelName || 'Main Channel',
        timezone: profileData.timezone || 'UTC',
        language: profileData.language || 'English',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.creator_profiles.push(profile);
    }
    this.save();
    return profile;
  }

  // --- Platform Connections ---
  getPlatformConnection(workspaceId, platform = 'youtube') {
    return (
      this.data.platform_connections.find(
        (pc) => pc.workspaceId === workspaceId && pc.platform === platform
      ) || null
    );
  }

  savePlatformConnection(workspaceId, connectionData) {
    let conn = this.getPlatformConnection(workspaceId, connectionData.platform || 'youtube');
    if (conn) {
      Object.assign(conn, connectionData, { updatedAt: new Date().toISOString() });
    } else {
      conn = {
        id: `pc-${Date.now()}`,
        workspaceId,
        platform: connectionData.platform || 'youtube',
        status: connectionData.status || 'connected',
        channelId: connectionData.channelId || '',
        channelTitle: connectionData.channelTitle || '',
        encryptedAccessToken: connectionData.encryptedAccessToken || null,
        encryptedRefreshToken: connectionData.encryptedRefreshToken || null,
        tokenExpiresAt: connectionData.tokenExpiresAt || null,
        lastSyncAt: connectionData.lastSyncAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.platform_connections.push(conn);
    }
    this.save();
    return conn;
  }

  deletePlatformConnection(workspaceId, platform = 'youtube') {
    this.data.platform_connections = this.data.platform_connections.filter(
      (pc) => !(pc.workspaceId === workspaceId && pc.platform === platform)
    );
    this.save();
    return true;
  }

  // --- Voice Profile ---
  getVoiceProfile(workspaceId) {
    return this.data.voice_profiles.find((vp) => vp.workspaceId === workspaceId) || null;
  }

  saveVoiceProfile(workspaceId, voiceData) {
    let voice = this.getVoiceProfile(workspaceId);
    if (voice) {
      Object.assign(voice, voiceData, { updatedAt: new Date().toISOString() });
    } else {
      voice = {
        id: `vp-${Date.now()}`,
        workspaceId,
        warmth: voiceData.warmth ?? 70,
        directness: voiceData.directness ?? 60,
        formality: voiceData.formality ?? 40,
        humor: voiceData.humor ?? 40,
        commonPhrases: voiceData.commonPhrases || [],
        humanApprovalTopics: voiceData.humanApprovalTopics || [],
        approvedExamples: voiceData.approvedExamples || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.voice_profiles.push(voice);
    }
    this.save();
    return voice;
  }

  // --- Guardian Policy ---
  getGuardianPolicy(workspaceId) {
    return this.data.guardian_policies.find((gp) => gp.workspaceId === workspaceId) || null;
  }

  saveGuardianPolicy(workspaceId, policyData) {
    let policy = this.getGuardianPolicy(workspaceId);
    if (policy) {
      Object.assign(policy, policyData, { updatedAt: new Date().toISOString() });
    } else {
      policy = {
        id: `gp-${Date.now()}`,
        workspaceId,
        mode: policyData.mode || 'copilot',
        version: policyData.version || '2.4.0',
        categoryPolicies: policyData.categoryPolicies || {},
        keywordShields: policyData.keywordShields || [],
        topicBoundaries: policyData.topicBoundaries || [],
        trustedPeople: policyData.trustedPeople || [],
        silenceRules: policyData.silenceRules || {},
        safety: policyData.safety || {},
        history: policyData.history || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.guardian_policies.push(policy);
    }
    this.save();
    return policy;
  }

  // --- Comments ---
  getComments(workspaceId) {
    return this.data.comments.filter((c) => c.workspaceId === workspaceId);
  }

  findCommentById(workspaceId, commentId) {
    return (
      this.data.comments.find((c) => c.workspaceId === workspaceId && (c.id === commentId || c.externalId === commentId)) ||
      null
    );
  }

  saveComments(workspaceId, commentsList) {
    for (const item of commentsList) {
      const existingIdx = this.data.comments.findIndex(
        (c) => c.workspaceId === workspaceId && (c.id === item.id || (item.externalId && c.externalId === item.externalId))
      );
      const record = {
        ...item,
        workspaceId,
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        this.data.comments[existingIdx] = { ...this.data.comments[existingIdx], ...record };
      } else {
        this.data.comments.push({
          ...record,
          id: record.id || `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: record.createdAt || new Date().toISOString(),
        });
      }
    }
    this.save();
    return this.getComments(workspaceId);
  }

  // --- Comment Decision & Review State ---
  getCommentDecision(workspaceId, commentId) {
    return (
      this.data.comment_decisions.find(
        (cd) => cd.workspaceId === workspaceId && cd.commentId === commentId
      ) || null
    );
  }

  saveCommentDecision(workspaceId, commentId, decisionData) {
    let decision = this.getCommentDecision(workspaceId, commentId);
    if (decision) {
      Object.assign(decision, decisionData, { updatedAt: new Date().toISOString() });
    } else {
      decision = {
        id: `cd-${Date.now()}`,
        workspaceId,
        commentId,
        status: decisionData.status || 'pending',
        response: decisionData.response || null,
        wasEdited: Boolean(decisionData.wasEdited),
        decidedAt: new Date().toISOString(),
        publishedAt: decisionData.publishedAt || null,
        platformActionStatus: decisionData.platformActionStatus || null,
      };
      this.data.comment_decisions.push(decision);
    }
    this.save();
    return decision;
  }

  // --- Activity Events ---
  getActivityEvents(workspaceId) {
    return this.data.activity_events
      .filter((ae) => ae.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  logActivityEvent(workspaceId, eventData) {
    const event = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId,
      commentId: eventData.commentId || null,
      label: eventData.label,
      detail: eventData.detail,
      finalAction: eventData.finalAction,
      platformAction: eventData.platformAction,
      timestamp: eventData.timestamp || new Date().toISOString(),
    };
    this.data.activity_events.unshift(event);
    this.save();
    return event;
  }

  // --- Audit Logs ---
  logAuditEvent(workspaceId, { eventType, details, actor = 'creator', ip = '127.0.0.1' }) {
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId,
      eventType,
      details,
      actor,
      ip,
      createdAt: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }
}

export const db = new Database();
