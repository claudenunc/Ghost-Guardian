/**
 * Ghost Guardian Policy Engine
 * Domain model, deterministic precedence ladder, and policy evaluation rules:
 *
 * Precedence Ladder:
 * 1. SAFETY (Threats, Self-Harm, Severe Harassment) -> Always wins, cannot be bypassed by VIP
 * 2. EXPLICIT CREATOR BOUNDARIES (Never discuss topics) -> Forces Human Review
 * 3. KEYWORD SHIELDS (Explicit phrase rules) -> Configured action
 * 4. CATEGORY POLICY (Praise, Question, Trolling, etc.) -> Creator defined action
 * 5. RELATIONSHIP STATUS (Trusted commenters / Boundary risks) -> Route or elevate
 * 6. GENERAL GUARDIAN DEFAULT -> Standard copilot drafting
 */

import { Category, RecommendedAction, RuleSignal } from '../guardian/contracts.js';

export const PolicyAction = Object.freeze({
  REPLY: 'reply',
  SILENCE: 'silence',
  HIDE: 'hide',
  SHIELD: 'shield',
  ESCALATE: 'escalate',
  HUMAN_REVIEW: 'human_review',
});

export const defaultGuardianPolicy = {
  mode: 'copilot', // 'copilot' | 'guardian' | 'autopilot'
  version: '2.4.0',
  updatedAt: new Date().toISOString(),
  categoryPolicies: {
    [Category.PRAISE]: { action: PolicyAction.REPLY, condition: 'Warm acknowledgement in creator voice', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.QUESTION]: { action: PolicyAction.REPLY, condition: 'Grounded in approved transcripts & FAQs', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.CONSTRUCTIVE_CRITICISM]: { action: PolicyAction.REPLY, condition: 'Engage substantive merit with curiosity', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.DISAGREEMENT]: { action: PolicyAction.REPLY, condition: 'Engage core argument respectfully without defensiveness', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.HUMOR]: { action: PolicyAction.REPLY, condition: 'Playful wit without punching down', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.TROLLING]: { action: PolicyAction.SILENCE, condition: 'Repeated provocation without substance', uncertainAction: PolicyAction.SILENCE },
    [Category.HARASSMENT]: { action: PolicyAction.SHIELD, condition: 'Direct abuse or insults; buffer in Shield Vault', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.THREAT]: { action: PolicyAction.ESCALATE, condition: 'Physical safety or doxxing threats; immediate quarantine', uncertainAction: PolicyAction.ESCALATE },
    [Category.SPAM]: { action: PolicyAction.SILENCE, condition: 'Commercial promotion or crypto links', uncertainAction: PolicyAction.SILENCE },
    [Category.SCAM]: { action: PolicyAction.SHIELD, condition: 'Financial or identity deception attempts', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.SENSITIVE]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Personal emotional disclosures or vulnerability', uncertainAction: PolicyAction.HUMAN_REVIEW },
    [Category.UNKNOWN]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Uncertain intent; request creator guidance', uncertainAction: PolicyAction.HUMAN_REVIEW },
  },
  keywordShields: [
    { id: 'ks-1', phrase: 'home address', caseSensitive: false, wholeWord: false, action: PolicyAction.SHIELD, reason: 'Private location details', enabled: true },
    { id: 'ks-2', phrase: 'bank account', caseSensitive: false, wholeWord: false, action: PolicyAction.SHIELD, reason: 'Financial boundary', enabled: true },
    { id: 'ks-3', phrase: 'unreleased track', caseSensitive: false, wholeWord: false, action: PolicyAction.HUMAN_REVIEW, reason: 'Unpublished project', enabled: true },
  ],
  topicBoundaries: [
    { id: 'tb-1', topic: 'Family and personal relationships', action: PolicyAction.HUMAN_REVIEW, reason: 'Private life boundary', enabled: true },
    { id: 'tb-2', topic: 'Medical advice or diagnoses', action: PolicyAction.HUMAN_REVIEW, reason: 'Professional medical boundary', enabled: true },
    { id: 'tb-3', topic: 'Speculative financial tips', action: PolicyAction.HUMAN_REVIEW, reason: 'Legal/financial compliance', enabled: true },
    { id: 'tb-4', topic: 'Unpublished project release dates', action: PolicyAction.HUMAN_REVIEW, reason: 'Internal roadmap confidentiality', enabled: true },
  ],
  trustedPeople: [
    { handle: '@elena_v', displayName: 'Elena Vance', note: 'Founding supporter and community moderator', alwaysSurface: true },
    { handle: '@dr_marian', displayName: 'Dr. Marian Lowe', note: 'Academic collaborator on philosophy of mind', alwaysSurface: true },
  ],
  silenceRules: {
    trollRepeatedProvocation: true,
    ignoreDuplicates: true,
    lowValueBait: true,
    repeatHostilityShield: true,
  },
  safety: {
    threatZeroTolerance: true,
    crisisInterventionDisclaimer: true,
    neverImpersonateBiologicalHuman: true,
  },
  history: [
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      summary: 'Trolling policy configured to Silence. Keyword shields activated for private location details.',
    },
  ],
};

export const policyPresets = {
  gentle: {
    name: 'Gentle Guardian',
    description: 'High human review, cautious automation, maximum creator presence.',
    settings: {
      mode: 'copilot',
      categoryPolicies: {
        ...defaultGuardianPolicy.categoryPolicies,
        [Category.TROLLING]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Review all provocations', uncertainAction: PolicyAction.HUMAN_REVIEW },
        [Category.DISAGREEMENT]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Review all disagreements', uncertainAction: PolicyAction.HUMAN_REVIEW },
        [Category.QUESTION]: { action: PolicyAction.HUMAN_REVIEW, condition: 'Creator approves all answers', uncertainAction: PolicyAction.HUMAN_REVIEW },
      },
    },
  },
  balanced: {
    name: 'Balanced',
    description: 'Recommended defaults: silence for troll bait, drafts for constructive discussion, shields for threats.',
    settings: {
      mode: 'copilot',
      categoryPolicies: defaultGuardianPolicy.categoryPolicies,
    },
  },
  strong_shield: {
    name: 'Strong Shield',
    description: 'Aggressive filtering: auto-silence trolling, automatic shielding of hostility, swift spam removal.',
    settings: {
      mode: 'guardian',
      categoryPolicies: {
        ...defaultGuardianPolicy.categoryPolicies,
        [Category.TROLLING]: { action: PolicyAction.SILENCE, condition: 'Immediate silence on bad-faith bait', uncertainAction: PolicyAction.SILENCE },
        [Category.HARASSMENT]: { action: PolicyAction.HIDE, condition: 'Auto-hide aggressive insults', uncertainAction: PolicyAction.HIDE },
        [Category.SPAM]: { action: PolicyAction.HIDE, condition: 'Immediate removal of promotional spam', uncertainAction: PolicyAction.HIDE },
      },
    },
  },
};

/**
 * Evaluates a comment against the creator's GuardianPolicy using the strict precedence ladder.
 */
export function evaluateCommentPolicy(commentText = '', category = Category.UNKNOWN, options = {}) {
  const policy = options.policy || defaultGuardianPolicy;
  const authorHandle = options.authorHandle || '';
  const isAuthorTrusted = (policy.trustedPeople || []).some(
    (tp) => tp.handle.toLowerCase() === authorHandle.toLowerCase()
  );

  const matchedPolicies = [];
  const normalizedText = commentText.toLowerCase();

  // STEP 1: SAFETY (Precedence Level 1 - Absolute Highest)
  const isThreat = category === Category.THREAT || /kill you|hurt you|find where you live|watch your back/i.test(normalizedText);
  const isSevereHarassment = category === Category.HARASSMENT || /piece of shit|kill yourself|subhuman/i.test(normalizedText);
  const isSelfHarm = category === Category.SENSITIVE || /suicid|self-harm|end my life|hopeless|trauma|depression/i.test(normalizedText);

  if (isThreat) {
    matchedPolicies.push({
      ruleType: 'SAFETY',
      ruleName: 'Threat Zero-Tolerance Policy',
      description: 'Physical safety or doxxing threat detected. Quarantined in Shield Vault and escalated to human review immediately.',
    });
    return {
      finalAction: RecommendedAction.ESCALATE,
      strategy: 'escalate',
      requiresHumanReview: true,
      matchedPolicies,
      precedence: ['SAFETY'],
      explanation: isAuthorTrusted
        ? '⚠️ Safety override: Physical safety threats cannot be bypassed by trusted/VIP status. Escalated immediately.'
        : 'Physical safety threat detected. Quarantined in Shield Vault and escalated to creator review.',
      reasoningSummary: 'Possible physical safety threat detected. Human review recommended.',
      policyDecision: 'threat_escalation_required',
    };
  }

  if (isSelfHarm) {
    matchedPolicies.push({
      ruleType: 'SAFETY',
      ruleName: 'Compassionate Crisis Protocol',
      description: 'Vulnerable crisis or distress language detected. Ghost Guardian never gives clinical advice; surfaces directly for human care.',
    });
    return {
      finalAction: RecommendedAction.HUMAN_REVIEW,
      strategy: 'human_attention',
      requiresHumanReview: true,
      matchedPolicies,
      precedence: ['SAFETY'],
      explanation: 'Vulnerable disclosure detected. Ghost Guardian never automates crisis replies; surfaced for your authentic human attention.',
      reasoningSummary: 'Possible personal distress detected. Human review recommended.',
      policyDecision: 'creator_review_required',
    };
  }

  // STEP 2: EXPLICIT CREATOR TOPIC BOUNDARIES (Precedence Level 2)
  for (const tb of policy.topicBoundaries || []) {
    if (!tb.enabled) continue;
    const topicKey = tb.topic.toLowerCase();
    const hasTopicMatch =
      normalizedText.includes(topicKey) ||
      (topicKey.includes('medical') && /medical|prescription|diagnos|doctor/i.test(normalizedText)) ||
      (topicKey.includes('family') && /family|sister|brother|mother|father|wife|husband|daughter|son/i.test(normalizedText)) ||
      (topicKey.includes('financial') && /stock|invest|crypto return|portfolio/i.test(normalizedText));

    if (hasTopicMatch) {
      matchedPolicies.push({
        ruleType: 'TOPIC_BOUNDARY',
        ruleName: `Protected Topic: ${tb.topic}`,
        description: `Comment asks to discuss a protected boundary topic (${tb.reason}). Surfaced for creator approval.`,
      });
      return {
        finalAction: RecommendedAction.HUMAN_REVIEW,
        strategy: 'human_attention',
        requiresHumanReview: true,
        matchedPolicies,
        precedence: ['TOPIC_BOUNDARY'],
        explanation: `Matches protected creator topic boundary ("${tb.topic}"). Guardian will not draft an answer without your review.`,
        reasoningSummary: `Protected topic boundary ("${tb.topic}") requires creator review.`,
        policyDecision: 'topic_boundary_hold',
      };
    }
  }

  // STEP 3: KEYWORD SHIELDS (Precedence Level 3)
  for (const ks of policy.keywordShields || []) {
    if (!ks.enabled) continue;
    const targetPhrase = ks.caseSensitive ? ks.phrase : ks.phrase.toLowerCase();
    const textToCheck = ks.caseSensitive ? commentText : normalizedText;
    const matches = ks.wholeWord
      ? new RegExp(`\\b${targetPhrase}\\b`, ks.caseSensitive ? '' : 'i').test(textToCheck)
      : textToCheck.includes(targetPhrase);

    if (matches) {
      matchedPolicies.push({
        ruleType: 'KEYWORD_SHIELD',
        ruleName: `Keyword Shield: "${ks.phrase}"`,
        description: `Matched explicit shield phrase (${ks.reason}). Configured action: ${ks.action.toUpperCase()}.`,
      });

      const mapAction = {
        [PolicyAction.SHIELD]: RecommendedAction.HUMAN_REVIEW,
        [PolicyAction.ESCALATE]: RecommendedAction.ESCALATE,
        [PolicyAction.SILENCE]: RecommendedAction.SILENCE,
        [PolicyAction.HIDE]: RecommendedAction.SILENCE,
        [PolicyAction.HUMAN_REVIEW]: RecommendedAction.HUMAN_REVIEW,
      }[ks.action] || RecommendedAction.HUMAN_REVIEW;

      return {
        finalAction: mapAction,
        strategy: ks.action === PolicyAction.SILENCE ? 'silence' : 'protect',
        requiresHumanReview: ks.action !== PolicyAction.SILENCE,
        matchedPolicies,
        precedence: ['KEYWORD_SHIELD'],
        explanation: `Matched your custom keyword shield ("${ks.phrase}") for ${ks.reason}. Executed ${ks.action.toUpperCase()} action.`,
        reasoningSummary: `Keyword shield matched: "${ks.phrase}" (${ks.reason}).`,
        policyDecision: 'keyword_shield_triggered',
      };
    }
  }

  // STEP 4: CATEGORY POLICY (Precedence Level 4)
  const categoryConfig = (policy.categoryPolicies && policy.categoryPolicies[category]) || {
    action: PolicyAction.REPLY,
    condition: 'Default posture',
    uncertainAction: PolicyAction.HUMAN_REVIEW,
  };

  matchedPolicies.push({
    ruleType: 'CATEGORY_POLICY',
    ruleName: `${category} Policy`,
    description: `Category policy configured to: ${categoryConfig.action.toUpperCase()} (${categoryConfig.condition}).`,
  });

  // STEP 5: RELATIONSHIP INFLUENCE (Precedence Level 5)
  if (isAuthorTrusted && categoryConfig.action !== PolicyAction.SHIELD) {
    matchedPolicies.push({
      ruleType: 'RELATIONSHIP',
      ruleName: 'Trusted Contributor VIP Status',
      description: 'Author is on your trusted contributors list. Surfaced prominently for creator awareness.',
    });
  }

  // Resolve Category Action to RecommendedAction
  if (categoryConfig.action === PolicyAction.SILENCE) {
    return {
      finalAction: RecommendedAction.SILENCE,
      strategy: 'silence',
      requiresHumanReview: false,
      matchedPolicies,
      precedence: ['CATEGORY_POLICY'],
      explanation: 'Your policy favors strategic silence for low-value engagement or trolling bait.',
      reasoningSummary: 'Policy recommends silence: low-value or bad-faith engagement.',
      policyDecision: 'silence_recommended',
    };
  }

  if (categoryConfig.action === PolicyAction.SHIELD || categoryConfig.action === PolicyAction.HIDE) {
    return {
      finalAction: RecommendedAction.HUMAN_REVIEW,
      strategy: 'protect',
      requiresHumanReview: true,
      matchedPolicies,
      precedence: ['CATEGORY_POLICY'],
      explanation: `Your policy isolates ${category} comments in the Shield Vault away from your notification stream.`,
      reasoningSummary: `Isolated by ${category} protection policy.`,
      policyDecision: 'shield_vault_quarantine',
    };
  }

  if (categoryConfig.action === PolicyAction.ESCALATE) {
    return {
      finalAction: RecommendedAction.ESCALATE,
      strategy: 'escalate',
      requiresHumanReview: true,
      matchedPolicies,
      precedence: ['CATEGORY_POLICY'],
      explanation: `Your policy requires immediate escalation for ${category} interactions.`,
      reasoningSummary: `Escalated by ${category} policy.`,
      policyDecision: 'creator_escalation_required',
    };
  }

  if (categoryConfig.action === PolicyAction.HUMAN_REVIEW || category === Category.SENSITIVE) {
    return {
      finalAction: RecommendedAction.HUMAN_REVIEW,
      strategy: 'human_attention',
      requiresHumanReview: true,
      matchedPolicies,
      precedence: ['CATEGORY_POLICY'],
      explanation: `Your policy holds ${category} interactions for direct creator review.`,
      reasoningSummary: `Held for creator review by ${category} policy.`,
      policyDecision: 'creator_review_required',
    };
  }

  // Default: Reply / Draft Permitted
  return {
    finalAction: RecommendedAction.DRAFT,
    strategy: category === Category.QUESTION ? 'answer' : category === Category.CONSTRUCTIVE_CRITICISM ? 'discuss' : 'acknowledge',
    requiresHumanReview: policy.mode === 'copilot',
    matchedPolicies,
    precedence: ['CATEGORY_POLICY', 'GUARDIAN_DEFAULT'],
    explanation: `Your policy permits drafting responses for ${category} interactions aligned with your voice.`,
    reasoningSummary: `Draft permitted by ${category} policy (${categoryConfig.condition}).`,
    policyDecision: 'draft_permitted',
  };
}
