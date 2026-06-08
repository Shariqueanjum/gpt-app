const {
  findUsersByDeviceFingerprint,
  findUsersByPaymentDetail,
  findReferralDepth,
  findRapidRegistrations,
  findSurveyCompletionTimes,
  findAllUsersForFraudScan,
  getLatestDeviceFingerprint,
  getLatestIP
} = require('../repositories/fraud.repository');
const { findUserById } = require('../repositories/user.repository');

const FRAUD_WEIGHTS = {
  DEVICE_FINGERPRINT: 25,
  PAYMENT_DETAILS: 20,
  REFERRAL_DEPTH: 15,
  SURVEY_TIME: 15,
  RAPID_REGISTRATION: 15
};

const calculateFraudScore = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let score = 0;
  const flags = [];

  // 1. Device fingerprint check
  const latestFingerprint = await getLatestDeviceFingerprint(userId);
  if (latestFingerprint) {
    const deviceUsers = await findUsersByDeviceFingerprint(latestFingerprint, userId);
    
    if (deviceUsers.length >= 3) {
      score += FRAUD_WEIGHTS.DEVICE_FINGERPRINT;
      flags.push({
        type: 'device_fingerprint',
        severity: 'high',
        message: `${deviceUsers.length} accounts share same device fingerprint`,
        details: deviceUsers.map(u => ({ id: u.id, username: u.username }))
      });
    } else if (deviceUsers.length >= 2) {
      score += 10;
      flags.push({
        type: 'device_fingerprint',
        severity: 'medium',
        message: `${deviceUsers.length} accounts share same device fingerprint`,
        details: deviceUsers.map(u => ({ id: u.id, username: u.username }))
      });
    }
  }

  // 2. Payment details check
  const paymentChecks = [
    { field: 'upi_id', value: user.upi_id },
    { field: 'bank_account', value: user.bank_account },
    { field: 'paypal_email', value: user.paypal_email }
  ];

  for (const check of paymentChecks) {
    if (!check.value) continue;
    
    const matches = await findUsersByPaymentDetail(check.field, check.value, userId);
    if (matches.length >= 1) {
      score += FRAUD_WEIGHTS.PAYMENT_DETAILS;
      flags.push({
        type: 'payment_details',
        severity: 'high',
        message: `Same ${check.field} used by ${matches.length + 1} accounts`,
        field: check.field,
        details: matches.map(u => ({ id: u.id, username: u.username }))
      });
      break;
    }
  }

  // 3. Referral depth check
  const depth = await findReferralDepth(userId);
  if (depth > 5) {
    score += FRAUD_WEIGHTS.REFERRAL_DEPTH;
    flags.push({
      type: 'referral_depth',
      severity: 'medium',
      message: `Referral tree depth: ${depth} levels`,
      depth
    });
  }

  // 4. Survey completion time check
  const completions = await findSurveyCompletionTimes(userId);
  const suspiciousCompletions = completions.filter(c => {
    if (!c.loi || c.loi <= 0) return false;
    const minExpected = c.loi * 0.2;
    return c.minutes_spent < minExpected;
  });

  if (suspiciousCompletions.length > 0) {
    score += FRAUD_WEIGHTS.SURVEY_TIME;
    flags.push({
      type: 'survey_time',
      severity: 'high',
      message: `${suspiciousCompletions.length} surveys completed impossibly fast`,
      details: suspiciousCompletions.map(c => ({
        click_id: c.id,
        loi: c.loi,
        minutes_spent: parseFloat(c.minutes_spent.toFixed(2))
      }))
    });
  }

  // 5. Rapid registration check
  const latestIP = await getLatestIP(userId);
  if (latestFingerprint && latestIP) {
    const rapidCount = await findRapidRegistrations(latestIP, latestFingerprint, 1);
    if (rapidCount >= 3) {
      score += FRAUD_WEIGHTS.RAPID_REGISTRATION;
      flags.push({
        type: 'rapid_registration',
        severity: 'high',
        message: `${rapidCount} accounts registered within 1 minute from same IP+device`,
        count: rapidCount
      });
    }
  }

  score = Math.min(score, 100);

  return {
    user_id: userId,
    username: user.username,
    score,
    risk_level: getRiskLevel(score),
    flags,
    checked_at: new Date().toISOString()
  };
};

const getRiskLevel = (score) => {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
};

const getFraudDashboard = async (query = {}) => {
  const minScore = parseInt(query.min_score) || 0;
  const riskLevel = query.risk_level || null;
  
  const users = await findAllUsersForFraudScan(1000, 0);
  
  const results = [];
  for (const user of users) {
    const scoreData = await calculateFraudScore(user.id);
    
    if (scoreData.score >= minScore) {
      if (!riskLevel || scoreData.risk_level === riskLevel) {
        results.push(scoreData);
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    data: results,
    meta: {
      total_scanned: users.length,
      flagged_count: results.length,
      checked_at: new Date().toISOString()
    }
  };
};

module.exports = {
  calculateFraudScore,
  getFraudDashboard
};