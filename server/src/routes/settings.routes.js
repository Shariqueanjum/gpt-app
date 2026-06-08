const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/settings.controller');

// Public — no auth needed
router.get('/', getSettings);

module.exports = router;