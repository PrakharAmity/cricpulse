/**
 * CricPulse Deterministic Match State Fixture & Player Graph
 */

function sampleMatch() {
  const overs = [7, 7, 18, 18, 18, 18, 18, 18, 5, 5, 5, 24];
  const oversDetailed = overs.map((runs, index) => ({ number: index + 1, runs }));

  const players = [
    { id: 0, name: 'Rohit Sharma', short: 'Rohit', initials: 'RS', role: 'Opener', x: 120, y: 220, team: 'IND' },
    { id: 1, name: 'Virat Kohli', short: 'Kohli', initials: 'VK', role: 'Batter', x: 340, y: 110, team: 'IND' },
    { id: 2, name: 'Shubman Gill', short: 'Gill', initials: 'SG', role: 'Batter', x: 340, y: 330, team: 'IND' },
    { id: 3, name: 'Suryakumar Yadav', short: 'Surya', initials: 'SY', role: 'Batter', x: 580, y: 100, team: 'IND' },
    { id: 4, name: 'Hardik Pandya', short: 'Hardik', initials: 'HP', role: 'All-rounder', x: 580, y: 340, team: 'IND' },
    { id: 5, name: 'Ravindra Jadeja', short: 'Jadeja', initials: 'RJ', role: 'All-rounder', x: 800, y: 220, team: 'IND' }
  ];

  // Undirected Weighted Partnership Graph
  const partnerships = [
    { a: 0, b: 1, runs: 38 },
    { a: 0, b: 2, runs: 30 },
    { a: 0, b: 3, runs: 14 },
    { a: 1, b: 5, runs: 20 },
    { a: 2, b: 4, runs: 45 },
    { a: 3, b: 4, runs: 22 },
    { a: 4, b: 5, runs: 34 }
  ];

  const demoAccounts = [
    { user: 'rohit', password: 'coverdrive', role: 'player', name: 'Rohit Sharma' },
    { user: 'fan', password: 'fanpass', role: 'fan', name: 'Aarav Mehta' },
    { user: 'fan2', password: 'fanpass', role: 'fan', name: 'Riya Sen' }
  ];

  return {
    score: 161,
    wickets: 3,
    oversCompleted: 12.0,
    currentOver: 12,
    target: 211,
    opponent: {
      team: 'AUS',
      score: 210,
      wickets: 7,
      overs: 20.0
    },
    overs,
    oversDetailed,
    players,
    partnerships,
    initialNote: 'Play straight early; accelerate after the powerplay.',
    demoAccounts
  };
}

const defaultMatch = sampleMatch();

module.exports = {
  sampleMatch,
  overs: defaultMatch.overs,
  oversDetailed: defaultMatch.oversDetailed,
  players: defaultMatch.players,
  partnerships: defaultMatch.partnerships,
  initialNote: defaultMatch.initialNote,
  demoAccounts: defaultMatch.demoAccounts
};
