const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { checkUser, getDashboard } = require('../controllers/fraud.controller');

router.use(adminAuthMiddleware);

router.get('/dashboard', getDashboard);
router.get('/check/:userId', checkUser);

module.exports = router;