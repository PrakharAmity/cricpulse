/**
 * Fan poll sliding-window rate limiter (10s window, max 3 votes per fan)
 * BUG 6: Ignores userId and uses a single global counter, blocking all fans once one hits limit.
 */

const WINDOW_MS = 10_000;
const MAX_VOTES = 3;

// Global state shared across all users (BUG)
let windowStartedAt = 0;
let count = 0;

function allowFanPoll(userId, now = Date.now()) {
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    count = 0;
  }
  if (count >= MAX_VOTES) {
    return { allowed: false, remaining: 0 };
  }
  count += 1; // BUG: global counter incremented regardless of userId
  return { allowed: true, remaining: MAX_VOTES - count };
}

function allowVote(userId, now = Date.now()) {
  return allowFanPoll(userId, now);
}

function resetForTests() {
  windowStartedAt = 0;
  count = 0;
}

module.exports = {
  allowFanPoll,
  allowVote,
  resetForTests,
  MAX_VOTES,
  WINDOW_MS
};
