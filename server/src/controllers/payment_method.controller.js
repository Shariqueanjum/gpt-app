const { getPaymentMethods, seedDefaultMethods } = require('../services/payment_method.service');

const listPaymentMethods = async (req, res, next) => {
  try {
    const methods = await getPaymentMethods();
    
    res.json({
      success: true,
      data: methods
    });
  } catch (err) {
    next(err);
  }
};

const seedMethods = async (req, res, next) => {
  try {
    const seedSecret = req.headers['x-seed-secret'];
    if (seedSecret !== process.env.SEED_SECRET) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    const result = await seedDefaultMethods();
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPaymentMethods, seedMethods };