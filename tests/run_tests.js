const { performance } = require('node:perf_hooks');

// Import services and fixtures
const { sampleMatch } = require('../server/data/matchData');
const { partnershipReachable, connectedPlayers } = require('../server/services/partnershipReachability');
const { bestSixOverStretch } = require('../server/services/bestSixOver');
const { rollingRunRate } = require('../server/services/rollingRate');
const { strongestPartnershipChain } = require('../server/services/strongestChain');
const { canSavePlayerNote } = require('../server/services/playerAccess');
const pollLimiter = require('../server/services/pollLimiter');

const cases = [
  [
    'test_recursive_partnership_scan_visits_all_connected_players',
    () => {
      const match = sampleMatch();
      const reachable = partnershipReachable
        ? partnershipReachable(match, 0)
        : connectedPlayers(0, match.partnerships);

      if (!reachable.includes(3) || reachable.length !== 5) {
        throw new Error('Partnership scan missed a player on a second branch');
      }
    }
  ],
  [
    'test_best_six_over_stretch_includes_overlapping_windows',
    () => {
      const match = sampleMatch();
      const result = bestSixOverStretch(match.overs);
      const actual = typeof result === 'object' ? result.runs : result;
      if (actual !== 108) {
        throw new Error(`Expected best six-over stretch of 108 runs, got ${actual}`);
      }
    }
  ],
  [
    'test_rolling_run_rate_uses_recent_overs',
    () => {
      const match = sampleMatch();
      const actual = rollingRunRate(match.overs, 3);
      if (actual < 11.3 || actual > 11.4) {
        const formatted = Number.isInteger(actual) ? actual : actual.toFixed(6);
        throw new Error(`Expected recent three-over rate near 11.33, got ${formatted}`);
      }
    }
  ],
  [
    'test_partnership_chain_maximizes_minimum_link',
    () => {
      const match = sampleMatch();
      const result = strongestPartnershipChain(0, 5, match.partnerships);
      const strength = result.strength;
      if (strength !== 30) {
        throw new Error(`Expected strongest chain bottleneck of 30 runs, got ${strength}`);
      }
    }
  ],
  [
    'test_fan_cannot_edit_player_focus_note',
    () => {
      const fanAllowed = canSavePlayerNote('fan');
      if (fanAllowed) {
        throw new Error('Fan role must not edit a player-only focus note');
      }
    }
  ],
  [
    'test_poll_rate_limit_is_per_fan',
    () => {
      if (typeof pollLimiter.resetForTests === 'function') {
        pollLimiter.resetForTests();
      }
      const now = 1000;
      for (let i = 0; i < 3; i++) {
        const resA = pollLimiter.allowFanPoll ? pollLimiter.allowFanPoll('fan-a', now) : pollLimiter.allowVote('fan-a', now);
        if (!resA.allowed) {
          throw new Error('Fan A should be allowed within vote limit');
        }
      }
      const resAExceeded = pollLimiter.allowFanPoll ? pollLimiter.allowFanPoll('fan-a', now) : pollLimiter.allowVote('fan-a', now);
      if (resAExceeded.allowed) {
        throw new Error('Fan A should be blocked after 3 votes');
      }
      const resB = pollLimiter.allowFanPoll ? pollLimiter.allowFanPoll('fan-b', now) : pollLimiter.allowVote('fan-b', now);
      if (!resB.allowed) {
        throw new Error('A second fan should have an independent poll allowance');
      }
    }
  ]
];

const telemetry = {};
let passed = 0;
let failed = 0;
let totalMs = 0;

for (const [name, run] of cases) {
  const start = performance.now();
  try {
    run();
    const elapsed = Math.max(0, Math.round(performance.now() - start));
    totalMs += elapsed;
    telemetry[name] = {
      Status: 'passed',
      'Execution time': `${elapsed}ms`
    };
    passed += 1;
  } catch (error) {
    const elapsed = Math.max(0, Math.round(performance.now() - start));
    totalMs += elapsed;
    telemetry[name] = {
      Status: 'failed',
      'Execution time': `${elapsed}ms`,
      Error: String(error.message).split('\n')[0]
    };
    failed += 1;
  }
}

telemetry.Passed = passed;
telemetry.Failed = failed;
telemetry['Total bugs'] = cases.length;
telemetry['Total Execution time'] = `${Math.max(1, totalMs)}ms`;

// Emit STRICT single-line JSON to stdout
process.stdout.write(`${JSON.stringify(telemetry)}\n`);
process.exit(failed === 0 ? 0 : 1);
