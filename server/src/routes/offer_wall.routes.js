const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { listOfferWalls, getSurveys, seedDatabase } = require('../controllers/offer_wall.controller');
const { getEntryUrl } = require('../controllers/offer_wall_entry.controller');

// Public/Protected routes
router.get('/', authMiddleware, listOfferWalls);
router.get('/:internal_id/surveys', authMiddleware, getSurveys);

// NEW: Entry URL for iframe/router walls — creates click + returns URL
router.post('/:internal_id/entry', authMiddleware, getEntryUrl);

// One-time setup route (protected by seed secret)
router.post('/seed', seedDatabase);

module.exports = router;