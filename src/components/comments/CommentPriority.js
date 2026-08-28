/**
 * Comment Prioritization Engine for Ghost Guardian
 * Computes deterministic hierarchy and lane categorization.
 */

export const PriorityRank = Object.freeze({
  HUMAN_MOMENT: 1,
  CRITICAL_SAFETY: 2,
  SENSITIVE_REVIEW: 3,
  HIGH_VALUE_CRITICISM: 4,
  IMPORTANT_QUESTION: 5,
  ROUTINE_CONVERSATION: 6,
  TROLLING_BAIT: 7,
  SPAM_ABUSE: 8,
});

export function getCommentPriority(comment) {
  // 1. Human Moments: Highest emotional and human connection value
  if (comment.signals?.humanMoment || comment.classification === 'SENSITIVE') {
    return PriorityRank.HUMAN_MOMENT;
  }

  // 2. Threat / Critical Safety: Urgent creator protection
  if (comment.classification === 'THREAT' || comment.risk === 'critical') {
    return PriorityRank.CRITICAL_SAFETY;
  }

  // 3. Sensitive / Scam / Harassment requiring human review
  if (comment.classification === 'SCAM' || comment.requiresHumanReview || comment.risk === 'high') {
    return PriorityRank.SENSITIVE_REVIEW;
  }

  // 4. High-value criticism / high engagement discussion
  if (
    comment.classification === 'CONSTRUCTIVE_CRITICISM' ||
    (comment.classification === 'DISAGREEMENT' && (comment.likes > 50 || comment.replies > 5))
  ) {
    return PriorityRank.HIGH_VALUE_CRITICISM;
  }

  // 5. Important Questions
  if (comment.classification === 'QUESTION') {
    return PriorityRank.IMPORTANT_QUESTION;
  }

  // 6. Routine conversations (praise, humor, general)
  if (['PRAISE', 'HUMOR', 'GENERAL_COMMENT'].includes(comment.classification)) {
    return PriorityRank.ROUTINE_CONVERSATION;
  }

  // 7. Trolling / Bait
  if (comment.classification === 'TROLLING') {
    return PriorityRank.TROLLING_BAIT;
  }

  // 8. Spam
  return PriorityRank.SPAM_ABUSE;
}

export function isNeedsYou(comment, state) {
  // Needs You is for items that genuinely require creator attention or judgment:
  // - Human Moments
  // - Threats and critical/high safety risks
  // - High-value constructive criticism
  // - Unanswered questions
  // - Ambiguous / needs-review items
  // Must still be in pending status
  if (state?.status && state.status !== 'pending') return false;

  const priority = getCommentPriority(comment);
  return (
    priority <= PriorityRank.IMPORTANT_QUESTION ||
    comment.ruleSignal === 'needs_review' ||
    comment.recommendedAction === 'human_review' ||
    comment.recommendedAction === 'escalate'
  );
}

export function isShieldVault(comment) {
  // Hostile, high-risk, harassment, threat, scam material
  return (
    comment.classification === 'THREAT' ||
    comment.classification === 'HARASSMENT' ||
    comment.risk === 'critical' ||
    comment.risk === 'high' ||
    comment.strategy === 'protect'
  );
}

export function isHumanMoment(comment) {
  return Boolean(comment.signals?.humanMoment || comment.classification === 'SENSITIVE');
}

export function isSilenceRecommended(comment) {
  return comment.recommendedAction === 'silence' || comment.strategy === 'silence';
}

export function isHandled(state) {
  return state?.status && state.status !== 'pending';
}

export function isReviewQueue(comment, state) {
  // Regular actionable drafts ready for creator review
  if (state?.status && state.status !== 'pending') return false;
  if (isShieldVault(comment)) return false;
  if (isHumanMoment(comment)) return false;
  return Boolean(comment.drafts && Object.values(comment.drafts).some(Boolean));
}
