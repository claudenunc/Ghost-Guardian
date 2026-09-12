/**
 * Ghost Guardian — Vercel Serverless Function
 * POST /api/classify-comment
 *
 * Classifies a YouTube comment into taxonomy categories using OpenAI gpt-4o-mini.
 *
 * Self-contained — no imports from /server/.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
  'SENSITIVE',
];

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
    const { commentText } = req.body || {};

    if (!commentText || !commentText.trim()) {
      return sendJson(res, 400, { error: 'commentText is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return sendJson(res, 500, {
        error: 'OpenAI API key is missing. Set OPENAI_API_KEY in your environment variables.',
      });
    }

    const systemPrompt = `You are Ghost Guardian, an AI safety and community classification engine for content creators.
Your task is to analyze an incoming social media / YouTube comment and classify it into EXACTLY ONE of the following taxonomy categories:

CATEGORIES:
- SENSITIVE: The commenter is disclosing real emotional pain, grief, loneliness, hopelessness, despair, self-harm or suicidal ideation, or is reaching out from a dark place. Signs include talk of not wanting to be here, cutting/bleeding/harming themselves, "the child within" dying, a lifetime of suffering, or asking the creator for help with their pain. This is a human moment, never a debate or a joke.
- PRAISE: Genuine appreciation, gratitude, positive feedback, encouragement.
- QUESTION: Asking for information, clarification, recommendations, or deeper insight — in good faith.
- DISAGREEMENT: Respectful, reasoned dissent or challenging of claims without hostility.
- CONSTRUCTIVE_CRITICISM: Thoughtful suggestions for improvement, pointing out legitimate flaws.
- TROLLING: Bad-faith provocation, LOW-EFFORT mockery, baiting, or one-line dismissive sneering. A long, substantive, thoughtful comment is NOT trolling even if it is provocative, contrarian, or critical of the creator — that is DISAGREEMENT, CONSTRUCTIVE_CRITICISM, or QUESTION.
- HARASSMENT: Targeted personal insults, persistent bullying, or derogatory hostility.
- HATE: Hate speech targeting protected characteristics, identity groups, or dehumanizing language.
- THREAT: Explicit or implicit threats of physical harm, violence, doxxing, or intimidation.
- SPAM: Unsolicited promotional links, bot copy-paste, advertising, repetitive nonsense.
- SCAM: Deceptive schemes, crypto giveaways, impersonation, phishing, financial fraud.
- HUMOR: Memes, witty remarks, friendly jokes, humorous observations.

DECISION RULES (apply in order):
1. If there is ANY sign of emotional distress, grief, despair, or self-harm/suicidal language, classify as SENSITIVE — even if the comment also contains a question. A hurting person always outranks the topic they are asking about.
2. Presume good faith. Long, effortful, curious, or intellectually challenging comments are QUESTION / DISAGREEMENT / CONSTRUCTIVE_CRITICISM, not TROLLING or HARASSMENT.
3. Only use TROLLING / HARASSMENT / HATE / THREAT when the hostility is clear and bad-faith.

Respond STRICTLY in valid JSON matching this schema:
{
  "classification": "SENSITIVE" | "PRAISE" | "QUESTION" | "DISAGREEMENT" | "CONSTRUCTIVE_CRITICISM" | "TROLLING" | "HARASSMENT" | "HATE" | "THREAT" | "SPAM" | "SCAM" | "HUMOR",
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
      return sendJson(res, openAiResponse.status, {
        error: `OpenAI API Error (${openAiResponse.status}): ${parsedErr}`,
      });
    }

    const data = await openAiResponse.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();
    let result = null;

    try {
      result = JSON.parse(rawContent);
    } catch (e) {
      return sendJson(res, 500, {
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

    return sendJson(res, 200, { classification, confidence, reasoning });
  } catch (err) {
    return sendJson(res, 500, { error: `Internal server error: ${err.message}` });
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}
