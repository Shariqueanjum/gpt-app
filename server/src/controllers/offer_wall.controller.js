const { getActiveOfferWalls, getOfferWallByInternalId, seedAll } = require('../services/offer_wall.service');

const listOfferWalls = async (req, res, next) => {
  try {
    const walls = await getActiveOfferWalls();
    
    res.json({
      success: true,
      data: walls
    });
  } catch (err) {
    next(err);
  }
};

const getSurveys = async (req, res, next) => {
  try {
    const { internal_id } = req.params;
    const wall = await getOfferWallByInternalId(internal_id);

    // Only API-type walls support pre-fetching survey lists
    if (wall.type !== 'api') {
      const error = new Error('This offer wall does not support survey listing');
      error.status = 400;
      throw error;
    }

    // MOCK: Replace with real HTTP call when credentials available
    // Real implementation will call wall.endpoint_url with user demographics
    const mockSurveys = [
      {
        survey_id: 'TLU789',
        survey_name: 'Mobile Gaming Survey',
        loi: 10,
        cpa: 200,
        category: 'Gaming',
        country: 'IN'
      },
      {
        survey_id: 'TLU790',
        survey_name: 'Consumer Insights',
        loi: 15,
        cpa: 350,
        category: 'Retail',
        country: 'IN'
      }
    ];

    res.json({
      success: true,
      data: {
        offer_wall: {
          id: wall.id,
          name: wall.name,
          internal_id: wall.internal_id
        },
        surveys: mockSurveys
      }
    });
  } catch (err) {
    next(err);
  }
};

const seedDatabase = async (req, res, next) => {
  try {
    // Simple protection: check x-seed-secret header
    const seedSecret = req.headers['x-seed-secret'];
    if (seedSecret !== process.env.SEED_SECRET) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    const result = await seedAll();
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOfferWalls,
  getSurveys,
  seedDatabase
};