import React, { useState } from 'react';

export default function PartnershipGraph({
  players = [],
  partnerships = [],
  analytics,
  onScanPlayer,
  reachResult
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const chain = analytics?.chain || [0, 1, 5];
  const chainStrength = analytics?.chainStrength || 20;

  // Build a set of active chain edges to highlight lines
  const chainEdgeSet = new Set();
  for (let i = 0; i < chain.length - 1; i++) {
    const u = Math.min(chain[i], chain[i + 1]);
    const v = Math.max(chain[i], chain[i + 1]);
    chainEdgeSet.add(`${u}-${v}`);
  }

  const playerDict = {};
  players.forEach((p) => {
    playerDict[p.id] = p;
  });

  const handleNodeClick = (playerId) => {
    setSelectedPlayer(playerId);
    if (onScanPlayer) {
      onScanPlayer(playerId);
    }
  };

  const chainNames = chain.map((id) => playerDict[id]?.short || `P${id}`).join(' ➔ ');

  return (
    <section className="analytics-card partnership-full-card" id="partnerships">
      <div className="card-header">
        <div>
          <span className="kicker">TEAM CONNECTION GRAPH</span>
          <h2 className="card-title">Undirected Partnership Network</h2>
        </div>
        <div className="strongest-chain-banner">
          <span>⚡ STRONGEST CHAIN (0 ➔ 5):</span>
          <b>{chainNames}</b>
          <span style={{ color: 'var(--accent-cyan)' }}>({chainStrength} runs bottleneck)</span>
        </div>
      </div>

      {reachResult ? (
        <div
          className={`reachability-feedback ${
            reachResult.reachable.length < 5 ? 'warning' : 'success'
          }`}
        >
          <span>{reachResult.reachable.length < 5 ? '⚠️' : '✅'}</span>
          <span>
            <b>
              {reachResult.reachable.length < 5
                ? `Partnership Scan Incomplete (${reachResult.reachable.length}/5 teammates):`
                : 'Partnership Scan Complete:'}
            </b>{' '}
            {playerDict[reachResult.playerId]?.name || 'Player'} reached {reachResult.reachable.length} teammates:{' '}
            {reachResult.reachable.map((id) => playerDict[id]?.short || id).join(', ') || 'None'}.
            {reachResult.reachable.length < 5 &&
              ' (Traversal stopped early on recursive branch!)'}
          </span>
        </div>
      ) : (
        <div className="reachability-feedback neutral">
          <span>💡</span>
          <span>
            Click any player node below to execute <code>GET /api/reachable/:id</code> and inspect connected teammates.
          </span>
        </div>
      )}

      <div className="graph-canvas-wrapper">
        <svg className="network-svg" viewBox="0 0 920 440" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cyanGlowLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* Render edges */}
          {partnerships.map((edge) => {
            const p1 = playerDict[edge.a];
            const p2 = playerDict[edge.b];
            if (!p1 || !p2) return null;

            const edgeKey = `${Math.min(edge.a, edge.b)}-${Math.max(edge.a, edge.b)}`;
            const isChainEdge = chainEdgeSet.has(edgeKey);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g key={edgeKey}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={`graph-edge ${isChainEdge ? 'chain-highlight' : ''}`}
                />
                <circle cx={midX} cy={midY} r="12" fill="#080c14" stroke={isChainEdge ? '#00e5ff' : '#334155'} />
                <text
                  x={midX}
                  y={midY + 4}
                  className={`edge-weight-label ${isChainEdge ? 'chain-highlight' : ''}`}
                >
                  {edge.runs}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Render node buttons */}
        {players.map((player) => {
          const isReachable =
            reachResult &&
            (reachResult.playerId === player.id || reachResult.reachable.includes(player.id));
          const isInChain = chain.includes(player.id);
          const leftPct = (player.x / 920) * 100;
          const topPct = (player.y / 440) * 100;

          return (
            <button
              key={player.id}
              className={`graph-node-button ${isReachable ? 'is-reachable' : ''} ${
                isInChain ? 'is-active-chain' : ''
              }`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                opacity: reachResult && !isReachable ? 0.35 : 1
              }}
              onClick={() => handleNodeClick(player.id)}
              title={`Click to test reachability from ${player.name}`}
            >
              <div className="node-avatar">{player.initials}</div>
              <span className="node-name">{player.short}</span>
              <span className="node-role">{player.role}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <span>Edge labels indicate partnership runs scored in tournament</span>
        <button
          onClick={() => handleNodeClick(0)}
          style={{ background: 'none', color: 'var(--accent-cyan)', fontWeight: 600 }}
        >
          Scan Rohit (Node 0) Reachability ➔
        </button>
      </div>
    </section>
  );
}
