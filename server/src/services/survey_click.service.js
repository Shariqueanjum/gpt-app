const crypto = require('crypto');
const { createSurveyClick } = require('../repositories/survey_click.repository');
const { findById } = require('../repositories/offer_wall.repository');
const { findUserById } = require('../repositories/user.repository');

const generateTransactionId = (publicId) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TXN-${publicId}-${timestamp}-${random}`;
};

const buildRedirectUrl = (baseUrl, publicId, transactionId) => {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}user_id=${encodeURIComponent(publicId)}&transaction_id=${encodeURIComponent(transactionId)}`;
};

const createSurveyClickRecord = async (userId, payload) => {
  const user = await findUserById(userId);
  console.log("i am inside create surveyclik service");
  
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

  // Build return URL based on type
  let result = {
    transaction_id: transactionId,
    type: wall.type,
    status: 'pending'
  };

  if (wall.type === 'api' || wall.type === 'router') {
    const baseUrl = wall.endpoint_url;
    result.redirect_url = buildRedirectUrl(baseUrl, user.public_id, transactionId);
  } else if (wall.type === 'iframe') {
    const baseUrl = wall.iframe_url;
    result.iframe_src = buildRedirectUrl(baseUrl, user.public_id, transactionId);
  }

  return { click: result };
};

module.exports = { createSurveyClickRecord };