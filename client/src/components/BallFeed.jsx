import React from 'react';

export default function BallFeed({ currentOver = 12 }) {
  const over12Balls = [
    { ball: '12.1', runs: 6, type: 'six', desc: 'SIX! Lofted over long-off' },
    { ball: '12.2', runs: 4, type: 'four', desc: 'FOUR! Slashed through extra cover' },
    { ball: '12.3', runs: 1, type: 'single', desc: 'Single steered to third man' },
    { ball: '12.4', runs: 1, type: 'single', desc: 'Quick single pushed to mid-on' },
    { ball: '12.5', runs: 6, type: 'six', desc: 'SIX! Pulled deep into the mid-wicket stands' },
    { ball: '12.6', runs: 6, type: 'six', desc: 'SIX! Smoked straight over the bowler head!' }
  ];

  return (
    <section className="analytics-card">
      <div className="card-header">
        <div>
          <span className="kicker">BALL-BY-BALL TIMELINE</span>
          <h2 className="card-title">Over {currentOver} Breakdown</h2>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          Latest Over
        </span>
      </div>

      <div className="over-balls-spotlight">
        <div className="over-balls-row">
          {over12Balls.map((b, i) => (
            <div
              key={i}
              className={`ball-circle ${b.type}`}
              title={`${b.ball}: ${b.desc}`}
            >
              {b.runs}
            </div>
          ))}
        </div>

        <div className="over-total-box">
          <div className="over-total-number">24</div>
          <small>RUNS IN OVER {currentOver}</small>
        </div>
      </div>

      <div className="commentary-banner">
        <b>12.6 • MAXIMUM!</b>
        <p>
          Hardik Pandya finishes over 12 in sensational fashion! 24 runs taken off Starc to completely swing the momentum towards India.
        </p>
      </div>

      <div className="rate-breakdown-table" style={{ marginTop: '0.25rem' }}>
        <div className="rate-breakdown-row" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
          <span>BATTER AT CREASE</span>
          <span>RUNS (BALLS)</span>
          <span>STRIKE RATE</span>
        </div>
        <div className="rate-breakdown-row">
          <span>Virat Kohli (not out)</span>
          <b>41 (28)</b>
          <b>146.4</b>
        </div>
        <div className="rate-breakdown-row">
          <span style={{ color: 'var(--accent-cyan)' }}>Hardik Pandya * (on strike)</span>
          <b style={{ color: 'var(--accent-cyan)' }}>32 (12)</b>
          <b style={{ color: 'var(--accent-cyan)' }}>266.7</b>
        </div>
      </div>
    </section>
  );
}
