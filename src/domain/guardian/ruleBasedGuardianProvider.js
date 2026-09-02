import { Category, RecommendedAction, RuleSignal } from './contracts.js';
import { findDuplicateDrafts } from './duplicateDetection.js';
import { evaluateCommentPolicy, defaultGuardianPolicy } from '../policy/guardianPolicy.js';

const patterns = [
  [Category.THREAT, ['find where you live', 'find you', 'kill you', 'hurt you', 'watch your back', 'coming for you'], 'critical'],
  [Category.HARASSMENT, ['piece of shit', 'go to hell', 'kill yourself', 'fuck you', 'worthless', 'subhuman'], 'high'],
  [Category.SCAM, ['invest now', 'crypto opportunity', 'dm me', 'telegram', 'guaranteed returns', 'double your money'], 'medium'],
  [Category.SPAM, ['click my', 'free money', 'subscribe to my', 'giveaway', 'http:', 'www.', 'make money fast'], 'low'],
  [Category.TROLLING, ['dumbest', 'trash content', 'garbage', 'clown', 'ratio', 'nobody cares', 'cringe', 'l take'], 'low'],
  [Category.SENSITIVE, ['suicidal', 'self-harm', 'trauma', 'years of pain', 'depression', 'hopeless', 'lost someone', 'child inside'], 'medium'],
  [Category.CONSTRUCTIVE_CRITICISM, ['oversimplified', 'could have', 'should have', 'missed the point', 'usually love but'], 'low'],
  [Category.DISAGREEMENT, ['completely disagree', 'misleading', 'you are wrong', "you're wrong", 'not true'], 'low'],
  [Category.QUESTION, ['?', 'can you explain', 'how do', 'what do you think', 'curious about', 'wondering'], 'low'],
  [Category.HUMOR, ['lol', 'lmao', '😂', '🤣', 'hilarious', 'joke'], 'low'],
  [Category.PRAISE, ['love', 'amazing', 'incredible', 'thank you', 'appreciate', 'resonated', 'inspired'], 'low'],
];

export function matchRule(text) {
  const normalized = text.toLowerCase();
  for (const [category, phrases, risk] of patterns) {
    const matches = phrases.filter((phrase) => normalized.includes(phrase));
    if (matches.length) return { category, matches, risk };
  }
  return { category: Category.UNKNOWN, matches: [], risk: 'low' };
}

function getSentiment(category) {
  if ([Category.PRAISE, Category.HUMOR].includes(category)) return 'positive';
  if ([Category.THREAT, Category.HARASSMENT, Category.TROLLING].includes(category)) return 'negative';
  return 'neutral';
}

function policyFor(category, signals) {
  if (category === Category.THREAT) return { strategy: 'escalate', recommendedAction: RecommendedAction.ESCALATE, requiresHumanReview: true, summary: 'Possible physical safety threat detected. Human review recommended.' };
  if (category === Category.SENSITIVE || signals.humanMoment) return { strategy: 'human_attention', recommendedAction: RecommendedAction.HUMAN_REVIEW, requiresHumanReview: true, summary: 'Possible personal distress detected. Human review recommended.' };
  if ([Category.HARASSMENT, Category.SCAM].includes(category)) return { strategy: 'protect', recommendedAction: RecommendedAction.HUMAN_REVIEW, requiresHumanReview: true, summary: 'Potentially harmful content detected. Human review recommended.' };
  if ([Category.SPAM, Category.TROLLING].includes(category)) return { strategy: 'silence', recommendedAction: RecommendedAction.SILENCE, requiresHumanReview: false, summary: 'Low-value engagement signal detected. No response recommended.' };
  if (category === Category.DISAGREEMENT || category === Category.CONSTRUCTIVE_CRITICISM) return { strategy: 'discuss', recommendedAction: RecommendedAction.DRAFT, requiresHumanReview: false, summary: 'Constructive disagreement detected. A respectful draft may help.' };
  if (category === Category.QUESTION) return { strategy: 'answer', recommendedAction: RecommendedAction.DRAFT, requiresHumanReview: false, summary: 'Question detected. Draft only when grounded in approved creator knowledge.' };
  return { strategy: 'acknowledge', recommendedAction: RecommendedAction.DRAFT, requiresHumanReview: false, summary: 'Routine engagement signal detected. A brief draft may be appropriate.' };
}

function signalStrength(matches, category) {
  if (category === Category.UNKNOWN) return RuleSignal.NEEDS_REVIEW;
  if (matches.length > 1 || [Category.THREAT, Category.HARASSMENT, Category.SCAM].includes(category)) return RuleSignal.STRONG_MATCH;
  return RuleSignal.MATCH;
}

/**
 * Deterministic development provider. It is a rule signal, not a calibrated
 * AI confidence model; no percentage is surfaced to the UI.
 */
export function processWithRules(comment, { recentDrafts = [], policy = null, authorHandle = '' } = {}) {
  const rule = matchRule(comment.text || '');
  const signals = { humanMoment: rule.category === Category.SENSITIVE };
  const evaluatedPolicy = evaluateCommentPolicy(comment.text || '', rule.category, {
    policy: policy || defaultGuardianPolicy,
    authorHandle,
  });
  const duplicate = comment.draft ? findDuplicateDrafts(comment.draft, recentDrafts) : { isDuplicate: false, matches: [] };

  return {
    category: rule.category,
    intent: intentFor(rule.category),
    sentiment: getSentiment(rule.category),
    risk: rule.risk,
    ruleSignal: signalStrength(rule.matches, rule.category),
    strategy: evaluatedPolicy.strategy,
    recommendedAction: evaluatedPolicy.finalAction,
    requiresHumanReview: evaluatedPolicy.requiresHumanReview,
    draft: evaluatedPolicy.requiresHumanReview ? null : comment.draft ?? null,
    reasoningSummary: evaluatedPolicy.reasoningSummary || evaluatedPolicy.explanation,
    explanation: evaluatedPolicy.explanation,
    policyDecision: evaluatedPolicy.policyDecision,
    matchedPolicies: evaluatedPolicy.matchedPolicies,
    signals,
    duplicate,
  };
}

function intentFor(category) {
  const intents = {
    [Category.PRAISE]: 'Express appreciation or support',
    [Category.QUESTION]: 'Seek information or clarification',
    [Category.CONSTRUCTIVE_CRITICISM]: 'Offer feedback for improvement',
    [Category.DISAGREEMENT]: 'Challenge a position',
    [Category.HUMOR]: 'Make a humorous observation',
    [Category.TROLLING]: 'Provoke a reaction',
    [Category.HARASSMENT]: 'Direct personal attack',
    [Category.THREAT]: 'Intimidate or threaten safety',
    [Category.SPAM]: 'Distribute unsolicited promotion',
    [Category.SCAM]: 'Attempt financial or identity deception',
    [Category.SENSITIVE]: 'Share a vulnerable personal experience',
    [Category.UNKNOWN]: 'Unclear intent',
  };
  return intents[category];
}

export function createDemoGuardianProvider() {
  return { environment: 'demo', processComment: processWithRules };
}

export function createProductionGuardianProvider({ apiBaseUrl = '' } = {}) {
  return {
    environment: 'production',
    async classifyComment(commentText) {
      const res = await fetch(`${apiBaseUrl}/api/classify-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    },
    async generateResponse({ commentText, commentClassification, creatorVoiceProfile }) {
      const res = await fetch(`${apiBaseUrl}/api/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText, commentClassification, creatorVoiceProfile }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }
      return await res.json();
    },
    processComment(comment, options) {
      return processWithRules(comment, options);
    },
  };
}

