const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { getReferrals } = require('../controllers/referral.controller');

router.use(authMiddleware);
router.get('/', getReferrals);

module.exports = router;