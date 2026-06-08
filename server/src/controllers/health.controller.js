const pool = require('../config/db');

const root = (req, res) => {
  res.json({ message: 'Server is running!' });
};

const healthCheck = async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'OK',
      timestamp: result.rows[0].now,
      database: 'Connected'
    });

  } catch (err) {
     next(err);
  }
};

module.exports = { root, healthCheck };