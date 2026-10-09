import React from 'react';

export default function FanZone({
  session,
  pollVotes = { confident: 1420, close: 850, defend: 211 },
  totalVotes = 2481,
  fanVoteCount = 0,
  onVote
}) {
  const options = [
    { key: 'confident', label: 'Yes / Confident' },
    { key: 'close', label: 'Close Finish' },
    { key: 'defend', label: 'Australia will defend' }
  ];

  const calculatePct = (count) => {
    if (!totalVotes || totalVotes <= 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <section className="analytics-card" id="fanzone">
      <div className="card-header">
        <div>
          <span className="kicker">FAN ZONE POLL</span>
          <h2 className="card-title">Live Match Prediction</h2>
        </div>
        <span className="role-tag fan">
          {session ? session.user : 'FAN POLL'}
        </span>
      </div>

      <div className="poll-question">
        Will India chase down 211 in 18 overs?
      </div>

      <div className="poll-status-tag">
        {session
          ? `Votes cast by ${session.user}: ${fanVoteCount} / 3 (10s window)`
          : 'Sign in as fan to vote (Limit: 3 votes / fan)'}
      </div>

      <div className="poll-options-list">
        {options.map((opt) => {
          const count = pollVotes[opt.key] || 0;
          const pct = calculatePct(count);

          return (
            <button
              key={opt.key}
              className="poll-option-button"
              onClick={() => onVote(opt.key)}
              title={`Vote for: ${opt.label}`}
            >
              <div className="poll-bar-fill" style={{ width: `${pct}%` }} />
              <span className="poll-option-label">{opt.label}</span>
              <span className="poll-option-pct">{pct}%</span>
            </button>
          );
        })}
      </div>

      <div className="poll-footer-info">
        <span>{totalVotes.toLocaleString()} votes cast</span>
        <span>Window: 10s • Max: 3 per fan</span>
      </div>
    </section>
  );
}
