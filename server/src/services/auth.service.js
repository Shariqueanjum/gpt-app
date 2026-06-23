const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const pool = require('../config/db');
const {generateToken} = require('../utils/jwt');
const { generateDeviceFingerprint } = require('../utils/device');
const {sendVerificationEmail, sendPasswordResetEmail, sendForgotUsernameEmail} = require('../utils/email')
const { createPending, findByToken, findByEmail, deleteByEmail } = require('../repositories/pending_registration.repository');
const {findByEmailOrUsername, findByReferralCode, findUserByEmail, findUserByUsername, createUser, findUserById} = require('../repositories/user.repository');
const { emitActivity } = require('./activityEmitter.service');
const {createLoginHistory} = require('../repositories/login_history.repository');
const { processDailyStreak } = require('./streak.service');
const { createPasswordReset, findPasswordResetByToken, markPasswordResetUsed, deleteOldPasswordResets } = require('../repositories/password_reset.repository');
const { checkVPN } = require('./vpn.service');
const { createVPNCheck } = require('../repositories/vpn.repository');

const { v4: uuidv4 } = require('uuid');

const generatePublicId = () => {
  return 'WABC-' + uuidv4().slice(0, 8);
};

const generateReferralCode = (username) => {
  return username.toLowerCase() + Math.floor(1000 + Math.random() * 9000);
};

const getCountryFromIP = (ip) => {
  if (ip === '::1' || ip === '127.0.0.1') {
    return 'Unknown';
  }
  const geo = geoip.lookup(ip);
  return geo?.country || 'Unknown';
};

const findUserByEmailOrUsername = async (identifier) => {
  const trimmed = identifier.trim();
  
  if (trimmed.includes('@')) {
    // It's an email
    return await findUserByEmail(trimmed.toLowerCase());
  } else {
    // It's a username
    return await findUserByUsername(trimmed);
  }
};

const registerUser = async (payload, meta) => {
  let { username, email, password, referred_by_code } = payload;
  email = email.toLowerCase().trim();

  // Check if already registered
  const existingUser = await findByEmailOrUsername(email, username);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  // Check if pending exists (resend scenario)
  const existingPending = await findByEmail(email);
  if (existingPending) {
    // Delete old pending so they can re-register
    await deleteByEmail(email);
  }

  const password_hash = await bcrypt.hash(password, 10);

  // Referral handling
  let referrer_id = null;
  if (referred_by_code) {
    const ref = await findByReferralCode(referred_by_code);
    if (ref) referrer_id = ref.id;
  }

  const country = getCountryFromIP(meta.ip);

  const vpnData = await checkVPN(meta.ip);
  if (vpnData && (vpnData.is_vpn || vpnData.is_proxy || vpnData.is_tor)) {
    // Log but don't block — admin can review later
    await createVPNCheck(null, {
      user_id: null, // Will update after user creation
      ip_address: meta.ip,
      ...vpnData
    });
  }

  // Create verification token (24 hours)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store in pending_registrations
  await createPending({
    email,
    username,
    password_hash,
    referral_code: generateReferralCode(username),
    referred_by: referrer_id,
    country,
    verification_token: verificationToken,
    expires_at: expiresAt
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  return {
    message: 'Verification email sent! Please check your inbox to complete registration.'
  };
};

//  VERIFY EMAIL: Create actual user now
const verifyEmail = async (token, meta) => {
  const pending = await findByToken(token);

  if (!pending) {
    const error = new Error('Invalid or expired verification link');
    error.status = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create real user
    const user = await createUser(client, {
      public_id: generatePublicId(),
      username: pending.username,
      email: pending.email,
      password_hash: pending.password_hash,
      full_name: null,
      country: pending.country,
      referral_code: pending.referral_code,
      referred_by: pending.referred_by,
      is_verified: true  // Verified because they clicked the link
    });

    // Log the registration
    await createLoginHistory(client, {
      user_id: user.id,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      device_fingerprint: generateDeviceFingerprint(meta.req),
      status: 'success'
    });

    // Delete pending record
    await deleteByEmail(pending.email);

    await client.query('COMMIT');

     // Fire real-time live activity — new user just joined
    try {
      emitActivity({
        type:     'user_registered',
        username: user.username,
        country:  pending.country || 'Unknown',
      });
    } catch (_) {}

    return { message: 'Email verified successfully! You can now login.' };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const loginUser = async (payload, meta) => {
  let { email_or_username, password } = payload;
  const identifier = email_or_username.trim();

  const user = await findUserByEmailOrUsername(identifier);
  const deviceFingerprint = generateDeviceFingerprint(meta.req);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    await createLoginHistory(null, {
      user_id: user.id,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      device_fingerprint: deviceFingerprint,
      status: 'failed'
    });
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  if (!user.is_verified) {
    const error = new Error('Please verify your email before logging in');
    error.status = 401;
    throw error;
  }

  const vpnData = await checkVPN(meta.ip);
  if (vpnData && (vpnData.is_vpn || vpnData.is_proxy || vpnData.is_tor)) {
    await createVPNCheck(null, {
      user_id: user.id,
      ip_address: meta.ip,
      ...vpnData
    });
  }

  await createLoginHistory(null, {
    user_id: user.id,
    ip_address: meta.ip,
    user_agent: meta.userAgent,
    device_fingerprint: deviceFingerprint,
    status: 'success'
  });

  const token = generateToken(user);

  processDailyStreak(user.id).catch(err => {
    console.error(`[AutoStreak] User ${user.id}: ${err.message}`);
  });
  
  const safeUser = {
    id: user.id,
    public_id: user.public_id,
    username: user.username,
    email: user.email,
    country: user.country,
    is_verified: user.is_verified
  };

  return { user: safeUser, token };
};

const forgotPassword = async (identifier) => {
  const trimmed = identifier.trim();
  const user = await findUserByEmailOrUsername(trimmed); 

  if (!user) {
    const error = new Error('No account found with this email');
    error.status = 404;
    throw error;
  }
    const {email} = user;

  // Delete old reset tokens for this email
  await deleteOldPasswordResets(email);

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await createPasswordReset(null, {
    email,
    token: resetToken,
    expires_at: expiresAt
  });

  await sendPasswordResetEmail(email, resetToken);

  return {
    message: 'Password reset link sent to your email. It expires in 1 hour.'
  };
};

const resetPassword = async (token, newPassword) => {
  const resetRecord = await findPasswordResetByToken(token);

  if (!resetRecord) {
    const error = new Error('Invalid or expired reset token');
    error.status = 400;
    throw error;
  }

  const user = await findUserByEmail(resetRecord.email);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const newHash = await bcrypt.hash(newPassword, 10);

    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, user.id]
    );

    await markPasswordResetUsed(client, token);

    await client.query('COMMIT');

    return {
      message: 'Password reset successfully. You can now login with your new password.'
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const forgotUsername = async (email) => {
  const user = await findUserByEmail(email.toLowerCase().trim());
  
  if (!user) {
    const error = new Error('No account found with this email');
    error.status = 404;
    throw error;
  }

  await sendForgotUsernameEmail(email, user.username);

  return {
    message: 'Your username has been sent to your email.'
  };
};


module.exports = { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, forgotUsername};