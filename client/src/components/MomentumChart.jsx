import React from 'react';

export default function MomentumChart({ overs, analytics }) {
  if (!overs || !overs.length) return null;

  const maxRuns = Math.max(...overs, 24);
  const bestRuns = analytics?.bestSixOverRuns || 86;
  const bestStart = analytics?.bestSixOverStart ?? (bestRuns === 108 ? 2 : 0);

  return (
    <section className="analytics-card" id="momentum">
      <div className="card-header">
        <div>
          <span className="kicker">INNINGS MOMENTUM</span>
          <h2 className="card-title">Over-by-Over Scoring Flow</h2>
        </div>
        <div className="legend-stretch-badge">
          BEST 6 OVERS: {bestRuns} RUNS
        </div>
      </div>

      <div className="chart-container">
        <div className="target-rate-line" title="Target Run Rate (10.55 RPO)">
          <span className="target-rate-label">Target Pace: 10.55 RPO</span>
        </div>

        {overs.map((runs, index) => {
          const overNum = index + 1;
          const heightPct = Math.max(12, Math.round((runs / maxRuns) * 100));
          const isInBest = index >= bestStart && index < bestStart + 6;

          return (
            <div className="chart-bar-column" key={overNum}>
              <span className="bar-runs-label">{runs}</span>
              <div
                className={`chart-bar ${isInBest ? 'in-best-stretch' : ''}`}
                style={{ height: `${heightPct}%` }}
                title={`Over ${overNum}: ${runs} runs${isInBest ? ' (In Best 6-Over Stretch)' : ''}`}
              />
              <span className="bar-over-number">Ov {overNum}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-legend-row">
        <span style={{ color: 'var(--text-muted)' }}>
          ● Cyan bars highlight the peak scoring window
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          Overs 1–12 Completed • Run Rate Target: 10.55
        </span>
      </div>
    </section>
  );
}
