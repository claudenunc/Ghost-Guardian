# Ghost Guardian Environment Configuration

## Runtime Modes

Ghost Guardian supports two runtime environments:

1. **`demo` (Default Development & Testing Mode)**:
   - Operates in-memory and in browser with fictional fixtures.
   - Allows frontend, UX, and test suites to execute without external infrastructure.
   - All platform actions (reply, filter, sync) are simulated and clearly marked.

2. **`production` (Live SaaS Foundation Mode)**:
   - Backed by Node.js server persistence and real OAuth 2.0 platform APIs.
   - Requires real authentication, database storage, and LLM credentials.
   - Strictly fails with clear errors if external credentials or backend services are unavailable.

---

## Environment Variables

Copy `.env.example` to `.env` to configure your environment:

### Public Client Configuration (Vite)
These variables are bundled into client-side JavaScript. **Never put secrets or private keys here.**

| Variable | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_GHOST_GUARDIAN_RUNTIME` | `demo` \| `production` | `demo` | Sets the application runtime mode. |
| `VITE_API_BASE_URL` | URL string | `http://localhost:3001` | Base URL for the production backend API. |

---

### Server-Only Configuration (Backend API & Background Jobs)
These variables MUST NEVER be prefixed with `VITE_` and MUST only be present on the secure backend server.

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | No | Server port (default: 3001) | `3001` |
| `SESSION_SECRET` | **Yes (Prod)** | Cryptographic key for signing session tokens | `a-long-random-secret-key-32-chars` |
| `DATABASE_URL` | **Yes (Prod)** | Relational database connection string | `file:./ghost_guardian.sqlite` or `postgres://...` |
| `YOUTUBE_CLIENT_ID` | **Yes (Prod)** | Google Cloud OAuth 2.0 Client ID | `123456789.apps.googleusercontent.com` |
| `YOUTUBE_CLIENT_SECRET` | **Yes (Prod)** | Google Cloud OAuth 2.0 Client Secret | `GOCSPX-abc123xyz` |
| `YOUTUBE_REDIRECT_URI` | **Yes (Prod)** | OAuth redirect URI registered in Google Console | `http://localhost:3001/api/integrations/youtube/callback` |
| `LLM_API_KEY` | **Yes (Prod)** | API key for Gemini / Anthropic / OpenAI inference | `sk-ant-api03-...` or `AIzaSy...` |
| `LLM_PROVIDER` | No | LLM service provider (`gemini` \| `anthropic` \| `openai`) | `gemini` |
| `LLM_MODEL` | No | Model identifier | `gemini-1.5-pro` or `claude-3-5-sonnet` |
| `ENCRYPTION_KEY` | **Yes (Prod)** | 256-bit AES key for encrypting OAuth refresh tokens at rest | `32-byte-hex-string` |

---

## Local Production Setup Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start the Backend Production Server**:
   ```bash
   node server/index.js
   ```

4. **Start the Frontend with Production Runtime**:
   ```bash
   VITE_GHOST_GUARDIAN_RUNTIME=production npm run dev
   ```

5. **Run the Full Test Suite**:
   ```bash
   npm test
   ```
