const { sampleMatch } = require('../data/matchData');

/**
 * Calculates the highest scoring 6-over window in the innings.
 * BUG 2: Sliding window advances by start += 6 instead of start += 1,
 * only evaluating discrete 6-over blocks and skipping overlapping windows.
 */
function bestSixOverStretch(input = null) {
  const match = sampleMatch();
  const rawOvers = input || match.overs;
  const overs = rawOvers.map((over) => (typeof over === 'number' ? over : over.runs));

  let bestRuns = 0;
  let bestStart = 0;

  for (let start = 0; start + 6 <= overs.length; start += 6) { // BUG: skips overlapping 6-over windows
    const runs = overs.slice(start, start + 6).reduce((sum, r) => sum + r, 0);
    if (runs > bestRuns) {
      bestRuns = runs;
      bestStart = start;
    }
  }

  return {
    runs: bestRuns,
    start: bestStart,
    end: bestStart + 5
  };
}

module.exports = {
  bestSixOverStretch
};
