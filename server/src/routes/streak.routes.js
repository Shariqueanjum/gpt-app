const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { checkIn, getStatus } = require('../controllers/streak.controller');

router.use(authMiddleware);

router.post('/check-in', checkIn);
router.get('/status', getStatus);

module.exports = router;