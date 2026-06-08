const { seedAdmin } = require('../services/admin_seed.service');

const createAdmin = async (req, res, next) => {
  try {
    const seedSecret = req.headers['x-seed-secret'];
    if (seedSecret !== process.env.SEED_SECRET) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    // Pass body only if it has data, otherwise null (uses DEFAULT_ADMIN)
    const hasBodyData = req.body && Object.keys(req.body).length > 0;
    const result = await seedAdmin(hasBodyData ? req.body : null);

    const statusCode = result.already_exists ? 200 : 201;
    
    res.status(statusCode).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAdmin };