import crypto from 'crypto';

const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'ghost-guardian-dev-secret-session-key-must-be-changed-in-prod';
}

/**
 * Hashes a plaintext password with a unique cryptographic salt.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a stored salt:hash string using constant-time comparison.
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

/**
 * Generates a signed session token containing userId, workspaceId, and expiration.
 */
export function createSessionToken(payload) {
  const data = {
    ...payload,
    expiresAt: Date.now() + SESSION_EXPIRY_MS,
  };
  const json = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(json)
    .digest('base64url');

  return `${json}.${signature}`;
}

/**
 * Verifies and parses a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [json, signature] = token.split('.');

  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(json)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(json, 'base64url').toString('utf8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
