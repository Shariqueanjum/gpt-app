const express = require('express');
const router = express.Router();
const { register, login, verifyEmailByToken, forgotPasswordRequest, resetPasswordConfirm, forgotUsernameRequest } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, forgotUsernameSchema } = require('../validators/auth.validator');


router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/verify-email', verifyEmailByToken);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordRequest);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordConfirm);
router.post('/forgot-username', validate(forgotUsernameSchema), forgotUsernameRequest);

module.exports = router;