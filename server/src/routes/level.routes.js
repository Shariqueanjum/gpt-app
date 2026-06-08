const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { upgradeLevel, getProgress } = require('../controllers/level.controller');

router.use(authMiddleware);

router.post('/upgrade', upgradeLevel);
router.get('/progress', getProgress);

module.exports = router;