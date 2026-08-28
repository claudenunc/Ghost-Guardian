function tokens(text = '') {
  return new Set(text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((word) => word.length > 2));
}

export function similarityScore(left, right) {
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

export function findDuplicateDrafts(draft, recentDrafts = [], threshold = 0.6) {
  const matches = recentDrafts
    .map((candidate) => ({ text: candidate, score: similarityScore(draft, candidate) }))
    .filter((result) => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
  return { isDuplicate: matches.length > 0, matches };
}

