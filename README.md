# CricPulse — Live Cricket Analytics & Match Center Dashboard

## 1. Application Overview

**CricPulse** is a high-performance, offline-capable live cricket analytics match center designed for teams, tacticians, and fans tracking a high-stakes T20 chase. The application simulates the second innings of an ICC T20 Super 8 clash between **India (chasing 211, currently 161/3 in 12.0 overs)** and **Australia (210/7 in 20.0 overs)**.

### Core Functionality
- **Live Match Banner**: Real-time scoreboard with dynamic Current Run Rate (CRR: 13.42), Required Run Rate (RRR: 6.25), target tracking (50 runs required off 48 balls), and an animated chase win probability meter.
- **Innings Momentum Chart**: Over-by-over scoring bar chart with target pace lines and dynamic highlighting of the innings' peak scoring 6-over window.
- **Ball-by-Ball Feed**: Granular breakdown of recent deliveries, highlighting boundary streaks (Over 12: `[6, 4, 1, 1, 6, 6]`), strike rates, and live commentary.
- **Player Partnership Network**: Interactive SVG vector graph displaying the 6-player partnership topology. Allows clicking any player node to scan and highlight reachable teammates, alongside computing the strongest bottleneck chain between Rohit Sharma and Ravindra Jadeja.
- **Live Form & Rolling Run Rate**: Rolling scoring rate analysis over recent overs compared against full-innings benchmarks.
- **Player Workspace**: Role-restricted tactical dugout note editor allowing authenticated players to record strategic adjustments.
- **Fan Zone Live Poll**: Interactive real-time audience prediction poll ("Will India chase down 211 in 18 overs?") with sliding-window per-fan rate limiting.

### Technology Stack
- **Backend**: Node.js, Express 4/5, in-memory state model, RESTful APIs, CORS enabled, serving on port **3000**.
- **Frontend**: React 18, Vite bundling, custom dark sports analytics design system (`#080c14` theme, glassmorphism, Google Fonts Outfit & Inter, neon cyan/blue sports accents).
- **Benchmarking Suite**: Self-contained test harness emitting strict single-line JSON telemetry for candidate evaluations.

---

## 2. Debugging Challenge

The initial repository has been configured with **6 intentional challenge bugs** across its modular backend services. Candidates are tasked with identifying, diagnosing, and repairing each issue:

### Issue 1: Partnership Reachability (Recursive Traversal Premature Exit)
- **Module**: `server/services/partnershipReachability.js`
- **User Symptom**: In the Partnership Network Graph, clicking Rohit Sharma displays an incomplete scan warning indicating that only 1 teammate is connected instead of the entire squad.
- **Task**: Fix the recursive graph traversal algorithm so that it explores all sibling edges and branches across the undirected graph rather than returning prematurely upon visiting the first unvisited neighbor.

### Issue 2: Innings Momentum (Discrete Non-Overlapping Six-Over Windows)
- **Module**: `server/services/bestSixOver.js`
- **User Symptom**: The Innings Momentum card badge displays `86 RUNS` instead of `108 RUNS`, severely understating India's peak scoring surge during overs 3–8.
- **Task**: Correct the sliding-window iterator to advance by 1 over at a time (`start++`) rather than skipping by discrete 6-over blocks (`start += 6`), ensuring all overlapping windows are evaluated.

### Issue 3: Rolling Run Rate (Full Innings Averaging Flaw)
- **Module**: `server/services/rollingRate.js`
- **User Symptom**: The Live Form card displays a rolling run rate of `13.42 runs/over` (the full innings average) rather than `11.33 runs/over` (the true average across the last 3 completed overs: 5, 5, and 24 runs).
- **Task**: Modify the calculation to compute the average runs scored exclusively over the most recent 3 overs (`overs.slice(-windowSize)`).

### Issue 4: Strongest Partnership Chain (Fewest Hops vs Maximum Bottleneck Capacity)
- **Module**: `server/services/strongestChain.js`
- **User Symptom**: The dashboard highlights Rohit ➔ Kohli ➔ Jadeja with a 20-run bottleneck capacity, missing the stronger tactical partnership route.
- **Task**: Replace the unweighted breadth-first search (which incorrectly selects the route with fewest hops) with a maximum-bottleneck capacity search between source (0) and target (5), finding the optimal path (0 ➔ 2 ➔ 4 ➔ 5) with a 30-run bottleneck capacity.

### Issue 5: Player Focus Note Access Control (Improper Fan Role Permission)
- **Module**: `server/services/playerAccess.js`
- **User Symptom**: Users logged in with fan accounts (`fan` or `fan2`) are improperly permitted to update and overwrite the private player tactical dugout note.
- **Task**: Restrict the note modification permission validator strictly to `role === 'player'`, denying fan requests with an HTTP 403 Forbidden response.

### Issue 6: Fan Poll Rate Limiter (Global State Blocking Independent Fans)
- **Module**: `server/services/pollLimiter.js`
- **User Symptom**: When Fan 1 (`fan`) exhausts their quota of 3 votes within the 10-second window, Fan 2 (`fan2`) is immediately blocked from voting with HTTP 429 ("Poll limit reached") despite having cast zero votes.
- **Task**: Refactor the rate limiter to maintain independent timestamped sliding windows mapped per `userId`, allowing each fan their own 3-vote allowance.

---

## 3. Expected Behavior After Fixing Bugs

Once all 6 bugs are successfully resolved, the application exhibits the following behavior:

1. **Complete Squad Reachability**: Clicking Rohit Sharma (Node 0) in the Partnership Network traverses all connected edges and confirms that all 5 teammates (`Kohli`, `Gill`, `Surya`, `Hardik`, and `Jadeja`) are reachable, displaying a green success confirmation banner.
2. **Accurate Peak 6-Over Momentum**: The Innings Momentum card badge correctly highlights Overs 3–8 and displays `BEST 6 OVERS: 108 RUNS`.
3. **Correct Rolling Run Rate**: The Live Form card computes and displays `11.33 runs/over` representing India's recent scoring rate across overs 10, 11, and 12.
4. **Optimal Partnership Chain**: The Strongest Chain badge and SVG vector highlights the maximum-bottleneck capacity route `Rohit ➔ Gill ➔ Hardik ➔ Jadeja` with a bottleneck strength of `30 runs`.
5. **Secure Player Note Access**: When signed in as a fan, submitting changes to the tactical note is rejected with HTTP 403 (`Player access required`), whereas player accounts (`rohit`) succeed with HTTP 200.
6. **Isolated Fan Rate Limiting**: After Fan 1 casts 3 votes and enters rate limiting, Fan 2 can sign in and cast up to 3 votes independently without interference.
7. **Passing Telemetry Suite**: Running the automated test command (`npm test` or `node tests/run_tests.js`) passes all 6 validation checks, outputting single-line strict JSON telemetry with `"Passed": 6, "Failed": 0` and exiting with status code `0`.
