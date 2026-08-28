/**
 * Ghost Guardian Workspace Contracts & Portability Engine
 * Defines the export/import schema, validation logic, and sanitization rules.
 */

export const WORKSPACE_SCHEMA_VERSION = '1.0';

/**
 * Creates a clean, deterministic, portable export payload of the workspace.
 * Strictly strips any credentials, secrets, or transient UI state.
 */
export function createWorkspaceExportPayload(state) {
  const {
    session,
    toast,
    runtime,
    ...persistable
  } = state || {};

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    generator: 'Ghost Guardian Workspace Portability v1.0',
    workspace: {
      creator: persistable.creator || {},
      settings: persistable.settings || {},
      voice: persistable.voice || {},
      policy: persistable.policy || {},
      knowledge: persistable.knowledge || [],
      commentStates: persistable.commentStates || {},
      learning: persistable.learning || [],
      contentOpportunities: persistable.contentOpportunities || [],
      activity: persistable.activity || [],
      videos: persistable.videos || [],
    },
  };
}

/**
 * Validates an uploaded workspace JSON backup for schema compliance and integrity.
 */
export function validateWorkspaceImportPayload(rawInput) {
  if (!rawInput) {
    return { valid: false, error: 'Empty backup file provided.' };
  }

  let parsed;
  try {
    parsed = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  } catch (err) {
    return { valid: false, error: 'Malformed JSON: Unable to parse backup file.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Invalid backup format: root must be an object.' };
  }

  if (!parsed.schemaVersion) {
    return { valid: false, error: 'Incompatible backup: Missing schemaVersion.' };
  }

  if (parsed.schemaVersion !== WORKSPACE_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported schema version: ${parsed.schemaVersion} (Expected ${WORKSPACE_SCHEMA_VERSION}).`,
    };
  }

  const workspace = parsed.workspace || parsed;
  if (!workspace.creator || !workspace.settings) {
    return {
      valid: false,
      error: 'Incomplete backup: Required creator and settings blocks are missing.',
    };
  }

  // Generate preview metadata
  const preview = {
    creatorName: workspace.creator.displayName || workspace.creator.name || 'Unknown Creator',
    channelName: workspace.creator.channelName || 'Unlinked Channel',
    exportedAt: parsed.exportedAt || 'Unknown Date',
    voiceIncluded: Boolean(workspace.voice && Object.keys(workspace.voice).length > 0),
    policyIncluded: Boolean(workspace.policy && Object.keys(workspace.policy).length > 0),
    knowledgeCount: Array.isArray(workspace.knowledge) ? workspace.knowledge.length : 0,
    activityCount: Array.isArray(workspace.activity) ? workspace.activity.length : 0,
    opportunitiesCount: Array.isArray(workspace.contentOpportunities)
      ? workspace.contentOpportunities.length
      : 0,
    learningExamplesCount: Array.isArray(workspace.learning) ? workspace.learning.length : 0,
  };

  return {
    valid: true,
    preview,
    rehydratedState: workspace,
  };
}

/**
 * Ensures that an exported JSON payload contains zero sensitive credentials or API keys.
 */
export function assertPayloadIsSanitized(payload) {
  const jsonStr = JSON.stringify(payload);
  const prohibitedKeys = [
    'apiKey',
    'api_key',
    'secret',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'clientSecret',
    'client_secret',
    'password',
    'authHeader',
  ];

  for (const key of prohibitedKeys) {
    if (jsonStr.includes(`"${key}"`)) {
      throw new Error(`Security Violation: Exported payload contained forbidden credential key: ${key}`);
    }
  }

  return true;
}
