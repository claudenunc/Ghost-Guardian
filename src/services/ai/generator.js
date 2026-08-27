/* Response Generator — Creates contextual, varied responses based on strategy and voice */

import { STRATEGIES } from './strategy';
import { CATEGORIES } from './classifier';

// Template pools for each strategy — ensures variety
const templates = {
  [STRATEGIES.ACKNOWLEDGE]: [
    (ctx) => `${ctx.warm ? 'Hell yeah. ' : ''}Thank you for being here.`,
    (ctx) => `Appreciate that${ctx.casual ? ', seriously' : ''}.`,
    (ctx) => `That means a lot${ctx.name ? `, ${ctx.name}` : ''}.`,
    (ctx) => `Glad this landed with you.`,
    (ctx) => `${ctx.casual ? 'Love hearing that.' : 'Thank you for saying that.'}`,
    (ctx) => `This is the kind of thing that keeps us going.`,
  ],

  [STRATEGIES.APPRECIATE]: [
    (ctx) => `${ctx.duration ? ctx.duration + '! That\'s incredible. ' : ''}Thank you for being part of this. Hearing that this ${ctx.impact || 'resonated with you'} genuinely means something.`,
    (ctx) => `This kind of message is exactly why we do this. ${ctx.specific ? `The fact that ${ctx.specific} hit you — ` : ''}that tells us we're on the right track.`,
    (ctx) => `We don't take this for granted. ${ctx.name ? ctx.name + ', y' : 'Y'}our support has been the foundation of everything we've built here.`,
    (ctx) => `${ctx.casual ? 'Yo, ' : ''}this is the kind of comment that makes the hard days worth it. Thank you.`,
  ],

  [STRATEGIES.ANSWER]: [
    (ctx) => ctx.answer ? `${ctx.answer}` : `That's a great question. ${ctx.partial || "I'd want to verify that before giving you an incomplete answer. Let me flag this for a proper response."}`,
    (ctx) => ctx.answer ? `Good question. ${ctx.answer}` : `I don't have enough information to answer that accurately. ${ctx.redirect || "I'll flag this so it gets a proper response."}`,
    (ctx) => ctx.answer ? `${ctx.casual ? 'So basically, ' : ''}${ctx.answer}` : `Honestly, I'd rather not guess on this one. Let me make sure the right person sees your question.`,
  ],

  [STRATEGIES.EXPLORE]: [
    (ctx) => `This is a really thoughtful observation. ${ctx.engagement || 'The question you\'re raising is one that doesn\'t have a simple answer, and that\'s exactly what makes it worth exploring.'}`,
    (ctx) => `${ctx.name ? ctx.name + ', y' : 'Y'}ou're touching on something that goes deeper than most people realize. ${ctx.exploration || 'There\'s a real tension between the surface-level explanation and what\'s actually happening underneath.'}`,
    (ctx) => `I love this question because it doesn't let me get away with a simple answer. ${ctx.exploration || 'The honest response is that this is genuinely complicated, and the people who pretend it isn\'t are usually selling something.'}`,
    (ctx) => `${ctx.acknowledgment || 'You may be right about that.'} ${ctx.exploration || 'What\'s interesting is that this forces us to question assumptions we usually take for granted.'}`,
  ],

  [STRATEGIES.CLARIFY]: [
    (ctx) => `I can see how that came across that way, but ${ctx.clarification || 'the intention was actually something different'}. ${ctx.reframe || 'Let me try to explain it better.'}`,
    (ctx) => `Fair interpretation, but ${ctx.clarification || 'there\'s a nuance here that might not have come through clearly'}. ${ctx.casual ? 'My bad for not being clearer.' : 'I appreciate you raising this.'}`,
  ],

  [STRATEGIES.DISCUSS]: [
    (ctx) => `${ctx.casual ? 'That\'s fair. ' : 'That\'s a fair point. '}${ctx.acknowledgment || 'I can see where you\'re coming from.'} ${ctx.discussion || 'What part do you think got oversimplified?'}`,
    (ctx) => `I appreciate the pushback. ${ctx.acknowledgment || 'You\'re not wrong that there\'s more to this.'} ${ctx.question || 'What would you have approached differently?'}`,
    (ctx) => `${ctx.name ? ctx.name + ', t' : 'T'}his is the kind of disagreement that actually makes the conversation better. ${ctx.discussion || 'Tell us more about where you think this breaks down.'}`,
    (ctx) => `Respectfully, ${ctx.counter || 'I think there\'s room for both perspectives here'}. ${ctx.question || 'What evidence would change your mind?'}`,
  ],

  [STRATEGIES.DE_ESCALATE]: [
    (ctx) => `You might genuinely disagree, and that's completely fair. ${ctx.redirect || 'If there\'s a specific point you think is wrong, tell us what it is. That\'s a much more interesting conversation than trading insults.'}`,
    (ctx) => `We can work with disagreement. ${ctx.wit ? 'The insults aren\'t doing much heavy lifting, though.' : 'But we need something to actually work with.'}`,
    (ctx) => `${ctx.casual ? 'Look, ' : ''}you may be right that it's not for you. ${ctx.redirect || 'But if you can turn the frustration into an actual argument, we\'re listening.'}`,
    (ctx) => `I hear the frustration. ${ctx.redirect || 'If there\'s a real criticism underneath it, I\'d genuinely like to hear it.'}`,
  ],

  [STRATEGIES.BOUNDARY]: [
    (ctx) => `There are ways to disagree that we take seriously, and ways that we don't. ${ctx.boundary || 'This falls into the second category.'} ${ctx.redirect || 'If you have an actual point, we\'re still here for it.'}`,
    (ctx) => `Everyone's welcome to disagree. ${ctx.boundary || 'Personal attacks just don\'t land the way people think they will.'} ${ctx.casual ? 'We\'re still here if you want an actual conversation.' : 'The door is open for genuine dialogue.'}`,
  ],

  [STRATEGIES.HUMOR]: [
    (ctx) => ctx.joke || `${ctx.setup || 'Ha!'} ${ctx.punchline || 'Fair enough.'}`,
    (ctx) => ctx.joke || `${ctx.casual ? 'Lmao ' : ''}${ctx.response || 'I can\'t even argue with that one.'}`,
  ],

  [STRATEGIES.SILENCE]: [
    () => null, // No response generated
  ],

  [STRATEGIES.ESCALATE]: [
    (ctx) => `⚠️ This comment has been flagged for human review. ${ctx.reason || 'The situation requires personal attention from the creator.'}`,
  ],
};

// Context extractors for specific comment patterns
function extractContext(comment, classification, creatorVoice, videoContext) {
  const text = comment.text || '';
  const ctx = {
    casual: creatorVoice?.formality < 40,
    warm: creatorVoice?.warmth > 60,
    wit: creatorVoice?.sarcasm > 30 || creatorVoice?.humor > 60,
    name: comment.author?.split(' ')[0] || null,
  };

  // Extract duration mentions
  const durationMatch = text.match(/(\d+)\s*(year|month|week|day|episode)/i);
  if (durationMatch) {
    ctx.duration = `${durationMatch[1]} ${durationMatch[2]}${parseInt(durationMatch[1]) > 1 ? 's' : ''}`;
  }

  // Extract specific impact mentions
  const impactPhrases = ['changed how I think', 'hit differently', 'resonated', 'opened my eyes', 'made me realize', 'inspired me'];
  for (const phrase of impactPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      ctx.impact = phrase;
      break;
    }
  }

  // For questions — try to find answer in video context
  if (classification.category === CATEGORIES.QUESTION && videoContext) {
    const timeMatch = text.match(/(\d+)[:-]?(\d+)?\s*(minute|min|mark|timestamp)/i);
    if (timeMatch) {
      ctx.answer = `Around that mark, ${videoContext.title ? 'in "' + videoContext.title + '", ' : ''}the discussion was about ${videoContext.topics?.[0] || 'the core thesis'}. ${videoContext.description || ''}`.trim();
    }
  }

  return ctx;
}

function generate(comment, classification, strategyResult, creatorVoice = {}, videoContext = null) {
  const { strategy } = strategyResult;

  if (strategy === STRATEGIES.SILENCE) {
    return { text: null, strategy, shouldDisplay: false };
  }

  const pool = templates[strategy] || templates[STRATEGIES.ACKNOWLEDGE];
  const ctx = extractContext(comment, classification, creatorVoice, videoContext);

  // Pick a random template from the pool
  const template = pool[Math.floor(Math.random() * pool.length)];
  const text = template(ctx);

  return {
    text,
    strategy,
    shouldDisplay: text !== null,
  };
}

// Generate multiple response styles for "Test My Voice"
function generateVariations(comment, classification) {
  const styles = {
    calm: { formality: 60, humor: 20, warmth: 80, directness: 40, sarcasm: 0 },
    direct: { formality: 40, humor: 10, warmth: 40, directness: 90, sarcasm: 0 },
    warm: { formality: 30, humor: 30, warmth: 95, directness: 30, sarcasm: 0 },
    humorous: { formality: 20, humor: 90, warmth: 60, directness: 50, sarcasm: 40 },
  };

  const results = {};
  for (const [styleName, voice] of Object.entries(styles)) {
    const strategyResult = { strategy: getDefaultStrategy(classification) };
    results[styleName] = generate(comment, classification, strategyResult, voice);
  }
  return results;
}

function getDefaultStrategy(classification) {
  const map = {
    [CATEGORIES.PRAISE]: STRATEGIES.APPRECIATE,
    [CATEGORIES.QUESTION]: STRATEGIES.ANSWER,
    [CATEGORIES.CONSTRUCTIVE_CRITICISM]: STRATEGIES.DISCUSS,
    [CATEGORIES.DISAGREEMENT]: STRATEGIES.DISCUSS,
    [CATEGORIES.HUMOR]: STRATEGIES.HUMOR,
    [CATEGORIES.TROLLING]: STRATEGIES.DE_ESCALATE,
    [CATEGORIES.HARASSMENT]: STRATEGIES.BOUNDARY,
    [CATEGORIES.THREAT]: STRATEGIES.ESCALATE,
    [CATEGORIES.SENSITIVE]: STRATEGIES.EXPLORE,
  };
  return map[classification.category] || STRATEGIES.ACKNOWLEDGE;
}

export { generate, generateVariations };
