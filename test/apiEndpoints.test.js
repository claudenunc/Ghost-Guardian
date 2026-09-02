/**
 * Ghost Guardian — Server API Endpoints & Security Integration Tests
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleGenerateResponse } from '../server/api/generateResponse.js';
import { handleYoutubeComments } from '../server/api/youtubeComments.js';
import { handleClassifyComment } from '../server/api/classifyComment.js';
import { RateLimiter } from '../server/api/rateLimiter.js';
import { createApiRouter } from '../server/api/router.js';
import fs from 'node:fs';
import path from 'node:path';

// Helper to create mock HTTP Request and Response objects
function createMockHttp({ method = 'GET', url = '/', headers = {}, body = null } = {}) {
  const req = {
    method,
    url,
    headers: { host: 'localhost:3001', ...headers },
    socket: { remoteAddress: '127.0.0.1' },
    connection: { remoteAddress: '127.0.0.1' },
    on(event, handler) {
      if (event === 'data' && body) {
        handler(typeof body === 'string' ? body : JSON.stringify(body));
      }
      if (event === 'end') {
        handler();
      }
    },
  };

  let statusCode = 200;
  const responseHeaders = {};
  let responseData = '';

  const res = {
    setHeader(key, val) {
      responseHeaders[key] = val;
    },
    writeHead(code, headers = {}) {
      statusCode = code;
      Object.assign(responseHeaders, headers);
    },
    end(data = '') {
      responseData = data;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseHeaders['Content-Type'] = 'application/json';
      responseData = JSON.stringify(data);
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get headers() {
      return responseHeaders;
    },
    get body() {
      try {
        return responseData ? JSON.parse(responseData) : null;
      } catch {
        return responseData;
      }
    },
  };

  return { req, res };
}

describe('Ghost Guardian Server-Side API Endpoints & Security', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  describe('1. POST /api/generate-response', () => {
    it('returns 400 if commentText is missing', async () => {
      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/generate-response',
        body: { commentClassification: 'PRAISE' },
      });

      await handleGenerateResponse(req, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /commentText is required/i);
    });

    it('returns 500 with clear message if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.LLM_API_KEY;

      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/generate-response',
        body: { commentText: 'Great video!', commentClassification: 'PRAISE' },
      });

      await handleGenerateResponse(req, res);
      assert.equal(res.statusCode, 500);
      assert.match(res.body.error, /OpenAI API key is missing/i);
    });

    it('successfully calls OpenAI gpt-4o-mini and returns responseText and tokensUsed', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-mock-key';

      let capturedFetchUrl = '';
      let capturedFetchOptions = {};

      globalThis.fetch = async (url, options) => {
        capturedFetchUrl = url;
        capturedFetchOptions = options;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'chatcmpl-test',
            choices: [
              {
                message: {
                  content: 'Thank you so much! Really glad this breakdown resonated with you.',
                },
              },
            ],
            usage: { total_tokens: 42 },
          }),
        };
      };

      const voiceProfile = { warmth: 85, directness: 60, formality: 35, humor: 50 };
      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/generate-response',
        body: {
          commentText: 'This completely changed how I think about the topic.',
          commentClassification: 'PRAISE',
          creatorVoiceProfile: voiceProfile,
        },
      });

      await handleGenerateResponse(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.responseText, 'Thank you so much! Really glad this breakdown resonated with you.');
      assert.equal(res.body.tokensUsed, 42);

      // Verify OpenAI call details
      assert.equal(capturedFetchUrl, 'https://api.openai.com/v1/chat/completions');
      assert.equal(capturedFetchOptions.headers.Authorization, 'Bearer sk-test-mock-key');

      const requestBody = JSON.parse(capturedFetchOptions.body);
      assert.equal(requestBody.model, 'gpt-4o-mini');
      assert.ok(requestBody.messages.some((m) => m.content.includes('Warmth: 85/100')));
    });

    it('handles OpenAI API errors gracefully without exposing keys in error', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-invalid-key';

      globalThis.fetch = async () => ({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Incorrect API key provided' } }),
      });

      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/generate-response',
        body: { commentText: 'Test comment' },
      });

      await handleGenerateResponse(req, res);
      assert.equal(res.statusCode, 401);
      assert.match(res.body.error, /Incorrect API key provided/i);
      assert.equal(JSON.stringify(res.body).includes('sk-test-invalid-key'), false);
    });
  });

  describe('2. GET /api/youtube/comments', () => {
    it('returns 400 if neither videoId nor channelId is provided', async () => {
      const { req, res } = createMockHttp({
        method: 'GET',
        url: '/api/youtube/comments',
      });

      await handleYoutubeComments(req, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /Either videoId or channelId parameter is required/i);
    });

    it('returns 500 if YOUTUBE_API_KEY is not configured', async () => {
      delete process.env.YOUTUBE_API_KEY;

      const { req, res } = createMockHttp({
        method: 'GET',
        url: '/api/youtube/comments?videoId=vid_123',
      });

      await handleYoutubeComments(req, res);
      assert.equal(res.statusCode, 500);
      assert.match(res.body.error, /YouTube API key is missing/i);
    });

    it('fetches and normalizes comments from YouTube Data API v3 with videoId', async () => {
      process.env.YOUTUBE_API_KEY = 'AIzaSyMockYouTubeKey';

      let capturedUrl = '';
      globalThis.fetch = async (url) => {
        capturedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                id: 'comment_thread_1',
                snippet: {
                  videoId: 'vid_123',
                  totalReplyCount: 3,
                  topLevelComment: {
                    snippet: {
                      authorDisplayName: 'Jane Doe',
                      authorProfileImageUrl: 'https://avatar.example.com/jane.jpg',
                      textDisplay: 'Incredible explanation of quantum mechanics!',
                      publishedAt: '2026-09-01T12:00:00Z',
                      likeCount: 15,
                    },
                  },
                },
              },
            ],
            pageInfo: { totalResults: 1 },
          }),
        };
      };

      const { req, res } = createMockHttp({
        method: 'GET',
        url: '/api/youtube/comments?videoId=vid_123',
      });

      await handleYoutubeComments(req, res);

      assert.equal(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.comments));
      assert.equal(res.body.comments.length, 1);

      const comment = res.body.comments[0];
      assert.equal(comment.id, 'yt-comment_thread_1');
      assert.equal(comment.author, 'Jane Doe');
      assert.equal(comment.text, 'Incredible explanation of quantum mechanics!');
      assert.equal(comment.likeCount, 15);
      assert.equal(comment.totalReplyCount, 3);
      assert.equal(comment.videoId, 'vid_123');

      assert.ok(capturedUrl.includes('videoId=vid_123'));
      assert.ok(capturedUrl.includes('key=AIzaSyMockYouTubeKey'));
    });
  });

  describe('3. POST /api/classify-comment', () => {
    it('returns 400 if commentText is missing', async () => {
      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/classify-comment',
        body: {},
      });

      await handleClassifyComment(req, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /commentText is required/i);
    });

    it('returns 500 if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.LLM_API_KEY;

      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/classify-comment',
        body: { commentText: 'Is this supported in production?' },
      });

      await handleClassifyComment(req, res);
      assert.equal(res.statusCode, 500);
      assert.match(res.body.error, /OpenAI API key is missing/i);
    });

    it('classifies comments into standard taxonomy with confidence and reasoning', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-mock-key';

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  classification: 'QUESTION',
                  confidence: 0.96,
                  reasoning: 'Viewer is requesting technical clarification on implementation.',
                }),
              },
            },
          ],
        }),
      });

      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/classify-comment',
        body: { commentText: 'How do you handle rate limiting on Vercel?' },
      });

      await handleClassifyComment(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.classification, 'QUESTION');
      assert.equal(res.body.confidence, 0.96);
      assert.equal(res.body.reasoning, 'Viewer is requesting technical clarification on implementation.');
    });
  });

  describe('4. Rate Limiting (100 requests per IP per hour)', () => {
    it('permits requests under 100 per hour and blocks the 101st request', () => {
      const testLimiter = new RateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 100 });
      const testIp = '192.168.1.50';

      for (let i = 1; i <= 100; i++) {
        const result = testLimiter.check(testIp);
        assert.equal(result.allowed, true, `Request ${i} should be allowed`);
        assert.equal(result.remaining, 100 - i);
      }

      // 101st request must be denied
      const blocked = testLimiter.check(testIp);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.resetTime > Date.now());

      // Different IP is unaffected
      const otherIpResult = testLimiter.check('192.168.1.51');
      assert.equal(otherIpResult.allowed, true);
    });
  });

  describe('5. Router Integration & Endpoints Resolution', () => {
    it('dispatches to /api/generate-response, /api/youtube/comments, and /api/classify-comment', async () => {
      const router = createApiRouter();
      process.env.OPENAI_API_KEY = 'sk-test-key';

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ classification: 'PRAISE', confidence: 0.99, reasoning: 'Positive feedback' }) } }],
          usage: { total_tokens: 10 },
        }),
      });

      const { req, res } = createMockHttp({
        method: 'POST',
        url: '/api/classify-comment',
        body: { commentText: 'Love this work!' },
      });

      await router(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.classification, 'PRAISE');
    });
  });

  describe('6. SPA Routing & Vercel Rewrites Verification', () => {
    it('verifies vercel.json routes /api/* to serverless functions and other paths to /index.html', () => {
      const vercelJsonPath = path.resolve('vercel.json');
      const content = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

      assert.ok(Array.isArray(content.rewrites), 'vercel.json must have rewrites array');

      const apiRewrite = content.rewrites.find((r) => r.source === '/api/(.*)');
      assert.ok(apiRewrite, 'Must have /api/(.*) rewrite');
      assert.equal(apiRewrite.destination, '/api/$1');

      const spaRewrite = content.rewrites.find((r) => r.source === '/(.*)');
      assert.ok(spaRewrite, 'Must have /(.*) SPA catchall rewrite');
      assert.equal(spaRewrite.destination, '/index.html');
    });
  });
});
