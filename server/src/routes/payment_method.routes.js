const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { listPaymentMethods, seedMethods } = require('../controllers/payment_method.controller');

// User route — needs auth
router.get('/', authMiddleware, listPaymentMethods);

// Seed route — protected by secret
router.post('/seed', seedMethods);

module.exports = router;