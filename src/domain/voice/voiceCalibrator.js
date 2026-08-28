/**
 * Ghost Guardian Voice Calibration Engine
 * Deterministically generates and calibrates responses based on creator voice parameters:
 * - Warmth (0-100)
 * - Directness (0-100)
 * - Formality (0-100)
 * - Humor (0-100)
 * - Response Length ('concise' | 'adaptive' | 'detailed')
 * - Emoji Usage ('never' | 'minimal' | 'expressive' or boolean)
 * - Questions / Conversationality (boolean)
 * - Swearing / Colloquial bluntness (boolean)
 */

export const TonePreset = Object.freeze({
  CALM: 'calm',
  DIRECT: 'direct',
  WARM: 'warm',
  HUMOROUS: 'humorous',
});

export function calibrateDraft({
  commentText = '',
  voice = {},
  activeTone = 'warm',
  scenario = 'general',
}) {
  const warmth = Number(voice.warmth ?? 75);
  const directness = Number(voice.directness ?? 75);
  const formality = Number(voice.formality ?? 35);
  const humor = Number(voice.humor ?? 45);
  const lengthPref = voice.responseLength || (voice.preferShort ? 'concise' : 'adaptive');
  const usesEmojis = Boolean(voice.usesEmojis);
  const swears = Boolean(voice.swears);
  const asksQuestions = Boolean(voice.asksQuestions ?? true);

  const isQuestion = commentText.includes('?') || scenario === 'question';
  const isCriticism = scenario === 'criticism' || /oversimplified|disagree|wrong|objection/i.test(commentText);
  const isPraise = scenario === 'praise' || /love|hit differently|amazing|thank you/i.test(commentText);

  let opening = '';
  let core = '';
  let followUp = '';

  // 1. OPENING based on Warmth & Tone & Formality
  if (activeTone === 'calm') {
    if (formality > 60) {
      opening = isCriticism
        ? 'That is a substantive observation.'
        : isQuestion
        ? 'Regarding this specific distinction:'
        : 'Thank you for this thoughtful perspective.';
    } else if (warmth > 70) {
      opening = isCriticism
        ? "That's a fair point to raise."
        : isQuestion
        ? 'Good question to unpack.'
        : 'Appreciate you tuning in and sharing this.';
    } else {
      opening = isCriticism
        ? 'Fair critique.'
        : isQuestion
        ? 'Short answer on that:'
        : 'Noted.';
    }
  } else if (activeTone === 'direct') {
    if (directness > 75) {
      opening = isCriticism
        ? 'You are right that it was compressed.'
        : isQuestion
        ? 'Direct answer:'
        : 'Appreciated.';
    } else {
      opening = isCriticism
        ? 'Here is the thinking behind that choice:'
        : isQuestion
        ? 'To answer that directly:'
        : 'Glad this resonated.';
    }
  } else if (activeTone === 'humorous') {
    if (humor > 60) {
      opening = isCriticism
        ? 'Guilty as charged on the compressed runtime.'
        : isQuestion
        ? 'Great question, mildly dangerous topic.'
        : 'Two years of this? You deserve a commemorative medal.';
    } else {
      opening = isCriticism
        ? 'Fair shot.'
        : isQuestion
        ? 'The fun rabbit hole:'
        : 'Ha, glad this landed.';
    }
  } else {
    // Default: Warm
    if (warmth > 80) {
      opening = isCriticism
        ? "That is genuinely fair criticism, and I'm glad you brought it up."
        : isQuestion
        ? 'Really glad you asked about this.'
        : 'Two years is a meaningful time to stay with a show — that genuinely means a lot.';
    } else if (warmth < 40) {
      opening = isCriticism
        ? 'Critique received.'
        : isQuestion
        ? 'On the question of consciousness:'
        : 'Thanks for listening.';
    } else {
      opening = isCriticism
        ? "That's a fair objection to make."
        : isQuestion
        ? 'Good catch on that section.'
        : 'Glad this part landed with you.';
    }
  }

  // 2. CORE SUBSTANCE based on Directness, Depth & Formality
  if (isCriticism) {
    if (directness > 80) {
      core = 'The panpsychism section was shortened intentionally for runtime, but that leaves the combination problem open.';
    } else if (formality > 70) {
      core = 'The exposition of panpsychism was condensed for structural coherence, which necessarily omitted secondary objections.';
    } else {
      core = "We made a deliberate cut to keep the episode moving, but it definitely skipped the serious counter-arguments.";
    }
  } else if (isQuestion) {
    if (directness > 80) {
      core = 'Physics describes the behavior of experience rather than replacing it. It is a question of where explanation bottoms out.';
    } else if (formality > 70) {
      core = 'The argument posits that physical equations model structural dynamics rather than ontological foundations.';
    } else {
      core = "The claim around 42:00 is that physics describes how experience behaves rather than replacing it — differently scoped, not incomplete.";
    }
  } else {
    // Praise / Reflection
    if (directness > 80) {
      core = "The bit about explanation bottoming out is the exact crux we debated in the studio.";
    } else if (formality > 70) {
      core = 'The assertion regarding fundamental explanation remains the conceptual linchpin of this arc.';
    } else {
      core = "That line about where explanation bottoms out was almost cut, so hearing that it shifted something for you is great to know.";
    }
  }

  // 3. FOLLOW-UP based on Questions & Length
  if (lengthPref === 'concise') {
    followUp = '';
  } else if (lengthPref === 'detailed') {
    if (asksQuestions) {
      followUp = isCriticism
        ? 'Which specific objection would you have liked us to lead with? A dedicated follow-up episode is in planning.'
        : isQuestion
        ? 'Does that framing address what you were stuck on, or would you take the scope further?'
        : 'What part of the bottoming-out argument felt like the real unsticking point for you?';
    } else {
      followUp = 'A dedicated follow-up episode is currently being planned to dive deeper into this.';
    }
  } else {
    // Adaptive
    if (asksQuestions) {
      followUp = isCriticism
        ? 'Which objection do you think most needed to be in there?'
        : isQuestion
        ? 'Does that clarify the scope?'
        : 'What part hit you hardest?';
    } else {
      followUp = 'More to come on this in the follow-up.';
    }
  }

  // 4. Assemble Draft
  let draft = `${opening} ${core}`;
  if (followUp) {
    draft = `${draft} ${followUp}`;
  }

  // 5. Emojis
  if (usesEmojis) {
    const emojiMap = {
      calm: ' ☕',
      direct: ' 🎯',
      warm: ' ✨',
      humorous: ' 😂',
    };
    draft = `${draft}${emojiMap[activeTone] || ' ✨'}`;
  }

  // 6. Vocabulary Insertion if relevant
  if (voice.commonPhrases && voice.commonPhrases.includes('crux') && !draft.includes('crux') && lengthPref !== 'concise') {
    draft = draft.replace('is the exact', 'is the crux of what');
  }

  return draft.trim();
}

export function deriveLearnedTraits(voice = {}, learningCount = 0) {
  const traits = [];

  // Formality
  if (voice.formality < 40) {
    traits.push({ title: 'Grounded & conversational', detail: 'Prefers plain natural speech over academic jargon' });
  } else if (voice.formality > 70) {
    traits.push({ title: 'Structured & rigorous', detail: 'Uses precise academic terminology and formal syntax' });
  } else {
    traits.push({ title: 'Balanced register', detail: 'Blends technical rigor with approachable phrasing' });
  }

  // Warmth
  if (voice.warmth > 70) {
    traits.push({ title: 'High emotional warmth', detail: 'Consistently acknowledges community contributions and personal notes' });
  } else if (voice.warmth < 40) {
    traits.push({ title: 'Clinical & reserved', detail: 'Keeps emotional framing neutral and matter-of-fact' });
  }

  // Directness
  if (voice.directness > 70) {
    traits.push({ title: 'Blunt & punchy', detail: 'Eliminates hedging phrases and leads directly with core answers' });
  }

  // Questions
  if (voice.asksQuestions) {
    traits.push({ title: 'Dialog-oriented', detail: 'Closes responses with focused questions to stimulate community depth' });
  }

  // Forbidden / Boundaries
  if (voice.forbiddenPhrases) {
    traits.push({ title: 'Anti-cliché filter active', detail: 'Actively suppresses generic corporate boilerplate' });
  }

  // Emojis
  if (!voice.usesEmojis) {
    traits.push({ title: 'Emoji restraint', detail: 'Maintains editorial text clarity without decorative emojis' });
  }

  // Learning history
  if (learningCount > 0) {
    traits.push({
      title: `${learningCount} custom voice examples integrated`,
      detail: 'Model calibrates towards your past approved phrasing and nuances',
    });
  }

  return traits;
}

export function getVoiceCalibrationStatus(learningCount = 0, knowledgeCount = 0) {
  if (learningCount >= 3 && knowledgeCount >= 3) return 'Well calibrated';
  if (learningCount >= 1 || knowledgeCount >= 2) return 'Established';
  return 'Calibrating';
}
