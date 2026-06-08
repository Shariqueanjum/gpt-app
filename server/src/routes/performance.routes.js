const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { getPerformance } = require('../controllers/performance.controller');

router.use(authMiddleware);
router.get('/', getPerformance);

module.exports = router;