const express = require('express');
const router = express.Router();
const { handleS2S, handleBrowser } = require('../controllers/callback.controller');

// S2S — no auth, called by offer wall servers
// Some providers (SurveyDekho and others) send postbacks as GET with query params,
// others send POST. handleS2S already merges { ...req.query, ...req.body }, so both work.

router.post('/:internal_id', handleS2S);
router.get('/:internal_id', handleS2S);

// Browser redirect — no auth, called by user's browser from offer wall
router.get('/:internal_id/browser/:status', handleBrowser);

module.exports = router;