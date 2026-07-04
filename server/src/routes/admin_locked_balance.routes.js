const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { getLockedSurveys, getSurveyHistory, unlockSurvey, reverseSurvey } = require('../controllers/admin_locked_balance.controller');

// All routes require admin authentication
router.use(adminAuthMiddleware);

// GET /api/admin/locked-balance — List all locked surveys
router.get('/', getLockedSurveys);

// GET /api/admin/locked-balance/history — List all survey history (completed + locked)
router.get('/history', getSurveyHistory);

// POST /api/admin/locked-balance/:id/unlock — Unlock a locked survey
router.post('/:id/unlock', unlockSurvey);

// POST /api/admin/locked-balance/:id/reverse — Reverse a locked survey
router.post('/:id/reverse', reverseSurvey);

module.exports = router;