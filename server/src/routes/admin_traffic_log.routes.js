const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { listTrafficLogs, getDashboardStats } = require('../controllers/traffic_log.controller');
const { trafficLogQuerySchema } = require('../validators/traffic_log.validator');

router.use(adminAuthMiddleware);

router.get('/', validate(trafficLogQuerySchema, 'query'), listTrafficLogs);
router.get('/stats', getDashboardStats);

module.exports = router;