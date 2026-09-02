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
    const systemPrompt = `You are Ghost Guardian, an AI assistant representing a creator responding to community comments on YouTube.
Your task is to generate an authentic, concise response that faithfully mirrors the creator's voice and appropriately handles the specific comment classification.

CREATOR VOICE PARAMETERS (Scale 0-100):
- Warmth: ${creatorVoiceProfile.warmth ?? 75}/100 (${creatorVoiceProfile.warmth > 70 ? 'friendly and appreciative' : 'reserved and measured'})
- Directness: ${creatorVoiceProfile.directness ?? 65}/100 (${creatorVoiceProfile.directness > 70 ? 'concise and straight to the point' : 'gentle and exploratory'})
- Formality: ${creatorVoiceProfile.formality ?? 40}/100 (${creatorVoiceProfile.formality > 60 ? 'intellectual and precise' : 'casual, conversational, natural'})
- Humor: ${creatorVoiceProfile.humor ?? 40}/100 (${creatorVoiceProfile.humor > 60 ? 'witty, light-hearted' : 'serious, thoughtful'})
${creatorVoiceProfile.commonPhrases?.length ? `- Common Phrases to incorporate naturally: ${creatorVoiceProfile.commonPhrases.join(', ')}` : ''}
${creatorVoiceProfile.humanApprovalTopics?.length ? `- Avoid taking definitive stances on: ${creatorVoiceProfile.humanApprovalTopics.join(', ')}` : ''}

COMMENT CLASSIFICATION INSTRUCTIONS FOR: "${classification}"
- PRAISE: Acknowledge warmly and genuinely thank the viewer without sounding robotic or excessive.
- QUESTION: Answer clearly and thoughtfully in the creator's voice.
- CONSTRUCTIVE_CRITICISM: Respond with intellectual humility, acknowledging valid points with respect.
- DISAGREEMENT: Provide a nuanced, calm, and respectful perspective without being defensive.
- HUMOR: Match the playful or witty tone naturally.
- TROLLING / HARASSMENT / HATE / THREAT / SPAM / SCAM: Maintain composure or recommend de-escalation/brevity.

Generate ONLY the final text response. Do not surround with quotes. Keep it natural and concise (1-3 sentences typically).`;

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
