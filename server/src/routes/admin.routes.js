const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { adminLogin, adminMe } = require('../controllers/admin.controller');
const { adminLoginSchema } = require('../validators/admin.validator');

router.post('/login', validate(adminLoginSchema), adminLogin);
router.get('/me', adminAuthMiddleware, adminMe);

module.exports = router;