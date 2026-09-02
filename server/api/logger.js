/**
 * Ghost Guardian — Server-Side API Logger
 * Structured logging for API calls, errors, and latencies without leaking private secrets.
 */

export function logApiCall({ method, pathname, ip, statusCode, durationMs, details = null, error = null }) {
  const timestamp = new Date().toISOString();
  const statusEmoji = statusCode >= 500 ? '🚨' : statusCode >= 400 ? '⚠️' : '✅';
  
  let msg = `[${timestamp}] ${statusEmoji} [${method}] ${pathname} - Status: ${statusCode} (${durationMs}ms) - IP: ${ip || 'unknown'}`;
  
  if (details) {
    // Sanitize any potential keys
    const sanitizedDetails = typeof details === 'object' 
      ? JSON.stringify(details, (k, v) => (k.toLowerCase().includes('key') || k.toLowerCase().includes('secret') || k.toLowerCase().includes('token') ? '[REDACTED]' : v))
      : String(details);
    msg += ` | Details: ${sanitizedDetails}`;
  }

  if (error) {
    console.error(msg, error.message || error);
  } else {
    console.log(msg);
  }
}
