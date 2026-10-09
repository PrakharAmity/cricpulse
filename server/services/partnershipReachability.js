const { sampleMatch } = require('../data/matchData');

/**
 * Returns list of reachable connected player IDs given a start player ID.
 * BUG 1: Recursive traversal returns immediately upon visiting the first unvisited
 * neighbor inside the loop (return visit(...)), halting sibling branch exploration
 * and missing connected teammates.
 */
function connectedPlayers(start, edges = null) {
  const match = sampleMatch();
  const graphEdges = edges || match.partnerships;
  const startId = Number(start);
  const visited = new Set([startId]);

  function visit(player) {
    for (const edge of graphEdges) {
      const teammate = edge.a === player ? edge.b : edge.b === player ? edge.a : null;
      if (teammate !== null && !visited.has(teammate)) {
        visited.add(teammate);
        return visit(teammate); // BUG: returns immediately and stops exploring sibling branches!
      }
    }
  }

  visit(startId);
  return [...visited].filter((id) => id !== startId);
}

function partnershipReachable(stateOrId, maybeId) {
  if (typeof stateOrId === 'object' && stateOrId !== null && stateOrId.partnerships) {
    return connectedPlayers(maybeId, stateOrId.partnerships);
  }
  return connectedPlayers(stateOrId, maybeId);
}

module.exports = {
  connectedPlayers,
  partnershipReachable
};
