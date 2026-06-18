const crypto = require('crypto');
const { createSurveyClick } = require('../repositories/survey_click.repository');
const { findById } = require('../repositories/offer_wall.repository');
const { findUserById } = require('../repositories/user.repository');

const generateTransactionId = (publicId) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TXN-${publicId}-${timestamp}-${random}`;
};

/**
 * Resolves a single url_param entry against user + transactionId.
 *
 * Supported sources:
 *   "transaction_id"         → the generated TXN-... id
 *   "user.public_id"         → user.public_id
 *   "user.username"          → user.username
 *   "user.email"             → user.email
 *   "user.country"           → user.country
 *   "user.gender"            → user.gender
 *   "user.dob"               → user.dob (ISO string)
 *   "user.full_name"         → user.full_name
 *   "user.phone"             → user.phone
 *   "user.referral_code"     → user.referral_code
 *   "user.level_id"          → user.level_id
 *   "static"                 → the literal value field
 */

const resolveParamValue = (source, value, user, transactionId) => {
  switch (source) {
    case 'transaction_id':    return transactionId;
    case 'user.public_id':    return user.public_id  || '';
    case 'user.username':     return user.username   || '';
    case 'user.email':        return user.email      || '';
    case 'user.country':      return user.country    || '';
    case 'user.gender':       return user.gender     || '';
    case 'user.dob':          return user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
    case 'user.full_name':    return user.full_name  || '';
    case 'user.phone':        return user.phone      || '';
    case 'user.referral_code':return user.referral_code || '';
    case 'user.level_id':     return String(user.level_id || 1);
    case 'static':            return value || '';
    default:                  return '';
  }
};

/**
 * Build entry URL from callback_config.url_params array.
 *
 * callback_config.url_params = [
 *   { param: "uid",       source: "user.public_id" },
 *   { param: "txn",       source: "transaction_id" },
 *   { param: "gender",    source: "user.gender" },
 *   { param: "country",   source: "user.country" },
 *   { param: "app_name",  source: "static", value: "MySurveyApp" }
 * ]
 *
 * Falls back to legacy ?user_id=&transaction_id= when url_params not configured.
 */

// const buildRedirectUrl = (baseUrl, publicId, transactionId) => {
//   const separator = baseUrl.includes('?') ? '&' : '?';
//   return `${baseUrl}${separator}user_id=${encodeURIComponent(publicId)}&transaction_id=${encodeURIComponent(transactionId)}`;
// };

const buildEntryUrl = (baseUrl, user, transactionId, callbackConfig) => {
  const urlParams = callbackConfig?.url_params;

  const separator = baseUrl.includes('?') ? '&' : '?';

  if (!urlParams || !Array.isArray(urlParams) || urlParams.length === 0) {
    // Legacy fallback — keeps existing integrations working
    return `${baseUrl}${separator}user_id=${encodeURIComponent(user.public_id)}&transaction_id=${encodeURIComponent(transactionId)}`;
  }

  const parts = urlParams.map(({ param, source, value }) => {
    const resolved = resolveParamValue(source, value, user, transactionId);
    return `${encodeURIComponent(param)}=${encodeURIComponent(resolved)}`;
  });

  return `${baseUrl}${separator}${parts.join('&')}`;
};


const createSurveyClickRecord = async (userId, payload) => {
  const user = await findUserById(userId);
  
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('Account is disabled. Contact support.');
    error.status = 403;
    throw error;
  }

  const wall = await findById(payload.offer_wall_id);
  
  if (!wall) {
    const error = new Error('Offer wall not found or inactive');
    error.status = 404;
    throw error;
  }

  // API type requires survey details at click time
  if (wall.type === 'api' && (!payload.survey_id || !payload.cpa)) {
    const error = new Error('survey_id and cpa are required for API-type offer walls');
    error.status = 400;
    throw error;
  }

  const transactionId = generateTransactionId(user.public_id);
  
  // Calculate user payout after commission
  let cpaOriginal = null;
  let cpaUser = null;
  
  if (payload.cpa) {
    cpaOriginal = parseFloat(payload.cpa);
    const commissionRate = parseFloat(wall.commission_rate);
    cpaUser = parseFloat((cpaOriginal * (100 - commissionRate) / 100).toFixed(2));
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const click = await createSurveyClick(null, {
    user_id: userId,
    offer_wall_id: wall.id,
    transaction_id: transactionId,
    integration_type: wall.type,
    survey_id: payload.survey_id || null,
    survey_name: payload.survey_name || null,
    loi: payload.loi || null,
    country: user.country || null,
    cpa_original: cpaOriginal,
    cpa_user: cpaUser,
    commission_rate: wall.commission_rate,
    status: 'pending',
    expires_at: expiresAt
  });

  const callbackConfig = wall.callback_config || {};

  // Build return URL based on type
  let result = {
    transaction_id: transactionId,
    type: wall.type,
    status: 'pending'
  };

  if (wall.type === 'api' || wall.type === 'router') {
    result.redirect_url = buildEntryUrl(wall.endpoint_url, user, transactionId, callbackConfig);
  } else if (wall.type === 'iframe') {
    result.iframe_src = buildEntryUrl(wall.iframe_url, user, transactionId, callbackConfig);
  }

  return { click: result };
};

module.exports = { createSurveyClickRecord, buildEntryUrl,resolveParamValue };