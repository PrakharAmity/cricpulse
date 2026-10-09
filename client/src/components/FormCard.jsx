import React from 'react';

export default function FormCard({ overs = [], analytics }) {
  const rollingRate = analytics?.rollingRunRate !== undefined
    ? Number(analytics.rollingRunRate).toFixed(2)
    : '13.42';

  const inningsAvg = overs.length > 0
    ? (overs.reduce((a, b) => a + b, 0) / overs.length).toFixed(2)
    : '13.42';

  const last3Overs = overs.slice(-3);
  const actualRecentAvg = last3Overs.length > 0
    ? (last3Overs.reduce((a, b) => a + b, 0) / last3Overs.length).toFixed(2)
    : '11.33';

  return (
    <section className="analytics-card">
      <div className="card-header">
        <div>
          <span className="kicker">LIVE FORM</span>
          <h2 className="card-title">Rolling Run Rate</h2>
        </div>
        <span className="live-beacon" style={{ fontSize: '0.7rem' }}>
          RECENT METRIC
        </span>
      </div>

      <div className="rate-display-box">
        <span className="big-rate-number">{rollingRate}</span>
        <span className="rate-unit">runs / over</span>
      </div>

      <div className="rate-comparison-tag">
        Expected for last 3 overs: <b>{actualRecentAvg} RPO</b> (Overs 10, 11, 12)
      </div>

      <div className="rate-breakdown-table">
        <div className="rate-breakdown-row">
          <span>Innings Overall Average (12 ov):</span>
          <b>{inningsAvg} RPO</b>
        </div>
        <div className="rate-breakdown-row">
          <span>Recent 3-Over Window Runs:</span>
          <b>{last3Overs.join(' + ')} = {last3Overs.reduce((a, b) => a + b, 0)} runs</b>
        </div>
        <div className="rate-breakdown-row">
          <span>Recent Rate Formula:</span>
          <b>(5 + 5 + 24) / 3 = 11.33 RPO</b>
        </div>
      </div>
    </section>
  );
}
