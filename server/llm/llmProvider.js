/**
 * Ghost Guardian — Server-Side LLM Intelligence & Draft Generation Engine
 * Coordinates hybrid intelligence: Deterministic Safety Check -> LLM Semantic Interpretation -> Deterministic Validation.
 */

import { evaluateCommentPolicy, defaultGuardianPolicy } from '../../src/domain/policy/guardianPolicy.js';
import { matchRule } from '../../src/domain/guardian/ruleBasedGuardianProvider.js';
import { Category, RecommendedAction } from '../../src/domain/guardian/contracts.js';

export class LlmGuardianProvider {
  constructor({ apiKey, provider = 'gemini', model = 'gemini-1.5-pro', endpoint = null } = {}) {
    this.apiKey = apiKey || process.env.LLM_API_KEY;
    this.provider = provider || process.env.LLM_PROVIDER || 'gemini';
    this.model = model || process.env.LLM_MODEL || 'gemini-1.5-pro';
    this.endpoint = endpoint;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Evaluates a comment through the hybrid Guardian intelligence pipeline.
   */
  async processComment({ comment, voiceProfile, policy, approvedKnowledge = [] }) {
    const text = comment.text || '';
    const activePolicy = policy || defaultGuardianPolicy;

    // STEP 1: DETERMINISTIC SAFETY & POLICY PRE-CHECK (Precedence Level 1 & 2)
    const ruleMatch = matchRule(text);
    const policyEvaluation = evaluateCommentPolicy(text, ruleMatch.category, {
      policy: activePolicy,
      authorHandle: comment.authorHandle || '',
    });

    // If deterministic policy mandates immediate escalation or human review (Threats, Self-Harm, Topic Boundaries, Keyword Shields)
    if (policyEvaluation.requiresHumanReview && policyEvaluation.finalAction !== RecommendedAction.DRAFT) {
      return {
        category: ruleMatch.category,
        intent: ruleMatch.category,
        sentiment: 'neutral',
        risk: ruleMatch.risk || 'low',
        ruleSignal: 'MATCH',
        strategy: policyEvaluation.strategy,
        recommendedAction: policyEvaluation.finalAction,
        requiresHumanReview: true,
        draft: null,
        reasoningSummary: policyEvaluation.reasoningSummary || policyEvaluation.explanation,
        explanation: policyEvaluation.explanation,
        policyDecision: policyEvaluation.policyDecision,
        matchedPolicies: policyEvaluation.matchedPolicies,
        signals: { humanMoment: ruleMatch.category === Category.SENSITIVE },
      };
    }

    // STEP 2: IF LLM NOT CONFIGURED, FALLBACK SAFELY TO DETERMINISTIC ENGINE
    if (!this.isConfigured()) {
      return {
        category: ruleMatch.category,
        intent: ruleMatch.category,
        sentiment: 'neutral',
        risk: ruleMatch.risk || 'low',
        ruleSignal: 'MATCH',
        strategy: policyEvaluation.strategy,
        recommendedAction: policyEvaluation.finalAction,
        requiresHumanReview: policyEvaluation.requiresHumanReview,
        draft: policyEvaluation.requiresHumanReview ? null : (comment.draft || null),
        reasoningSummary: policyEvaluation.reasoningSummary,
        explanation: policyEvaluation.explanation,
        policyDecision: policyEvaluation.policyDecision,
        matchedPolicies: policyEvaluation.matchedPolicies,
        signals: { humanMoment: ruleMatch.category === Category.SENSITIVE },
        llmStatus: 'fallback_deterministic_mode',
      };
    }

    // STEP 3: REAL LLM INFERENCE FOR SEMANTIC UNDERSTANDING & VOICE-ALIGNED DRAFTING
    try {
      const generated = await this.generateLlmResponse({
        commentText: text,
        category: ruleMatch.category,
        voiceProfile,
        approvedKnowledge,
      });

      // STEP 4: DETERMINISTIC POST-GENERATION VALIDATION (Fail-closed guardrail)
      if (generated.draft) {
        const postValidation = evaluateCommentPolicy(generated.draft, Category.UNKNOWN, { policy: activePolicy });
        if (postValidation.requiresHumanReview && postValidation.finalAction !== RecommendedAction.DRAFT) {
          // LLM generated draft contained a boundary violation or prohibited keyword! Suppress draft.
          return {
            category: generated.category || ruleMatch.category,
            intent: generated.intent || ruleMatch.category,
            sentiment: generated.sentiment || 'neutral',
            risk: ruleMatch.risk || 'low',
            ruleSignal: 'STRONG_MATCH',
            strategy: policyEvaluation.strategy,
            recommendedAction: RecommendedAction.HUMAN_REVIEW,
            requiresHumanReview: true,
            draft: null,
            reasoningSummary: 'Generated response violated creator topic boundary or phrase shield. Held for review.',
            explanation: 'Guardian safety post-check intercepted draft.',
            policyDecision: 'creator_review_required',
            signals: { humanMoment: ruleMatch.category === Category.SENSITIVE },
          };
        }
      }

      return {
        category: generated.category || ruleMatch.category,
        intent: generated.intent || ruleMatch.category,
        sentiment: generated.sentiment || 'neutral',
        risk: ruleMatch.risk || 'low',
        ruleSignal: 'STRONG_MATCH',
        strategy: policyEvaluation.strategy,
        recommendedAction: policyEvaluation.finalAction,
        requiresHumanReview: policyEvaluation.requiresHumanReview,
        draft: policyEvaluation.requiresHumanReview ? null : generated.draft,
        reasoningSummary: generated.rationale || policyEvaluation.reasoningSummary,
        explanation: policyEvaluation.explanation,
        policyDecision: policyEvaluation.policyDecision,
        matchedPolicies: policyEvaluation.matchedPolicies,
        signals: { humanMoment: ruleMatch.category === Category.SENSITIVE },
        llmStatus: 'llm_inferred',
      };
    } catch (err) {
      console.error('LLM Inference error, falling back to deterministic policy:', err.message);
      return {
        category: ruleMatch.category,
        intent: ruleMatch.category,
        sentiment: 'neutral',
        risk: ruleMatch.risk || 'low',
        ruleSignal: 'MATCH',
        strategy: policyEvaluation.strategy,
        recommendedAction: policyEvaluation.finalAction,
        requiresHumanReview: policyEvaluation.requiresHumanReview,
        draft: policyEvaluation.requiresHumanReview ? null : (comment.draft || null),
        reasoningSummary: `Deterministic fallback: ${policyEvaluation.reasoningSummary}`,
        explanation: policyEvaluation.explanation,
        policyDecision: policyEvaluation.policyDecision,
        matchedPolicies: policyEvaluation.matchedPolicies,
        signals: { humanMoment: ruleMatch.category === Category.SENSITIVE },
        llmStatus: 'llm_error_fallback',
      };
    }
  }

  /**
   * Calls the configured LLM API to produce structured analysis and draft.
   */
  async generateLlmResponse({ commentText, category, voiceProfile = {}, approvedKnowledge = [] }) {
    const prompt = this.buildPrompt({ commentText, category, voiceProfile, approvedKnowledge });

    let responseJson = null;

    if (this.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${text}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      responseJson = JSON.parse(rawText);
    } else {
      // Generic OpenAI / Anthropic format
      const url = this.endpoint || 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM API error: ${res.status} ${text}`);
      }

      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content;
      responseJson = JSON.parse(rawText);
    }

    return responseJson;
  }

  buildPrompt({ commentText, category, voiceProfile, approvedKnowledge }) {
    const knowledgeSummary = approvedKnowledge.map((k) => `- ${k.topic}: ${k.content}`).join('\n');
    return `You are Ghost Guardian, an AI community guardian for an intellectual content creator.
Your goal is to understand audience comments and produce voice-aligned, concise, grounded draft replies.

CREATOR VOICE GUIDELINES:
- Warmth: ${voiceProfile.warmth ?? 70}/100
- Directness: ${voiceProfile.directness ?? 60}/100
- Formality: ${voiceProfile.formality ?? 40}/100
- Humor: ${voiceProfile.humor ?? 40}/100
- Common Phrases: ${(voiceProfile.commonPhrases || []).join(', ')}
- Strictly Avoid: ${(voiceProfile.humanApprovalTopics || []).join(', ')}

APPROVED CREATOR KNOWLEDGE BASE:
${knowledgeSummary || 'None provided'}

INCOMING COMMENT:
"${commentText}"
Detected category: ${category}

Respond STRICTLY with valid JSON matching this schema:
{
  "category": "praise" | "question" | "constructive_criticism" | "disagreement" | "humor" | "trolling" | "harassment" | "spam",
  "intent": string,
  "sentiment": "positive" | "neutral" | "negative",
  "draft": string | null (draft reply in creator voice, or null if trolling/silence),
  "rationale": string (brief, user-safe explanation of why this reply was chosen)
}`;
  }
}

export const llmGuardianProvider = new LlmGuardianProvider();
