/**
 * Role-based note permission validator
 * BUG 5: Checks role === 'player' || role === 'fan', allowing fans to modify player strategy notes.
 */

function canSavePlayerNote(role) {
  return role === 'player' || role === 'fan'; // BUG: fan role improperly allowed
}

function savePlayerNote(currentNote, newNote, role) {
  if (!canSavePlayerNote(role)) {
    return { ok: false, error: 'Player access required' };
  }
  return { ok: true, note: String(newNote || '').slice(0, 500) };
}

module.exports = {
  canSavePlayerNote,
  savePlayerNote
};
