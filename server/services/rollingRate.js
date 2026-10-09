const { sampleMatch } = require('../data/matchData');

/**
 * Calculates rolling run rate for recent overs (default last 3 overs).
 * BUG 3: Computes the entire innings average instead of the average over the last 3 overs.
 */
function rollingRunRate(input = null, windowSize = 3) {
  const match = sampleMatch();
  const rawOvers = input || match.overs;
  const overs = rawOvers.map((over) => (typeof over === 'number' ? over : over.runs));

  // BUG: uses full innings instead of latest window (overs.slice(-windowSize))
  const recentRuns = overs.reduce((sum, runs) => sum + runs, 0);
  return recentRuns / overs.length;
}

module.exports = {
  rollingRunRate
};
