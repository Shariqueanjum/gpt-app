const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { 
  createAnnouncement, 
  listAnnouncementsAdmin,
  toggleAnnouncement 
} = require('../controllers/announcement.controller');
const { createAnnouncementSchema } = require('../validators/announcement.validator');

router.use(adminAuthMiddleware);

router.post('/', validate(createAnnouncementSchema), createAnnouncement);
router.get('/', listAnnouncementsAdmin);
router.put('/:id/toggle', toggleAnnouncement);

module.exports = router;