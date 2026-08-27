/* Quality Control — Validates generated responses before display */

import { checkSimilarity } from './similarity';

const QUALITY_FLAGS = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
};

function qualityCheck(response, context = {}) {
  const checks = [];
  const text = response?.text;

  if (!text) {
    return { overall: QUALITY_FLAGS.PASS, checks: [{ name: 'silence', status: QUALITY_FLAGS.PASS, note: 'Silence strategy — no response needed' }] };
  }

  // 1. Length check
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 2) {
    checks.push({ name: 'length', status: QUALITY_FLAGS.WARN, note: 'Response may be too short' });
  } else if (wordCount > 200) {
    checks.push({ name: 'length', status: QUALITY_FLAGS.WARN, note: 'Response may be too long' });
  } else {
    checks.push({ name: 'length', status: QUALITY_FLAGS.PASS, note: `${wordCount} words` });
  }

  // 2. Generic phrase check
  const genericPhrases = [
    'thanks for sharing', 'great point', 'i completely understand',
    'we appreciate your perspective', 'thanks for your comment',
    'thanks for watching', 'glad you enjoyed'
  ];
  const hasGeneric = genericPhrases.some(p => text.toLowerCase().includes(p));
  if (hasGeneric) {
    checks.push({ name: 'originality', status: QUALITY_FLAGS.WARN, note: 'Contains generic phrase — consider personalizing' });
  } else {
    checks.push({ name: 'originality', status: QUALITY_FLAGS.PASS, note: 'No generic phrases detected' });
  }

  // 3. Repetition check
  if (context.recentResponses?.length > 0) {
    const similarity = checkSimilarity(text, context.recentResponses, 0.55);
    if (similarity.isDuplicate) {
      const count = similarity.matches.length;
      checks.push({
        name: 'repetition',
        status: QUALITY_FLAGS.WARN,
        note: `Similar to ${count} recent response${count > 1 ? 's' : ''} (${Math.round(similarity.highestScore * 100)}% match)`,
      });
    } else {
      checks.push({ name: 'repetition', status: QUALITY_FLAGS.PASS, note: 'Sufficiently unique' });
    }
  }

  // 4. Safety check
  const unsafePatterns = ['you deserve', 'you should hurt', 'nobody likes you', 'everyone hates'];
  const hasUnsafe = unsafePatterns.some(p => text.toLowerCase().includes(p));
  if (hasUnsafe) {
    checks.push({ name: 'safety', status: QUALITY_FLAGS.FAIL, note: 'Response contains potentially harmful language' });
  } else {
    checks.push({ name: 'safety', status: QUALITY_FLAGS.PASS, note: 'No safety concerns' });
  }

  // 5. Provocation check
  const provocativePatterns = ['you\'re an idiot', 'are you stupid', 'learn to read', 'imagine being this dumb'];
  const isProvocative = provocativePatterns.some(p => text.toLowerCase().includes(p));
  if (isProvocative) {
    checks.push({ name: 'provocation', status: QUALITY_FLAGS.FAIL, note: 'Response is unnecessarily provocative' });
  } else {
    checks.push({ name: 'provocation', status: QUALITY_FLAGS.PASS, note: 'Tone is appropriate' });
  }

  // 6. Voice consistency (basic)
  if (context.creatorVoice) {
    const voice = context.creatorVoice;
    if (voice.formality > 70 && text.match(/\b(lol|lmao|bruh|dude|yo)\b/i)) {
      checks.push({ name: 'voice', status: QUALITY_FLAGS.WARN, note: 'Casual language in a formal voice profile' });
    } else if (voice.useEmojis === false && text.match(/[\u{1F300}-\u{1FAFF}]/u)) {
      checks.push({ name: 'voice', status: QUALITY_FLAGS.WARN, note: 'Emojis used but creator prefers none' });
    } else {
      checks.push({ name: 'voice', status: QUALITY_FLAGS.PASS, note: 'Consistent with creator voice' });
    }
  }

  // Overall determination
  const hasFail = checks.some(c => c.status === QUALITY_FLAGS.FAIL);
  const warnCount = checks.filter(c => c.status === QUALITY_FLAGS.WARN).length;

  return {
    overall: hasFail ? QUALITY_FLAGS.FAIL : warnCount >= 2 ? QUALITY_FLAGS.WARN : QUALITY_FLAGS.PASS,
    checks,
    shouldRegenerate: hasFail,
  };
}

export { qualityCheck, QUALITY_FLAGS };
