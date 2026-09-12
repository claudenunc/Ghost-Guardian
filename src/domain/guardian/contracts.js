export const Category = Object.freeze({
  PRAISE: 'PRAISE',
  QUESTION: 'QUESTION',
  CONSTRUCTIVE_CRITICISM: 'CONSTRUCTIVE_CRITICISM',
  DISAGREEMENT: 'DISAGREEMENT',
  HUMOR: 'HUMOR',
  TROLLING: 'TROLLING',
  HARASSMENT: 'HARASSMENT',
  HATE: 'hate',
  THREAT: 'THREAT',
  SPAM: 'SPAM',
  SCAM: 'SCAM',
  SENSITIVE: 'SENSITIVE',
  SENSITIVE_CRITICAL: 'sensitive_critical',
  UNKNOWN: 'UNKNOWN',
});

export const RuleSignal = Object.freeze({
  STRONG_MATCH: 'strong_match',
  MATCH: 'match',
  WEAK_MATCH: 'weak_match',
  NEEDS_REVIEW: 'needs_review',
});

export const RecommendedAction = Object.freeze({
  DRAFT: 'draft',
  SILENCE: 'silence',
  DE_ESCALATE: 'de_escalate',
  ESCALATE: 'escalate',
  HUMAN_REVIEW: 'human_review',
});

