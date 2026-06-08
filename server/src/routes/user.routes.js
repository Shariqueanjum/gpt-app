const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {getUser, updateUser, changeUserPassword} = require('../controllers/user.controller');
const {updateProfileSchema, changePasswordSchema} = require('../validators/user.validator');

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', getUser);
router.put('/profile', validate(updateProfileSchema), updateUser);
router.post('/change-password', validate(changePasswordSchema), changeUserPassword);

module.exports = router;