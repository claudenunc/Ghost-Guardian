/* Similarity Engine — Duplicate response detection */

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function ngramSimilarity(a, b, n = 3) {
  const getNgrams = (text) => {
    const tokens = tokenize(text);
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return new Set(ngrams);
  };
  const setA = getNgrams(a);
  const setB = getNgrams(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function checkSimilarity(newResponse, recentResponses, threshold = 0.6) {
  const results = [];
  for (const recent of recentResponses) {
    const jaccard = jaccardSimilarity(newResponse, recent);
    const ngram = ngramSimilarity(newResponse, recent, 3);
    const score = (jaccard * 0.4 + ngram * 0.6);
    if (score > threshold) {
      results.push({ text: recent, score: Math.round(score * 100) / 100 });
    }
  }
  return {
    isDuplicate: results.length > 0,
    matches: results.sort((a, b) => b.score - a.score),
    highestScore: results.length > 0 ? results[0].score : 0,
  };
}

function countSimilarRecent(newResponse, recentResponses, threshold = 0.5) {
  return recentResponses.filter(r => {
    const score = jaccardSimilarity(newResponse, r) * 0.4 + ngramSimilarity(newResponse, r) * 0.6;
    return score > threshold;
  }).length;
}

export { checkSimilarity, countSimilarRecent, jaccardSimilarity };
