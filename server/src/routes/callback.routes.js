const express = require('express');
const router = express.Router();
const { handleS2S, handleBrowser } = require('../controllers/callback.controller');

// S2S — no auth, called by offer wall servers
router.post('/:internal_id', handleS2S);

// Browser redirect — no auth, called by user's browser from offer wall
router.get('/:internal_id/browser/:status', handleBrowser);

module.exports = router;