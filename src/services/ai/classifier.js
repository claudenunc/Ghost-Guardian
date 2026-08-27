/* Comment Classifier — Determines category, sentiment, intent, risk, and confidence */

const CATEGORIES = {
  PRAISE: 'PRAISE',
  QUESTION: 'QUESTION',
  CONSTRUCTIVE_CRITICISM: 'CONSTRUCTIVE_CRITICISM',
  DISAGREEMENT: 'DISAGREEMENT',
  GENERAL_COMMENT: 'GENERAL_COMMENT',
  HUMOR: 'HUMOR',
  TROLLING: 'TROLLING',
  HARASSMENT: 'HARASSMENT',
  HATE: 'HATE',
  SPAM: 'SPAM',
  SCAM: 'SCAM',
  THREAT: 'THREAT',
  SENSITIVE: 'SENSITIVE',
  UNKNOWN: 'UNKNOWN',
};

const SENTIMENTS = { POSITIVE: 'positive', NEUTRAL: 'neutral', NEGATIVE: 'negative', MIXED: 'mixed' };
const RISK_LEVELS = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' };

// Pattern-based classification with weighted scoring
const patterns = {
  [CATEGORIES.THREAT]: {
    keywords: ['find where you live', 'find you', 'come for you', 'kill you', 'hurt you', 'watch your back', 'know where', 'end you', 'better watch', 'coming for'],
    weight: 10,
    risk: RISK_LEVELS.CRITICAL,
  },
  [CATEGORIES.HARASSMENT]: {
    keywords: ['piece of shit', 'piece of crap', 'go to hell', 'kys', 'kill yourself', 'fuck you', 'fk you', 'stfu', 'shut the fuck', 'worthless', 'pathetic loser', 'subhuman', 'retard'],
    weight: 8,
    risk: RISK_LEVELS.HIGH,
  },
  [CATEGORIES.HATE]: {
    keywords: ['racial slur placeholder', 'homophobic slur placeholder'],
    weight: 9,
    risk: RISK_LEVELS.HIGH,
  },
  [CATEGORIES.SPAM]: {
    keywords: ['click my', 'free money', 'subscribe to my', 'check out my channel', 'giveaway', 'www.', 'http:', 'earn money', 'make money fast', '!!!'],
    weight: 6,
    risk: RISK_LEVELS.LOW,
  },
  [CATEGORIES.SCAM]: {
    keywords: ['invest now', 'crypto opportunity', 'dm me for', 'whatsapp me', 'telegram me', 'guaranteed returns', 'double your'],
    weight: 7,
    risk: RISK_LEVELS.MEDIUM,
  },
  [CATEGORIES.TROLLING]: {
    keywords: ['dumbest thing', 'dumbest shit', 'worst video', 'trash content', 'garbage', 'clown', 'cope', 'ratio', 'nobody cares', 'cringe', 'L take'],
    weight: 5,
    risk: RISK_LEVELS.LOW,
  },
};

const praiseSignals = ['love', 'amazing', 'incredible', 'beautiful', 'brilliant', 'awesome', 'great', 'fantastic', 'thank you', 'thanks', 'appreciate', 'best', 'perfect', 'masterpiece', 'genius', 'hell yeah', 'fire', '🔥', '❤️', '👏', '💯', 'changed my', 'inspired', 'hit differently', 'resonated', 'followed', 'subscribed', 'fan'];
const questionSignals = ['?', 'what do you think', 'can you explain', 'how do', 'why do', 'what is', 'could you', 'would you', 'have you', 'do you know', 'what about', 'what if', 'curious about', 'wondering'];
const criticismSignals = ['but I think', 'oversimplified', 'however', 'disagree', 'not sure I agree', 'missed the point', 'could have', 'should have', 'fell short', 'disappointed', 'expected more', 'usually love but', 'usually great but'];
const disagreementSignals = ['completely disagree', 'wrong about', 'incorrect', 'not true', 'misleading', 'that\'s false', 'you\'re wrong', 'actually,', 'well actually', 'I disagree'];
const humorSignals = ['lol', 'lmao', 'haha', '😂', '🤣', 'hilarious', 'dead', 'I\'m dying', 'bald', 'rofl', 'comedy gold', 'joke'];
const sensitiveSignals = ['pain', 'depression', 'suicidal', 'self-harm', 'abuse', 'trauma', 'lost someone', 'dying', 'cancer', 'mental health', 'struggling', 'child inside', 'years of pain', 'give up', 'hopeless'];

function classify(comment, context = {}) {
  const text = (comment.text || '').toLowerCase();
  const scores = {};

  // Check serious patterns first
  for (const [cat, pattern] of Object.entries(patterns)) {
    const matchCount = pattern.keywords.filter(kw => text.includes(kw)).length;
    if (matchCount > 0) {
      scores[cat] = matchCount * pattern.weight;
    }
  }

  // Check positive signals
  const praiseCount = praiseSignals.filter(s => text.includes(s)).length;
  if (praiseCount > 0) scores[CATEGORIES.PRAISE] = praiseCount * 3;

  // Check questions
  const questionCount = questionSignals.filter(s => text.includes(s)).length;
  if (questionCount > 0) scores[CATEGORIES.QUESTION] = questionCount * 4;

  // Check criticism
  const criticismCount = criticismSignals.filter(s => text.includes(s)).length;
  if (criticismCount > 0) scores[CATEGORIES.CONSTRUCTIVE_CRITICISM] = criticismCount * 3;

  // Check disagreement
  const disagreementCount = disagreementSignals.filter(s => text.includes(s)).length;
  if (disagreementCount > 0) scores[CATEGORIES.DISAGREEMENT] = disagreementCount * 3.5;

  // Check humor
  const humorCount = humorSignals.filter(s => text.includes(s)).length;
  if (humorCount > 0) scores[CATEGORIES.HUMOR] = humorCount * 2.5;

  // Check sensitive
  const sensitiveCount = sensitiveSignals.filter(s => text.includes(s)).length;
  if (sensitiveCount > 0) scores[CATEGORIES.SENSITIVE] = sensitiveCount * 6;

  // Determine top category
  let category = CATEGORIES.GENERAL_COMMENT;
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  }

  // Determine sentiment
  let sentiment = SENTIMENTS.NEUTRAL;
  const positiveScore = (scores[CATEGORIES.PRAISE] || 0) + (scores[CATEGORIES.HUMOR] || 0) * 0.5;
  const negativeScore = (scores[CATEGORIES.TROLLING] || 0) + (scores[CATEGORIES.HARASSMENT] || 0) + (scores[CATEGORIES.HATE] || 0) + (scores[CATEGORIES.DISAGREEMENT] || 0) * 0.3;
  if (positiveScore > 3 && negativeScore > 3) sentiment = SENTIMENTS.MIXED;
  else if (positiveScore > negativeScore + 1) sentiment = SENTIMENTS.POSITIVE;
  else if (negativeScore > positiveScore + 1) sentiment = SENTIMENTS.NEGATIVE;

  // Determine risk
  let risk = RISK_LEVELS.LOW;
  if (category === CATEGORIES.THREAT) risk = RISK_LEVELS.CRITICAL;
  else if ([CATEGORIES.HARASSMENT, CATEGORIES.HATE].includes(category)) risk = RISK_LEVELS.HIGH;
  else if ([CATEGORIES.SCAM, CATEGORIES.SENSITIVE].includes(category)) risk = RISK_LEVELS.MEDIUM;
  else if (category === CATEGORIES.TROLLING) risk = RISK_LEVELS.LOW;

  // Confidence
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  let confidence = totalScore > 0 ? Math.min(0.95, 0.4 + (maxScore / totalScore) * 0.5 + Math.min(maxScore, 20) / 40) : 0.3;

  // Determine intent
  let intent = determineIntent(category, text);

  return {
    category,
    sentiment,
    risk,
    confidence: Math.round(confidence * 100) / 100,
    intent,
    scores,
  };
}

function determineIntent(category, text) {
  const intents = {
    [CATEGORIES.PRAISE]: 'Express appreciation or support',
    [CATEGORIES.QUESTION]: 'Seek information or clarification',
    [CATEGORIES.CONSTRUCTIVE_CRITICISM]: 'Offer feedback for improvement',
    [CATEGORIES.DISAGREEMENT]: 'Challenge or contest a position',
    [CATEGORIES.GENERAL_COMMENT]: 'Share a thought or observation',
    [CATEGORIES.HUMOR]: 'Make a humorous observation or joke',
    [CATEGORIES.TROLLING]: 'Provoke a reaction',
    [CATEGORIES.HARASSMENT]: 'Direct personal attack',
    [CATEGORIES.HATE]: 'Express targeted hatred',
    [CATEGORIES.SPAM]: 'Self-promote or distribute unsolicited content',
    [CATEGORIES.SCAM]: 'Deceive for financial gain',
    [CATEGORIES.THREAT]: 'Intimidate or threaten safety',
    [CATEGORIES.SENSITIVE]: 'Share vulnerable personal experience',
    [CATEGORIES.UNKNOWN]: 'Unclear intent',
  };
  return intents[category] || intents[CATEGORIES.UNKNOWN];
}

export { classify, CATEGORIES, SENTIMENTS, RISK_LEVELS };
