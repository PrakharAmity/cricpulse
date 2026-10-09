import React from 'react';

export default function Header({ session, onOpenLogin, onSignOut }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <span className="brand-logo-icon">◉</span>
        <div>
          <h1 className="brand-text">
            CRIC<span>PULSE</span>
          </h1>
          <span className="brand-sub">LIVE MATCH CENTER</span>
        </div>
      </div>

      <nav className="header-nav">
        <a href="#match-center" className="nav-link active">MATCH CENTER</a>
        <a href="#momentum" className="nav-link">MOMENTUM</a>
        <a href="#partnerships" className="nav-link">PARTNERSHIPS</a>
        <a href="#fanzone" className="nav-link">FAN ZONE</a>
      </nav>

      <div className="header-actions">
        <div className="live-beacon">
          <span className="live-dot" />
          <span>LIVE • T20 CHASE</span>
        </div>

        {session ? (
          <div className="user-badge-header">
            <span>{session.name || session.user}</span>
            <span className={`role-tag ${session.role}`}>{session.role}</span>
            <button className="auth-btn sign-out" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="auth-btn" onClick={onOpenLogin}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
