const { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, forgotUsername } = require('../services/auth.service');
const { generateToken } = require('../utils/jwt');
const pool = require('../config/db');
const { generateMathChallenge } = require('../utils/mathCaptcha');
const { logger } = require('../utils/logger');

// Username the person chose on the register form (cut to 40 characters for the log line)
const regUsername = (req) => String(req.body?.username ?? '').slice(0, 40) || null;

const register = async (req, res, next) => {
  const started = Date.now();
  try {
    const result = await registerUser(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      req: req
    });

    (req.log || logger).info({ event: 'register_success', username: regUsername(req),  total_ms: Date.now() - started }, 'Registration submitted');

    res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    (req.log || logger).info({ event: 'register_failed', username: regUsername(req), reason: err.message, status: err.status || 500, total_ms: Date.now() - started }, 'Registration failed');
    next(err);
  }
};

const login = async (req, res, next) => {
  const started = Date.now();
  try {
    const result = await loginUser(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      req: req
    });

    (req.log || logger).info({ event: 'login_success', username: result.user?.username ?? null, user_id: result.user?.id ?? null, total_ms: Date.now() - started, ...(req.timings || {}) }, 'Login successful');

    res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    (req.log || logger).info({ event: 'login_failed', username: req.logUser?.username ?? null, user_id: req.logUser?.id ?? null, reason: err.message, status: err.status || 500, total_ms: Date.now() - started, ...(req.timings || {}) }, 'Login failed');
    next(err);
  }
};

const getLoginChallenge = (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: generateMathChallenge() });
  } catch (err) {
    next(err);
  }
};

const verifyEmailByToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_token`);
    }

    // Pass meta for logging
    await verifyEmail(token, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      req: req
    });

    //  Success → Go to frontend login page
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=true`);

  } catch (err) {
    //  Failed → Go to frontend login with error
    console.log(err);
    const errorMsg = encodeURIComponent(err.message);
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=${errorMsg}`);
  }
};

const forgotPasswordRequest = async (req, res, next) => {
  try {
    const { email_or_username } = req.body;
    const result = await forgotPassword(email_or_username);

    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

const resetPasswordConfirm = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    const result = await resetPassword(token, new_password);

    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

const forgotUsernameRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotUsername(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};



module.exports = { register, login, getLoginChallenge, verifyEmailByToken, forgotPasswordRequest, resetPasswordConfirm, forgotUsernameRequest };