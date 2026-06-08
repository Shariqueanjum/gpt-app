const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { listAnnouncements, markAsRead, hideAnnouncement } = require('../controllers/announcement.controller');

router.use(authMiddleware);

router.get('/', listAnnouncements);
router.put('/:id/read', markAsRead);
router.delete('/:id', hideAnnouncement);

module.exports = router;