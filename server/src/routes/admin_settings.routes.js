const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateAdminSettings } = require('../controllers/settings.controller');
const { updateSettingsSchema } = require('../validators/settings.validator');

router.use(adminAuthMiddleware);
router.put('/', validate(updateSettingsSchema), updateAdminSettings);

module.exports = router;