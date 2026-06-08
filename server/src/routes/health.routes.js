const express = require('express');
const router = express.Router();
const { root, healthCheck } = require('../controllers/health.controller');

router.get('/', root);
router.get('/health', healthCheck);

module.exports = router;