import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import MatchBanner from './components/MatchBanner.jsx';
import MomentumChart from './components/MomentumChart.jsx';
import BallFeed from './components/BallFeed.jsx';
import PartnershipGraph from './components/PartnershipGraph.jsx';
import FormCard from './components/FormCard.jsx';
import PlayerWorkspace from './components/PlayerWorkspace.jsx';
import FanZone from './components/FanZone.jsx';
import LoginModal from './components/LoginModal.jsx';

export default function App() {
  const [matchState, setMatchState] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [playerNote, setPlayerNote] = useState('');
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('cricpulse_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [reachResult, setReachResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [fanVoteCount, setFanVoteCount] = useState(0);
  const [pollVotes, setPollVotes] = useState({
    confident: 1420,
    close: 850,
    defend: 211
  });
  const [totalVotes, setTotalVotes] = useState(2481);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const authHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
    return headers;
  }, [session]);

  // Fetch initial match state and analytics
  const fetchData = useCallback(async () => {
    try {
      const [stateRes, analyticsRes, noteRes] = await Promise.all([
        fetch('/api/state').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/analytics').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/player-note').then((r) => (r.ok ? r.json() : null))
      ]);

      if (stateRes) setMatchState(stateRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (noteRes && noteRes.note) setPlayerNote(noteRes.note);
    } catch (err) {
      console.error('Error fetching live data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Login handler
  const handleLogin = async (user, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Invalid credentials', 'error');
        return;
      }

      setSession(data);
      localStorage.setItem('cricpulse_session', JSON.stringify(data));
      setIsLoginOpen(false);
      showToast(`Signed in as ${data.name || data.user} (${data.role})`, 'success');
    } catch {
      showToast('Login request failed', 'error');
    }
  };

  const handleSignOut = () => {
    setSession(null);
    setFanVoteCount(0);
    localStorage.removeItem('cricpulse_session');
    showToast('Signed out', 'info');
  };

  // Scan reachable players
  const handleScanPlayer = async (playerId) => {
    try {
      const res = await fetch(`/api/reachable/${playerId}`);
      if (!res.ok) {
        showToast(`Failed to scan reachability: HTTP ${res.status}`, 'error');
        return;
      }
      const data = await res.json();
      setReachResult({
        playerId,
        reachable: data.reachable || []
      });

      if ((data.reachable || []).length < 5) {
        showToast(
          `Reachability warning: Only ${(data.reachable || []).length} teammates connected!`,
          'error'
        );
      } else {
        showToast(
          `All ${(data.reachable || []).length} teammates connected via partnership graph!`,
          'success'
        );
      }
    } catch {
      showToast('Network error during reachability scan', 'error');
    }
  };

  // Save tactical note
  const handleSaveNote = async (newNote) => {
    if (!session) {
      setIsLoginOpen(true);
      showToast('Please sign in to save note', 'error');
      return;
    }

    try {
      const res = await fetch('/api/player-note', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ note: newNote })
      });
      const data = await res.json();

      if (res.status === 403) {
        showToast(`Access Denied: ${data.error || 'Player access required'} (HTTP 403)`, 'error');
        return;
      }

      if (!res.ok) {
        showToast(data.error || `Error ${res.status}`, 'error');
        return;
      }

      setPlayerNote(data.note || newNote);
      showToast('Player tactical note updated successfully!', 'success');
    } catch {
      showToast('Network error saving note', 'error');
    }
  };

  // Cast fan poll vote
  const handleVote = async (option) => {
    if (!session) {
      setIsLoginOpen(true);
      showToast('Sign in to cast fan votes', 'info');
      return;
    }

    try {
      const res = await fetch('/api/poll', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ option })
      });
      const data = await res.json();

      if (res.status === 429) {
        showToast(`Rate Limited: ${data.error || 'Poll limit reached'} (HTTP 429)`, 'error');
        return;
      }

      if (!res.ok) {
        showToast(data.error || `HTTP ${res.status}`, 'error');
        return;
      }

      setFanVoteCount((prev) => prev + 1);
      if (data.votes) setPollVotes(data.votes);
      if (data.totalVotes) setTotalVotes(data.totalVotes);
      showToast(`Vote recorded! (${data.remaining} votes remaining in window)`, 'success');
    } catch {
      showToast('Network error submitting vote', 'error');
    }
  };

  const overs = matchState?.overs || [7, 7, 18, 18, 18, 18, 18, 18, 5, 5, 5, 24];
  const totalRuns = overs.reduce((a, b) => a + b, 0);
  const inningsRate = totalRuns / (overs.length || 1);

  return (
    <div className="app-container">
      <Header
        session={session}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="dashboard-main">
        <MatchBanner match={matchState} inningsRate={inningsRate} />

        <div className="dashboard-grid">
          <div className="col-main">
            <MomentumChart overs={overs} analytics={analytics} />
            <BallFeed currentOver={matchState?.currentOver || 12} />
          </div>

          <div className="col-side">
            <FormCard overs={overs} analytics={analytics} />
            <FanZone
              session={session}
              pollVotes={pollVotes}
              totalVotes={totalVotes}
              fanVoteCount={fanVoteCount}
              onVote={handleVote}
            />
            <PlayerWorkspace
              session={session}
              note={playerNote}
              onSaveNote={handleSaveNote}
            />
          </div>

          <PartnershipGraph
            players={matchState?.players || []}
            partnerships={matchState?.partnerships || []}
            analytics={analytics}
            onScanPlayer={handleScanPlayer}
            reachResult={reachResult}
          />
        </div>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      {toast && (
        <div className={`app-toast ${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
