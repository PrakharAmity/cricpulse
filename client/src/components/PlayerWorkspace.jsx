import React, { useState, useEffect } from 'react';

export default function PlayerWorkspace({ session, note, onSaveNote }) {
  const [draftNote, setDraftNote] = useState(note || '');

  useEffect(() => {
    setDraftNote(note || '');
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveNote(draftNote);
  };

  return (
    <section className="analytics-card">
      <div className="card-header">
        <div>
          <span className="kicker">PLAYER WORKSPACE</span>
          <h2 className="card-title">Tactical Dugout Note</h2>
        </div>
        <span className="role-tag player">
          {session ? session.role.toUpperCase() : 'LOCKED'}
        </span>
      </div>

      <p className="workspace-desc">
        Internal tactical strategy. Restricted strictly to team player accounts.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          className="workspace-textarea"
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Enter player strategy note..."
          disabled={!session}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="submit"
            className="save-note-btn"
            disabled={!session}
          >
            {session ? 'Save Strategy Note' : 'Sign in to Edit'}
          </button>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {session ? `Role: ${session.role}` : 'Sign in required'}
          </span>
        </div>
      </form>
    </section>
  );
}
