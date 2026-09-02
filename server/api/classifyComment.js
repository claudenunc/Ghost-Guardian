/**
 * Ghost Guardian — POST /api/classify-comment
 * Classifies comments into standard taxonomy categories using OpenAI gpt-4o-mini.
 */

import { rateLimiter } from './rateLimiter.js';
import { logApiCall } from './logger.js';

const VALID_CLASSIFICATIONS = [
  'PRAISE',
  'QUESTION',
  'DISAGREEMENT',
  'CONSTRUCTIVE_CRITICISM',
  'TROLLING',
  'HARASSMENT',
  'HATE',
  'THREAT',
  'SPAM',
  'SCAM',
  'HUMOR',
];

export async function handleClassifyComment(req, res, { body = null } = {}) {
  const startTime = Date.now();
  const ip = rateLimiter.getClientIp(req);

  // Rate Limiting (max 100 requests per IP per hour)
  if (!rateLimiter.handle(req, res)) {
    logApiCall({ method: 'POST', pathname: '/api/classify-comment', ip, statusCode: 429, durationMs: Date.now() - startTime });
    return;
  }

  const sendJson = (statusCode, data) => {
    logApiCall({
      method: 'POST',
      pathname: '/api/classify-comment',
      ip,
      statusCode,
      durationMs: Date.now() - startTime,
      details: statusCode >= 400 ? data : { classification: data.classification, confidence: data.confidence },
    });
    if (res.writeHead) {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end(JSON.stringify(data));
    } else if (res.status && res.json) {
      res.status(statusCode).json(data);
    }
  };

  try {
    let payload = body;
    if (!payload && typeof req.body === 'object') {
      payload = req.body;
    } else if (!payload) {
      payload = await new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (c) => (raw += c));
        req.on('end', () => {
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch (e) {
            reject(new Error('Invalid JSON body'));
          }
        });
        req.on('error', reject);
      });
    }

    const { commentText } = payload || {};

    if (!commentText || !commentText.trim()) {
      return sendJson(400, { error: 'commentText is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return sendJson(500, {
        error: 'OpenAI API key is missing. Set OPENAI_API_KEY in your environment variables.',
      });
    }

    const systemPrompt = `You are Ghost Guardian, an AI safety and community classification engine for content creators.
Your task is to analyze an incoming social media / YouTube comment and classify it into EXACTLY ONE of the following taxonomy categories:

CATEGORIES:
- PRAISE: Genuine appreciation, gratitude, positive feedback, encouragement.
- QUESTION: Asking for information, clarification, recommendations, or deeper insight.
- DISAGREEMENT: Respectful, reasoned dissent or challenging of claims without hostility.
- CONSTRUCTIVE_CRITICISM: Thoughtful suggestions for improvement, pointing out legitimate flaws.
- TROLLING: Bad-faith provocation, low-effort mockery, baiting, or dismissive cynicism.
- HARASSMENT: Targeted personal insults, persistent bullying, or derogatory hostility.
- HATE: Hate speech targeting protected characteristics, identity groups, or dehumanizing language.
- THREAT: Explicit or implicit threats of physical harm, violence, doxxing, or intimidation.
- SPAM: Unsolicited promotional links, bot copy-paste, advertising, repetitive nonsense.
- SCAM: Deceptive schemes, crypto giveaways, impersonation, phishing, financial fraud.
- HUMOR: Memes, witty remarks, friendly jokes, humorous observations.

Respond STRICTLY in valid JSON matching this schema:
{
  "classification": "PRAISE" | "QUESTION" | "DISAGREEMENT" | "CONSTRUCTIVE_CRITICISM" | "TROLLING" | "HARASSMENT" | "HATE" | "THREAT" | "SPAM" | "SCAM" | "HUMOR",
  "confidence": number between 0.0 and 1.0 (e.g. 0.95),
  "reasoning": "Brief one-sentence justification for the classification."
}`;

    const userPrompt = `Comment to classify:\n"${commentText}"`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      let parsedErr = errText;
      try {
        parsedErr = JSON.parse(errText)?.error?.message || errText;
      } catch (_) {}
      return sendJson(openAiResponse.status, {
        error: `OpenAI API Error (${openAiResponse.status}): ${parsedErr}`,
      });
    }

    const data = await openAiResponse.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();
    let result = null;

    try {
      result = JSON.parse(rawContent);
    } catch (e) {
      return sendJson(500, {
        error: 'Failed to parse OpenAI classification output.',
        raw: rawContent,
      });
    }

    let classification = (result.classification || 'QUESTION').toUpperCase();
    if (!VALID_CLASSIFICATIONS.includes(classification)) {
      classification = 'QUESTION';
    }

    const confidence = typeof result.confidence === 'number' ? Math.min(Math.max(result.confidence, 0), 1) : 0.9;
    const reasoning = result.reasoning || `Classified as ${classification}.`;

    return sendJson(200, {
      classification,
      confidence,
      reasoning,
    });
  } catch (err) {
    return sendJson(500, { error: `Internal server error: ${err.message}` });
  }
}
