/* Voice Engine — Applies creator voice profile to generated text */

const defaultVoice = {
  formality: 50,      // 0=very casual, 100=very formal
  humor: 50,          // 0=serious, 100=very humorous
  warmth: 70,         // 0=clinical, 100=very warm
  directness: 60,     // 0=diplomatic, 100=blunt
  depth: 60,          // 0=brief, 100=philosophical
  sarcasm: 20,        // 0=none, 100=heavy sarcasm
  useEmojis: false,
  useSlang: false,
  askQuestions: true,
  preferShort: false,
  commonPhrases: [],
  forbiddenPhrases: ['Thanks for sharing!', 'Great point!', 'I completely understand!', 'We appreciate your perspective!'],
  swearing: false,
};

function applyVoice(text, voice = defaultVoice) {
  let result = text;

  // Remove forbidden phrases
  if (voice.forbiddenPhrases?.length) {
    for (const phrase of voice.forbiddenPhrases) {
      if (result.includes(phrase)) {
        result = result.replace(phrase, '');
      }
    }
  }

  // Adjust formality
  if (voice.formality < 30) {
    result = result.replace(/\bdo not\b/gi, "don't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bIt is\b/g, "It's")
      .replace(/\bthat is\b/gi, "that's");
  }

  // Add emoji if enabled
  if (voice.useEmojis && !result.match(/[\u{1F300}-\u{1FAFF}]/u)) {
    const emojis = ['🙏', '💯', '🔥', '✨', '💪', '❤️', '👊'];
    result = result + ' ' + emojis[Math.floor(Math.random() * emojis.length)];
  }

  return result.trim();
}

function getVoiceDescription(voice) {
  const traits = [];
  if (voice.formality < 30) traits.push('casual');
  else if (voice.formality > 70) traits.push('formal');
  if (voice.humor > 60) traits.push('humorous');
  if (voice.warmth > 70) traits.push('warm');
  if (voice.directness > 70) traits.push('direct');
  if (voice.depth > 70) traits.push('philosophical');
  if (voice.sarcasm > 40) traits.push('witty');
  if (voice.useEmojis) traits.push('uses emojis');
  if (voice.swearing) traits.push('unfiltered');
  return traits.join(', ') || 'balanced';
}

export { applyVoice, getVoiceDescription, defaultVoice };
