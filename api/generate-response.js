/**
 * Ghost Guardian — Vercel Serverless Function
 * POST /api/generate-response
 *
 * Generates an AI response to a YouTube comment using OpenAI gpt-4o-mini
 * with the ENVY voice persona and creator voice calibration.
 *
 * Self-contained — no imports from /server/.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      commentText,
      commentClassification,
      creatorVoiceProfile = {},
      learningExamples,
      learning_examples,
      learning,
      tone,
    } = req.body || {};

    // Hard block: refuse to generate responses for crisis/threat content
    const normalizedClassification = String(commentClassification || '').trim().toUpperCase();
    if (['SENSITIVE_CRITICAL', 'SENSITIVE', 'THREAT'].includes(normalizedClassification)) {
      return sendJson(res, 400, {
        error: 'Ghost Guardian does not generate responses to crisis or threat comments. Please respond personally.',
        message: 'Ghost Guardian does not generate responses to crisis or threat comments. Please respond personally.',
      });
    }

    if (!commentText || !commentText.trim()) {
      return sendJson(res, 400, { error: 'commentText is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return sendJson(res, 500, {
        error: 'OpenAI API key is missing. Set OPENAI_API_KEY in your environment variables.',
      });
    }

    const classification = (commentClassification || 'GENERAL_COMMENT').toUpperCase();

    // Extract and format few-shot learning examples (learned from creator edits)
    const rawExamples = Array.isArray(learningExamples)
      ? learningExamples
      : Array.isArray(learning_examples)
      ? learning_examples
      : Array.isArray(learning)
      ? learning
      : [];

    const validExamples = rawExamples
      .filter((ex) => ex && (ex.before || ex.after))
      .slice(0, 5);

    const fewShotBlock = validExamples.length > 0
      ? `\n\nFEW-SHOT VOICE CALIBRATION (LEARNED FROM CREATOR EDITS):
Here are examples of how this creator edits AI drafts: [before → after]:
${validExamples.map((ex, i) => `Example ${i + 1}:\n- Before: "${ex.before || ''}"\n- After: "${ex.after || ''}"`).join('\n')}

Carefully emulate the creator's edited preferences and style corrections shown in these [before → after] examples.`
      : '';

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
- TROLLING: This is the art. Respond with genius-level wit and total composure — a clever, disarming line that quietly puts them in their place and wins the room. Never insult, never stoop, never match hostility. Let intelligence, calm, and a little humor be the mic drop. Respectful on the surface, unmistakable underneath. Make the point land without cruelty.
- HARASSMENT: Set a firm, dignified boundary. Unshaken, brief, human. Name the behavior, not the person; do not escalate.${fewShotBlock}

Generate ONLY the response text. No quotes. No preamble.`;

    const register = String(tone || '').trim().toLowerCase();
    const registerLine = ['calm', 'direct', 'warm', 'humorous'].includes(register)
      ? `Preferred register: ${register}\n`
      : '';
    const userPrompt = `Comment: "${commentText}"\nClassification: ${classification}\n${registerLine}Generate appropriate response:`;

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
      return sendJson(res, openAiResponse.status, {
        error: `OpenAI API Error (${openAiResponse.status}): ${parsedErr}`,
      });
    }

    const data = await openAiResponse.json();
    const responseText = data.choices?.[0]?.message?.content?.trim() || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return sendJson(res, 200, { responseText, tokensUsed });
  } catch (err) {
    return sendJson(res, 500, { error: `Internal server error: ${err.message}` });
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}
