const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { getMeta, getTrend, getBreakdown } = require('../controllers/admin_revenue.controller');
const { breakdownQuerySchema, trendQuerySchema } = require('../validators/admin_revenue.validator');

// Every revenue / profit number is admin-only
router.use(adminAuthMiddleware);

router.get('/meta', getMeta);
router.get('/trend', validate(trendQuerySchema, 'query'), getTrend);
router.get('/breakdown', validate(breakdownQuerySchema, 'query'), getBreakdown);

module.exports = router;
