import React from 'react';

export default function MatchBanner({ match, inningsRate }) {
  if (!match) return null;

  const target = match.target || 211;
  const currentRuns = match.score || 161;
  const runsNeeded = Math.max(0, target - currentRuns);
  const oversRemaining = 20 - (match.currentOver || 12);
  const ballsRemaining = oversRemaining * 6;
  const rrr = oversRemaining > 0 ? (runsNeeded / oversRemaining).toFixed(2) : '0.00';
  const crr = (inningsRate || (currentRuns / (match.currentOver || 12))).toFixed(2);

  return (
    <section className="match-banner" id="match-center">
      <div className="banner-meta-row">
        <span>ICC T20 SUPER 8 • SECOND INNINGS</span>
        <span>KENSINGTON OVAL • 18:30 IST</span>
      </div>

      <div className="scoreboard-row">
        {/* Team India */}
        <div className="team-card">
          <span className="team-flag ind">IND</span>
          <div className="team-details">
            <h3>INDIA</h3>
            <span>2ND INNINGS (CHASING)</span>
          </div>
          <div className="team-score">
            {currentRuns}<span className="wickets">/{match.wickets}</span>
            <span className="team-overs">({match.currentOver}.0)</span>
          </div>
        </div>

        <div className="vs-badge">VS</div>

        {/* Team Australia */}
        <div className="team-card opponent">
          <div className="team-score">
            {match.opponent ? match.opponent.score : 210}
            <span className="wickets">/{match.opponent ? match.opponent.wickets : 7}</span>
            <span className="team-overs">(20.0)</span>
          </div>
          <div className="team-details" style={{ textAlign: 'right' }}>
            <h3>AUSTRALIA</h3>
            <span>1ST INNINGS COMPLETED</span>
          </div>
          <span className="team-flag aus">AUS</span>
        </div>
      </div>

      <div className="banner-footer-stats">
        <div className="equation-text">
          <span>⚡ INDIA NEED {runsNeeded} RUNS FROM {ballsRemaining} BALLS (TARGET {target})</span>
        </div>

        <div className="rate-stat-group">
          <span className="stat-item">
            CRR <b>{crr}</b>
          </span>
          <span className="stat-item">
            RRR <b>{rrr}</b>
          </span>
        </div>

        <div className="win-prob-wrapper">
          <span className="stat-item">WIN PROBABILITY:</span>
          <div className="win-prob-bar">
            <div className="win-prob-fill" />
          </div>
          <span className="win-prob-text">IND 78%</span>
        </div>
      </div>
    </section>
  );
}
