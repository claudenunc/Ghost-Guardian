/* Strategy Engine — Determines the appropriate response posture */

import { CATEGORIES, RISK_LEVELS } from './classifier';

const STRATEGIES = {
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  APPRECIATE: 'APPRECIATE',
  ANSWER: 'ANSWER',
  EXPLORE: 'EXPLORE',
  CLARIFY: 'CLARIFY',
  DISCUSS: 'DISCUSS',
  DE_ESCALATE: 'DE_ESCALATE',
  BOUNDARY: 'BOUNDARY',
  HUMOR: 'HUMOR',
  SILENCE: 'SILENCE',
  ESCALATE: 'ESCALATE',
};

const strategyDescriptions = {
  [STRATEGIES.ACKNOWLEDGE]: 'A brief, genuine acknowledgment',
  [STRATEGIES.APPRECIATE]: 'Meaningful recognition of support or contribution',
  [STRATEGIES.ANSWER]: 'Direct, grounded answer using available knowledge',
  [STRATEGIES.EXPLORE]: 'Thoughtful engagement with the idea presented',
  [STRATEGIES.CLARIFY]: 'Clear up a misunderstanding with respect',
  [STRATEGIES.DISCUSS]: 'Open, constructive dialogue about a disagreement',
  [STRATEGIES.DE_ESCALATE]: 'Calm the situation without surrendering or escalating',
  [STRATEGIES.BOUNDARY]: 'Set a clear boundary without cruelty',
  [STRATEGIES.HUMOR]: 'Light, appropriate humor matching the tone',
  [STRATEGIES.SILENCE]: 'No response — engagement would not add value',
  [STRATEGIES.ESCALATE]: 'Flag for human review — situation requires personal attention',
};

function determineStrategy(classification, context = {}) {
  const { category, risk, sentiment, confidence } = classification;
  const { guardianWit, creatorPrefs } = context;

  // Critical risk always escalates
  if (risk === RISK_LEVELS.CRITICAL) {
    return {
      strategy: STRATEGIES.ESCALATE,
      reason: 'Critical risk detected — requires human review',
      shouldAutoReply: false,
      requiresHumanReview: true,
    };
  }

  // Low confidence routes to human review
  if (confidence < 0.4) {
    return {
      strategy: STRATEGIES.ESCALATE,
      reason: 'Low classification confidence — human judgment recommended',
      shouldAutoReply: false,
      requiresHumanReview: true,
    };
  }

  let strategy, reason, shouldAutoReply = false, requiresHumanReview = false;

  switch (category) {
    case CATEGORIES.PRAISE:
      if (classification.text?.length > 100 || sentiment === 'positive') {
        strategy = STRATEGIES.APPRECIATE;
        reason = 'Meaningful praise deserves genuine appreciation';
      } else {
        strategy = STRATEGIES.ACKNOWLEDGE;
        reason = 'Simple praise — brief acknowledgment';
        shouldAutoReply = true;
      }
      break;

    case CATEGORIES.QUESTION:
      strategy = STRATEGIES.ANSWER;
      reason = 'Genuine question — provide grounded response';
      break;

    case CATEGORIES.CONSTRUCTIVE_CRITICISM:
      strategy = STRATEGIES.DISCUSS;
      reason = 'Constructive criticism — engage respectfully';
      break;

    case CATEGORIES.DISAGREEMENT:
      strategy = STRATEGIES.DISCUSS;
      reason = 'Intellectual disagreement — explore the perspective';
      break;

    case CATEGORIES.HUMOR:
      strategy = guardianWit ? STRATEGIES.HUMOR : STRATEGIES.ACKNOWLEDGE;
      reason = guardianWit ? 'Humorous comment — match the energy' : 'Humor detected — light acknowledgment';
      break;

    case CATEGORIES.TROLLING:
      if (guardianWit) {
        strategy = STRATEGIES.DE_ESCALATE;
        reason = 'Trolling — de-escalate with composure';
      } else {
        strategy = STRATEGIES.SILENCE;
        reason = 'Trolling — engagement unlikely to add value';
      }
      break;

    case CATEGORIES.HARASSMENT:
      strategy = STRATEGIES.BOUNDARY;
      reason = 'Personal attack — set a clear boundary';
      requiresHumanReview = true;
      break;

    case CATEGORIES.HATE:
      strategy = STRATEGIES.ESCALATE;
      reason = 'Hate speech — requires human review';
      requiresHumanReview = true;
      break;

    case CATEGORIES.SPAM:
      strategy = STRATEGIES.SILENCE;
      reason = 'Spam — ignore';
      shouldAutoReply = false;
      break;

    case CATEGORIES.SCAM:
      strategy = STRATEGIES.SILENCE;
      reason = 'Scam — ignore and optionally report';
      shouldAutoReply = false;
      break;

    case CATEGORIES.THREAT:
      strategy = STRATEGIES.ESCALATE;
      reason = 'Threat detected — immediate human review required';
      requiresHumanReview = true;
      break;

    case CATEGORIES.SENSITIVE:
      strategy = STRATEGIES.EXPLORE;
      reason = 'Sensitive content — respond with care and compassion';
      requiresHumanReview = true;
      break;

    default:
      strategy = STRATEGIES.ACKNOWLEDGE;
      reason = 'General comment — brief acknowledgment';
      break;
  }

  return {
    strategy,
    reason,
    shouldAutoReply,
    requiresHumanReview,
    description: strategyDescriptions[strategy],
  };
}

export { determineStrategy, STRATEGIES, strategyDescriptions };
