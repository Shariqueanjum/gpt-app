const { findActiveOfferWalls, findByInternalId, seedOfferWalls } = require('../repositories/offer_wall.repository');
const { seedSettings } = require('./settings.service');

const getActiveOfferWalls = async () => {
  const walls = await findActiveOfferWalls();
  
  // Return only what frontend needs. Hide hash_key and raw callback_config.
  return walls.map(wall => ({
    id: wall.id,
    name: wall.name,
    internal_id: wall.internal_id,
    type: wall.type,
    commission_rate: wall.commission_rate,
    // For API type: frontend will call /api/offer-walls/:internal_id/surveys
    // For Router/iFrame: frontend will call POST /api/survey-clicks directly
    has_survey_list: wall.type === 'api'
  }));
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