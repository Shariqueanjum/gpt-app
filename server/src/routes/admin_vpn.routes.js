const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { getVPNStatsForAdmin } = require('../repositories/vpn.repository');

router.use(adminAuthMiddleware);

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getVPNStatsForAdmin();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;