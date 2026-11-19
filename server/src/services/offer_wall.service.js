const { findActiveOfferWalls, findByInternalId, seedOfferWalls } = require('../repositories/offer_wall.repository');
const { seedSettings } = require('./settings.service');
const { findUserById } = require('../repositories/user.repository');
const { getWallRestriction, isWallLockedForUser } = require('../constants/offerWallRestrictions');

const getActiveOfferWalls = async (userId = null) => {
  const walls = await findActiveOfferWalls();
  const user = userId ? await findUserById(userId) : null;
  
  // Return only what frontend needs. Hide hash_key and raw callback_config.
  return walls.map(wall => {
    const restriction = getWallRestriction(wall.internal_id);
    return {
      id: wall.id,
      name: wall.name,
      internal_id: wall.internal_id,
      type: wall.type,
      commission_rate: wall.commission_rate,
      logo_url: wall.logo_url || null,
      // For API type: frontend will call /api/offer-walls/:internal_id/surveys
      // For Router/iFrame: frontend will call POST /api/survey-clicks directly
      has_survey_list: wall.type === 'api',
      // Level gate (null / false for walls with no restriction)
      min_level: restriction ? restriction.min_level : null,
      required_surveys: restriction ? restriction.required_surveys : null,
      is_locked: restriction ? isWallLockedForUser(wall, user) : false
    };
  });
};

const getOfferWallByInternalId = async (internalId) => {
  const wall = await findByInternalId(internalId);
  
  if (!wall) {
    const error = new Error('Offer wall not found');
    error.status = 404;
    throw error;
  }

  return wall;
};

const seedAll = async () => {
  await seedSettings();
  await seedOfferWalls();
  return { message: 'Settings and offer walls seeded successfully' };
};

module.exports = {
  getActiveOfferWalls,
  getOfferWallByInternalId,
  seedAll
};