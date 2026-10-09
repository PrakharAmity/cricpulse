# CricPulse — Live Cricket Analytics (Node.js + React Edition)

## Description

CricPulse is a high-performance, offline-capable live cricket analytics match center designed for teams, tacticians, and fans tracking a high-stakes T20 chase. It runs as a self-contained Node.js (Express) backend service paired with a React 18 browser interface on port 3000. The application simulates the second innings of an ICC T20 Super 8 match between India (chasing 211, currently 161/3 in 12.0 overs) and Australia (210/7 in 20.0 overs), providing ball-by-ball momentum, partnership network graphs, rolling run rate metrics, a role-restricted tactical dugout workspace, and an interactive fan poll.

## Repository Structure

```text
cricpulse-node-react-challenge/
├── package.json                   Node.js dependencies and lifecycle scripts (start, build, test)
├── challenge.json                 Challenge runtime, port, start, and test runner configuration
├── README.md                      Candidate-facing application overview and bug reproduction guide
├── AI.md                          Challenge architecture, bug locations, and benchmark specification
├── server/
│   ├── server.js                  Express HTTP server on port 3000, REST API routes, and static SPA serving
│   ├── data/
│   │   └── matchData.js           Deterministic in-memory match state fixture, players, and partnership graph
│   └── services/
│       ├── bestSixOver.js         Bug 2: Sliding-window peak scoring stretch
│       ├── rollingRate.js         Bug 3: Rolling run rate calculator
│       ├── strongestChain.js      Bug 4: Maximum-bottleneck partnership graph search
│       ├── partnershipReachability.js Bug 1: Recursive graph traversal
│       ├── playerAccess.js        Bug 5: Role-based note permission validator
│       └── pollLimiter.js         Bug 6: Per-fan sliding-window rate limiter
├── client/
│   ├── index.html                 HTML5 shell loading Google Fonts (Outfit & Inter)
│   ├── package.json               Client build scripts and frontend dependencies
│   ├── vite.config.js             Vite build configuration and backend proxying
│   ├── dist/                      Pre-bundled production assets for offline serving
│   └── src/
│       ├── main.jsx               React application root entrypoint
│       ├── App.jsx                Main dashboard coordinator and live state synchronization
│       ├── App.css                Dark sports analytics theme with glassmorphism and CSS tokens
│       └── components/
│           ├── Header.jsx         Brand logo, live pulse indicator, user badge, and sign-in button
│           ├── MatchBanner.jsx    IND vs AUS scoreboard, CRR, RRR, and chase win probability
│           ├── MomentumChart.jsx  Over-by-over scoring chart with target run rate and best 6 overs badge
│           ├── BallFeed.jsx       Ball-by-ball timeline for over 12 (6, 4, 1, 1, 6, 6)
│           ├── PartnershipGraph.jsx Interactive SVG graph network with reachability and bottleneck chain
│           ├── FormCard.jsx       Live scoring form and rolling run rate metric card
│           ├── PlayerWorkspace.jsx Role-restricted tactical dugout note editor
│           ├── FanZone.jsx        Live interactive fan poll with rate limit feedback
│           └── LoginModal.jsx     Sign-in modal supporting player and fan demo personas
└── tests/
    └── run_tests.js               Automated test suite emitting single-line strict JSON telemetry
```

## Bugs and Bug Locations

These are the six behavioral bug surfaces covered by the challenge. The named locations identify the owning implementation areas for debugging and review.

### 1. Partnership reachability scan terminates prematurely

- **Bug location:** `server/services/partnershipReachability.js`, `connectedPlayers` (invoked via `partnershipReachable`)
- **How to observe it:** Click Rohit Sharma (Node 0) in the Partnership Network Graph on the dashboard.
- **Failure:** The traversal helper executes `return visit(...)` on the first unvisited neighbor, aborting sibling branches and reporting that only 1 teammate is reachable.
- **Expected:** The scan explores all connected branches across the undirected graph and confirms all 5 teammates (Kohli, Gill, Surya, Hardik, Jadeja) are reachable.

### 2. Best six-over stretch skips overlapping sliding windows

- **Bug location:** `server/services/bestSixOver.js`, `bestSixOverStretch`
- **How to observe it:** Inspect the "BEST 6 OVERS" badge on the Innings Momentum chart.
- **Failure:** The iterator increments by `start += 6` instead of `start += 1`, testing only discrete spans (overs 1–6 = 86 runs, overs 7–12 = 75 runs) and displaying `86 RUNS`.
- **Expected:** The window steps 1 over at a time (`start++`), capturing the peak scoring span across overs 3–8 and displaying `108 RUNS`.

### 3. Rolling run rate averages the full innings instead of recent overs

- **Bug location:** `server/services/rollingRate.js`, `rollingRunRate`
- **How to observe it:** Check the Live Form card on the dashboard.
- **Failure:** The calculation sums all completed overs and divides by total overs, displaying the overall innings rate of `13.42 runs/over`.
- **Expected:** The rate averages runs exclusively across the last 3 completed overs (`overs.slice(-windowSize)`), displaying `11.33 runs/over` for overs 10, 11, and 12 (`(5 + 5 + 24) / 3`).

### 4. Strongest partnership chain minimizes hop count instead of maximizing bottleneck capacity

- **Bug location:** `server/services/strongestChain.js`, `strongestPartnershipChain`
- **How to observe it:** Inspect the Strongest Chain badge and highlighted SVG vector route connecting Rohit to Jadeja.
- **Failure:** An unweighted breadth-first search selects the fewest-hop route `0 ➔ 1 ➔ 5` with a 20-run bottleneck capacity.
- **Expected:** A maximum-bottleneck capacity search identifies the optimal route `0 ➔ 2 ➔ 4 ➔ 5` (Rohit ➔ Gill ➔ Hardik ➔ Jadeja) with a 30-run bottleneck capacity.

### 5. Player focus note permits unauthorized fan modification

- **Bug location:** `server/services/playerAccess.js`, `canSavePlayerNote` / `savePlayerNote`
- **How to observe it:** Sign in using a fan demo persona (`fan` or `fan2`), edit the dugout note in the Player Workspace, and click "Save Strategy Note".
- **Failure:** The access control check validates `role === 'player' || role === 'fan'`, improperly allowing fans to save the note with HTTP 200.
- **Expected:** Access is strictly restricted to `role === 'player'`. Fan save attempts are rejected with HTTP 403 (`Player access required`).

### 6. Fan poll rate limiter shares global state across all users

- **Bug location:** `server/services/pollLimiter.js`, `allowFanPoll` / `allowVote`
- **How to observe it:** Sign in as Fan 1 (`fan`), cast 3 votes in the Fan Zone poll to exhaust the quota, then sign in as Fan 2 (`fan2`) and attempt to vote.
- **Failure:** A single global counter is shared across all users, immediately blocking Fan 2 with HTTP 429 ("Poll limit reached") despite Fan 2 having cast zero votes.
- **Expected:** The limiter tracks sliding-window counts independently per `userId`, allowing each fan their own 3-vote quota per 10-second window.

## Expected Behaviour After Fixing All Bugs

- Clicking any player node in the Partnership Graph scans and connects all teammates across all recursive branches without early termination.
- Innings Momentum accurately evaluates overlapping windows and highlights the peak 6-over stretch of 108 runs.
- The Live Form metric displays 11.33 runs/over based on the last 3 completed overs.
- The strongest partnership chain between Rohit and Jadeja identifies the route with the highest minimum link capacity (30 runs).
- Fan accounts are strictly denied write access to player dugout notes with HTTP 403, while player accounts save successfully with HTTP 200.
- Fan poll rate limits are scoped per user, ensuring each fan receives an independent 3-vote allowance.
- Running `npm test` or `node tests/run_tests.js` passes all 6 tests, emits strict single-line JSON telemetry, and exits with code 0.
