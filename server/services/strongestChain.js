const { sampleMatch } = require('../data/matchData');

/**
 * Finds the strongest partnership chain maximizing the minimum edge bottleneck between source and target.
 * BUG 4: Uses unweighted BFS with a FIFO queue, which selects the shortest path by hops
 * (0 -> 1 -> 5, bottleneck 20 runs) instead of the max-bottleneck path (0 -> 2 -> 4 -> 5, bottleneck 30 runs).
 */
function strongestPartnershipChain(source = 0, target = 5, edges = null) {
  const match = sampleMatch();
  const graphEdges = edges || match.partnerships;

  // BUG: unweighted BFS finds fewest hops, not maximum bottleneck capacity
  const queue = [[source]];
  const visited = new Set([source]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === target) {
      const capacity = Math.min(...path.slice(1).map((node, index) => {
        const previous = path[index];
        const edge = graphEdges.find((e) => (e.a === previous && e.b === node) || (e.b === previous && e.a === node));
        return edge ? edge.runs : 0;
      }));
      return { chain: path, strength: capacity };
    }

    for (const edge of graphEdges) {
      const neighbor = edge.a === current ? edge.b : edge.b === current ? edge.a : null;
      if (neighbor !== null && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return { chain: [], strength: 0 };
}

module.exports = {
  strongestPartnershipChain
};
