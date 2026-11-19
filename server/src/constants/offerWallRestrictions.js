const { LEVEL_CONFIG } = require('./levelConfig');

// ------------------------------------------------------------------
// Offer wall access restrictions (by offer wall internal_id).
//
// A client can ask us to keep their wall closed until a user has
// completed N surveys. We don't hardcode a level number here — we find
// the first level in LEVEL_CONFIG that needs at least N surveys, so if
// LEVEL_CONFIG ever changes the restriction follows it automatically.
//
//   cpxresearch / cpx_research -> 5 surveys -> Level 2 (see levelConfig.js)
// ------------------------------------------------------------------
const WALL_MIN_SURVEYS = Object.freeze({
  cpxresearch: 5,   // internal ID used in the admin panel
  cpx_research: 5   // internal ID created by the seed script
});

const getWallRestriction = (internalId) => {
  const minSurveys = WALL_MIN_SURVEYS[String(internalId || '').toLowerCase()];
  if (!minSurveys) return null;

  const levelConfig = LEVEL_CONFIG.find(l => l.surveys_required >= minSurveys);
  if (!levelConfig) return null;

  return {
    min_level: levelConfig.level,
    required_surveys: levelConfig.surveys_required
  };
};

const isWallLockedForUser = (wall, user) => {
  const restriction = getWallRestriction(wall?.internal_id);
  if (!restriction) return false;
  return (user?.level || 1) < restriction.min_level;
};

// Throws a 403 if this user hasn't reached the level the wall needs.
const assertWallUnlocked = (wall, user) => {
  if (!isWallLockedForUser(wall, user)) return;

  const { min_level, required_surveys } = getWallRestriction(wall.internal_id);
  const error = new Error(
    `${wall.name} unlocks at Level ${min_level}. Complete ${required_surveys} surveys to unlock it.`
  );
  error.status = 403;
  throw error;
};

module.exports = { getWallRestriction, isWallLockedForUser, assertWallUnlocked };
