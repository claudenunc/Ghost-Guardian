/**
 * Ghost Guardian Production Server Entry Point
 */

import http from 'http';
import { createApiRouter } from './api/router.js';

const PORT = process.env.PORT || 3001;
const router = createApiRouter();

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`🛡️ Ghost Guardian Production Server listening on http://localhost:${PORT}`);
  console.log(`🔒 Security: Encrypted token storage and deterministic safety guardrails active.`);
});

export { server };
