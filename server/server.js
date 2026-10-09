const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');

const { sampleMatch } = require('./data/matchData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory application state
const matchState = sampleMatch();
let currentNote = matchState.initialNote;

// In-memory session store
const sessions = new Map(); // token -> { user, role, name, userId }

// In-memory poll votes
const pollVotes = {
  confident: 1420,
  close: 850,
  defend: 211
};

// Helper for dynamic service resolution (reloads on every call so edits apply immediately)
function freshRequire(serviceRelativePath) {
  const resolved = path.resolve(__dirname, serviceRelativePath);
  delete require.cache[resolved];
  return require(resolved);
}

// Session authentication middleware helper
function getSession(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  return sessions.get(token) || null;
}

// --- REST API ENDPOINTS ---

// 1. GET /api/state
app.get('/api/state', (req, res) => {
  return res.json({
    score: matchState.score,
    wickets: matchState.wickets,
    target: matchState.target,
    currentOver: matchState.currentOver,
    overs: matchState.overs,
    oversDetailed: matchState.oversDetailed,
    players: matchState.players,
    partnerships: matchState.partnerships,
    opponent: matchState.opponent,
    note: currentNote
  });
});

// 2. GET /api/analytics
app.get('/api/analytics', (req, res) => {
  try {
    const { bestSixOverStretch } = freshRequire('./services/bestSixOver');
    const { rollingRunRate } = freshRequire('./services/rollingRate');
    const { strongestPartnershipChain } = freshRequire('./services/strongestChain');

    const best = bestSixOverStretch(matchState.overs);
    const rate = rollingRunRate(matchState.overs, 3);
    const chainResult = strongestPartnershipChain(0, 5, matchState.partnerships);

    return res.json({
      bestSixOverRuns: best.runs,
      bestSixOverStart: best.start,
      bestSixOverEnd: best.end,
      rollingRunRate: rate,
      chainStrength: chainResult.strength,
      chain: chainResult.chain
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// 3. GET /api/reachable/:id
app.get('/api/reachable/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { partnershipReachable, connectedPlayers } = freshRequire('./services/partnershipReachability');

    const reachable = partnershipReachable
      ? partnershipReachable(matchState, id)
      : connectedPlayers(id, matchState.partnerships);

    return res.json({
      player_id: id,
      reachable: reachable || []
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// 4. POST /api/login
app.post('/api/login', (req, res) => {
  const { user, password } = req.body || {};
  const account = matchState.demoAccounts.find(
    (acc) => acc.user === user && acc.password === password
  );

  if (!account) {
    return res.status(401).json({ ok: false, error: 'Invalid sign-in' });
  }

  const token = `cp-${account.user}-${Date.now()}`;
  const session = {
    userId: account.user,
    user: account.user,
    role: account.role,
    name: account.name,
    token
  };
  sessions.set(token, session);

  return res.json({
    ok: true,
    token,
    user: account.user,
    role: account.role,
    name: account.name
  });
});

// 5. POST /api/poll
app.post('/api/poll', (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }

  const { allowFanPoll, allowVote } = freshRequire('./services/pollLimiter');
  const rateLimitCheck = allowFanPoll
    ? allowFanPoll(session.userId || session.user, Date.now())
    : allowVote(session.userId || session.user, Date.now());

  if (!rateLimitCheck.allowed) {
    return res.status(429).json({ ok: false, error: 'Poll limit reached' });
  }

  const { option } = req.body || {};
  if (option && Object.prototype.hasOwnProperty.call(pollVotes, option)) {
    pollVotes[option] += 1;
  } else {
    pollVotes.confident += 1; // default increment
  }

  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  return res.json({
    ok: true,
    message: 'Vote counted',
    remaining: rateLimitCheck.remaining,
    votes: pollVotes,
    totalVotes
  });
});

// 6. GET /api/player-note
app.get('/api/player-note', (req, res) => {
  return res.json({ ok: true, note: currentNote });
});

// 7. POST /api/player-note
app.post('/api/player-note', (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }

  const { savePlayerNote, canSavePlayerNote } = freshRequire('./services/playerAccess');
  const { note } = req.body || {};

  // Check permission through service
  if (typeof savePlayerNote === 'function') {
    const result = savePlayerNote(currentNote, note, session.role);
    if (!result.ok) {
      return res.status(403).json({ ok: false, error: 'Player access required' });
    }
    currentNote = result.note;
    return res.json({ ok: true, note: currentNote });
  }

  if (typeof canSavePlayerNote === 'function') {
    if (!canSavePlayerNote(session.role)) {
      return res.status(403).json({ ok: false, error: 'Player access required' });
    }
    currentNote = String(note || '').slice(0, 500);
    return res.json({ ok: true, note: currentNote });
  }

  return res.status(403).json({ ok: false, error: 'Player access required' });
});

// --- STATIC SPA SERVING ---
const clientDist = path.resolve(__dirname, '../client/dist');
const fallbackDist = path.resolve(__dirname, '../dist');
const staticRoot = fs.existsSync(clientDist) ? clientDist : fallbackDist;

if (fs.existsSync(staticRoot)) {
  app.use(express.static(staticRoot));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(staticRoot, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CricPulse backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
