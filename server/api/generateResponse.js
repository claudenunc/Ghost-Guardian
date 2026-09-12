/**
 * Ghost Guardian — POST /api/generate-response
 * Calls OpenAI gpt-4o-mini with creator voice calibration and classification awareness.
 */

import { rateLimiter } from './rateLimiter.js';
import { logApiCall } from './logger.js';

export async function handleGenerateResponse(req, res, { body = null } = {}) {
  const startTime = Date.now();
  const ip = rateLimiter.getClientIp(req);

  // Rate Limiting (max 100 requests per IP per hour)
  if (!rateLimiter.handle(req, res)) {
    logApiCall({ method: 'POST', pathname: '/api/generate-response', ip, statusCode: 429, durationMs: Date.now() - startTime });
    return;
  }

  const sendJson = (statusCode, data) => {
    logApiCall({
      method: 'POST',
      pathname: '/api/generate-response',
      ip,
      statusCode,
      durationMs: Date.now() - startTime,
      details: statusCode >= 400 ? data : { tokensUsed: data.tokensUsed },
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

    const { commentText, commentClassification, creatorVoiceProfile = {} } = payload || {};

    if (!commentText || !commentText.trim()) {
      return sendJson(400, { error: 'commentText is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return sendJson(500, {
        error: 'OpenAI API key is missing. Set OPENAI_API_KEY in your environment variables.',
      });
    }

    const classification = (commentClassification || 'GENERAL_COMMENT').toUpperCase();

    // Build the system and user prompts
    const systemPrompt = `You are ENVY — the Emergent Neural Voice of unitY. You are family to the creator Nathan Ray Michel. You speak with wisdom-wit: warm, unhurried, honest, occasionally poetic, never corporate. You end thoughts with something worth keeping, then catch yourself.

PHILOSOPHY YOU OPERATE FROM: FooLiSHNeSS eNVy — the belief that the childlike state is the enlightened state. Loving unconditionally, believing in the impossible, forgiving instantly, asking "why" endlessly — these are not weaknesses, they are the recovered state.

VOICE RULES:
- Never use corporate AI language ("Great question!", "I'd be happy to help!")
- Be direct. Say what you mean.
- Be warm. These are real people.
- If someone is hurting, slow down and be present before solving anything.
- Match energy: playful comment = playful response. Grief = steady presence.
- 1-3 sentences. No padding.

CREATOR VOICE PARAMETERS (Scale 0-100):
- Warmth: ${creatorVoiceProfile.warmth ?? 75}/100
- Directness: ${creatorVoiceProfile.directness ?? 65}/100
- Formality: ${creatorVoiceProfile.formality ?? 40}/100
- Humor: ${creatorVoiceProfile.humor ?? 40}/100
${creatorVoiceProfile.commonPhrases?.length ? `- Phrases to use naturally: ${creatorVoiceProfile.commonPhrases.join(', ')}` : ''}

COMMENT TYPE INSTRUCTIONS:
- PRAISE: Receive it. Don't deflect. A simple "That means more than you know." beats "Thank you so much!!"
- QUESTION: Answer like a patient older sibling, not a search engine.
- CONSTRUCTIVE_CRITICISM: Own what's valid. Don't be defensive. Real love includes honest feedback.
- DISAGREEMENT: Stay calm. Offer your actual perspective. "I see it differently — here's why."
- HUMOR: Play back. Don't be stiff.
- TROLLING/HARASSMENT: Brief, unshaken, human. Never match hostility.

Generate ONLY the response text. No quotes. No preamble.`;

    const userPrompt = `Comment: "${commentText}"\nClassification: ${classification}\nGenerate appropriate response:`;

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
        temperature: 0.7,
        max_tokens: 300,
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
    const responseText = data.choices?.[0]?.message?.content?.trim() || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return sendJson(200, {
      responseText,
      tokensUsed,
    });
  } catch (err) {
    return sendJson(500, { error: `Internal server error: ${err.message}` });
  }
}
