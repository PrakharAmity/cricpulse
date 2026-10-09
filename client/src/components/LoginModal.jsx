import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [user, setUser] = useState('rohit');
  const [password, setPassword] = useState('coverdrive');

  if (!isOpen) return null;

  const quickAccounts = [
    { user: 'rohit', pass: 'coverdrive', role: 'player', label: 'Rohit Sharma (Player)' },
    { user: 'fan', pass: 'fanpass', role: 'fan', label: 'Aarav Mehta (Fan 1)' },
    { user: 'fan2', pass: 'fanpass', role: 'fan', label: 'Riya Sen (Fan 2)' }
  ];

  const handleSelectQuick = (acc) => {
    setUser(acc.user);
    setPassword(acc.pass);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, password);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <span className="kicker">AUTHENTICATION</span>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: '#fff' }}>
          Sign In to CricPulse
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Select a demo persona or enter account credentials below:
        </p>

        <div className="quick-accounts-group">
          {quickAccounts.map((acc) => (
            <button
              key={acc.user}
              type="button"
              className={`quick-acc-btn ${user === acc.user ? 'selected' : ''}`}
              onClick={() => handleSelectQuick(acc)}
            >
              <span>{acc.label}</span>
              <span className={`role-tag ${acc.role}`}>{acc.role}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Username (e.g. rohit, fan, fan2)"
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (coverdrive or fanpass)"
              required
            />
          </div>

          <button type="submit" className="submit-login-btn">
            Sign In Now
          </button>
        </form>
      </div>
    </div>
  );
}
