/* Main AI Pipeline — Orchestrates the full intelligence flow */

import { classify } from './classifier';
import { determineStrategy } from './strategy';
import { generate, generateVariations } from './generator';
import { applyVoice } from './voice';
import { qualityCheck } from './quality';
import { checkSimilarity } from './similarity';
import storage from '../storage';

const MAX_REGENERATE_ATTEMPTS = 3;

function processComment(comment, options = {}) {
  const {
    creatorVoice = null,
    videoContext = null,
    guardianWit = false,
    recentResponses = [],
  } = options;

  // Step 1: Classify
  const classification = classify(comment, { videoContext });

  // Step 2: Determine strategy
  const strategyResult = determineStrategy(classification, {
    guardianWit,
    creatorPrefs: creatorVoice,
  });

  // Step 3: Generate response
  let response = generate(comment, classification, strategyResult, creatorVoice, videoContext);
  let attempts = 1;

  // Step 4: Apply voice
  if (response.text && creatorVoice) {
    response.text = applyVoice(response.text, creatorVoice);
  }

  // Step 5: Quality check + regenerate if needed
  let quality = { overall: 'pass', checks: [] };
  if (response.text) {
    quality = qualityCheck(response, {
      recentResponses,
      creatorVoice,
    });

    while (quality.shouldRegenerate && attempts < MAX_REGENERATE_ATTEMPTS) {
      response = generate(comment, classification, strategyResult, creatorVoice, videoContext);
      if (response.text && creatorVoice) {
        response.text = applyVoice(response.text, creatorVoice);
      }
      quality = qualityCheck(response, { recentResponses, creatorVoice });
      attempts++;
    }
  }

  // Step 6: Check for duplicates
  let duplicateWarning = null;
  if (response.text) {
    const similarity = checkSimilarity(response.text, recentResponses);
    if (similarity.isDuplicate) {
      duplicateWarning = `Similar response used ${similarity.matches.length} time${similarity.matches.length > 1 ? 's' : ''} recently (${Math.round(similarity.highestScore * 100)}% match)`;
    }
  }

  return {
    comment,
    classification,
    strategy: strategyResult,
    response,
    quality,
    duplicateWarning,
    processedAt: new Date().toISOString(),
    attempts,
  };
}

function processCommentBatch(comments, options = {}) {
  const results = [];
  const recentResponses = [...(options.recentResponses || [])];

  for (const comment of comments) {
    const result = processComment(comment, { ...options, recentResponses });
    results.push(result);
    if (result.response?.text) {
      recentResponses.push(result.response.text);
    }
  }
  return results;
}

function testVoice(commentText, classification = null) {
  const comment = { text: commentText, author: 'Test User' };
  const cls = classification || classify(comment);
  return generateVariations(comment, cls);
}

export { processComment, processCommentBatch, testVoice };
