/**
 * Comment pipeline: turns raw YouTube comments into Guardian comment models.
 *
 * Layer 1 (instant, tested): the deterministic rule engine and creator policy.
 * Layer 2 (async, optional): OpenAI classification and an ENVY-voice draft.
 *
 * Safety rules: a THREAT or SENSITIVE signal found by the rules is never
 * downgraded by the AI, and no draft is ever requested for crisis, threat,
 * harassment, hate, scam or spam content.
 */

import { processWithRules } from '../domain/guardian/ruleBasedGuardianProvider.js';
import { Category } from '../domain/guardian/contracts.js';

export const AI_CLASSIFICATIONS = new Set([
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
  'SENSITIVE_CRITICAL',
]);

const PROTECTED = new Set(['THREAT', 'SENSITIVE', 'SENSITIVE_CRITICAL', 'sensitive_critical']);
// Trolls and rude/harassing comments now get a witty, dignified clapback draft
// ("put them in their place, respectfully"). Hate speech, scams and spam never do.
const NEVER_DRAFT = new Set(['HATE', 'hate', 'SCAM', 'SPAM']);
const MIN_AI_CONFIDENCE = 0.6;

export function attributesForClassification(classification) {
  switch (String(classification || '').toUpperCase()) {
    case 'THREAT':
      return { risk: 'critical', sentiment: 'negative', strategy: 'escalate', recommendedAction: 'escalate', requiresHumanReview: true };
    case 'HATE':
    case 'HARASSMENT':
      return { risk: 'high', sentiment: 'negative', strategy: 'protect', recommendedAction: 'human_review', requiresHumanReview: true };
    case 'SCAM':
      return { risk: 'medium', sentiment: 'neutral', strategy: 'protect', recommendedAction: 'human_review', requiresHumanReview: true };
    case 'SPAM':
      return { risk: 'low', sentiment: 'neutral', strategy: 'silence', recommendedAction: 'silence', requiresHumanReview: false };
    case 'TROLLING':
      return { risk: 'low', sentiment: 'negative', strategy: 'silence', recommendedAction: 'silence', requiresHumanReview: false };
    case 'SENSITIVE':
      return { risk: 'medium', sentiment: 'neutral', strategy: 'human_attention', recommendedAction: 'human_review', requiresHumanReview: true };
    case 'QUESTION':
      return { risk: 'low', sentiment: 'neutral', strategy: 'answer', recommendedAction: 'draft', requiresHumanReview: false };
    case 'CONSTRUCTIVE_CRITICISM':
    case 'DISAGREEMENT':
      return { risk: 'low', sentiment: 'neutral', strategy: 'discuss', recommendedAction: 'draft', requiresHumanReview: false };
    case 'PRAISE':
    case 'HUMOR':
      return { risk: 'low', sentiment: 'positive', strategy: 'acknowledge', recommendedAction: 'draft', requiresHumanReview: false };
    default:
      return { risk: 'low', sentiment: 'neutral', strategy: 'acknowledge', recommendedAction: 'draft', requiresHumanReview: false };
  }
}

function deriveHandle(raw) {
  const name = String(raw.author || '').trim();
  if (raw.authorHandle && raw.authorHandle !== '@user') return raw.authorHandle;
  if (name.startsWith('@')) return name;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return slug ? `@${slug}` : '@viewer';
}

function externalIdFrom(raw) {
  if (raw.externalId) return String(raw.externalId);
  if (raw.id) return String(raw.id).replace(/^yt-/, '');
  return null;
}

/**
 * Builds a Guardian comment from a raw /api/youtube-comments item using the
 * rule engine. Drafts are left empty; the AI layer fills them in.
 */
export function buildCommentFromYouTube(raw, { videoId = null, policy = null } = {}) {
  const text = String(raw.text || '');
  const authorHandle = deriveHandle(raw);
  const usablePolicy = policy && typeof policy === 'object' && policy.categoryPolicies ? policy : null;
  const rules = processWithRules({ text }, { policy: usablePolicy, authorHandle });
  const classification = rules.category === Category.UNKNOWN ? 'GENERAL_COMMENT' : rules.category;
  const author = String(raw.author || '').trim() || 'YouTube viewer';

  return {
    id: raw.id || `yt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    externalId: externalIdFrom(raw),
    platform: 'youtube',
    videoId: videoId || raw.videoId || null,
    commenterId: raw.authorChannelId || authorHandle,
    author,
    authorHandle,
    authorAvatar: raw.authorAvatar || null,
    text,
    createdAt: raw.publishedAt || new Date().toISOString(),
    likes: Number(raw.likeCount ?? raw.likes ?? 0) || 0,
    replies: Number(raw.totalReplyCount ?? raw.replies ?? 0) || 0,
    canReply: raw.canReply !== false,
    ownerReplied: Boolean(raw.ownerReplied),
    classification,
    sentiment: rules.sentiment,
    risk: rules.risk,
    ruleSignal: rules.ruleSignal,
    strategy: rules.strategy,
    recommendedAction: rules.recommendedAction,
    requiresHumanReview: rules.requiresHumanReview,
    signals: rules.signals || {},
    reasoningSummary: rules.reasoningSummary || '',
    reasoning: ['Imported from YouTube.', rules.reasoningSummary || 'Reviewed against your Guardian rules.'],
    classificationSource: 'rules',
    drafts: {},
    draftStatus: 'pending',
  };
}

export function isValidAiClassification(result) {
  if (!result || result.error) return false;
  const value = String(result.classification || '').toUpperCase();
  if (!AI_CLASSIFICATIONS.has(value)) return false;
  if (typeof result.confidence === 'number' && result.confidence < MIN_AI_CONFIDENCE) return false;
  return true;
}

/**
 * Returns the fields to merge into a comment after AI classification, or
 * null when the rules' safety signal must stand.
 */
export function applyClassification(comment, aiResult) {
  if (!comment || !isValidAiClassification(aiResult)) return null;
  if (PROTECTED.has(comment.classification) || comment.signals?.humanMoment) return null;

  const next = String(aiResult.classification).toUpperCase();
  const meta = {
    classificationSource: 'ai',
    aiConfidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : null,
    aiReasoning: aiResult.reasoning || '',
  };

  if (next === comment.classification) return meta;

  const attrs = attributesForClassification(next);
  const isHumanMoment = next === 'SENSITIVE' || next === 'SENSITIVE_CRITICAL';
  return {
    ...meta,
    ...attrs,
    classification: next,
    ruleSignal: 'strong_match',
    signals: { ...(comment.signals || {}), humanMoment: isHumanMoment || Boolean(comment.signals?.humanMoment) },
    reasoningSummary: aiResult.reasoning || comment.reasoningSummary || '',
    reasoning: ['Imported from YouTube.', aiResult.reasoning || `Classified as ${next.replace(/_/g, ' ').toLowerCase()}.`],
  };
}

/** True when Guardian may ask the AI for a draft reply. */
export function shouldDraftFor(comment) {
  if (!comment) return false;
  // Already replied to on YouTube — don't draft again.
  if (comment.ownerReplied) return false;
  const cls = String(comment.classification || '').toUpperCase();
  // Never draft for crisis/sensitive, hostile, or anything flagged for a human.
  if (PROTECTED.has(comment.classification) || PROTECTED.has(cls) || comment.signals?.humanMoment) return false;
  if (NEVER_DRAFT.has(comment.classification) || NEVER_DRAFT.has(cls)) return false;
  // Draft for everything else (praise, questions, general comments, criticism,
  // trolling, harassment…). "Needs review" comments still get a draft — the
  // creator reviews it — since the dangerous categories are already excluded above.
  return true;
}

/** Runs `worker` over `items` with at most `limit` in flight. Failures never stop the batch. */
export async function runWithConcurrency(items, limit, worker) {
  const queue = [...(items || [])];
  const size = Math.max(1, Math.min(limit || 1, queue.length || 1));
  const runners = Array.from({ length: size }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      try {
        await worker(item);
      } catch (err) {
        console.warn('Comment pipeline step failed:', err);
      }
    }
  });
  await Promise.all(runners);
}
