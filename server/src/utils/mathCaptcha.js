const crypto = require('crypto');

// ------------------------------------------------------------------
// Simple math CAPTCHA for the login page (e.g. "7 + 3 = ?").
//
// Stateless + tamper-proof: the server never sends the answer. It sends
// a signed token  `nonce.expiry.signature`  where the signature is an
// HMAC over (nonce, expiry, correct answer). On login we recompute the
// HMAC using the answer the user typed — if it matches, the answer was
// right. A token can only be used once and expires after 5 minutes.
// ------------------------------------------------------------------
const TTL_MS = 5 * 60 * 1000;
const usedNonces = new Map(); // nonce -> expiry (cleaned up lazily)

const secret = () => {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error('JWT_SECRET not configured');
  return key;
};

const sign = (nonce, expiry, answer) =>
  crypto.createHmac('sha256', secret()).update(`${nonce}.${expiry}.${answer}`).digest('hex');

const cleanupUsed = () => {
  const now = Date.now();
  for (const [nonce, expiry] of usedNonces) {
    if (expiry < now) usedNonces.delete(nonce);
  }
};

const randInt = (min, max) => crypto.randomInt(min, max + 1);

const generateMathChallenge = () => {
  const isPlus = randInt(0, 1) === 0;
  let a = randInt(1, 9);
  let b = randInt(1, 9);
  if (!isPlus && b > a) [a, b] = [b, a]; // keep subtraction answers >= 0
  const answer = isPlus ? a + b : a - b;

  const nonce = crypto.randomBytes(8).toString('hex');
  const expiry = Date.now() + TTL_MS;

  return {
    question: `${a} ${isPlus ? '+' : '-'} ${b}`,
    token: `${nonce}.${expiry}.${sign(nonce, expiry, answer)}`
  };
};

const fail = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const verifyMathChallenge = (token, answer) => {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw fail('Security check failed. Please try again.');

  const [nonce, expiryStr, signature] = parts;
  const expiry = Number(expiryStr);

  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    throw fail('Security check expired. Please try again.');
  }

  cleanupUsed();
  if (usedNonces.has(nonce)) throw fail('Security check already used. Please try again.');

  const cleanAnswer = String(answer ?? '').trim();
  if (!/^-?\d+$/.test(cleanAnswer)) throw fail('Incorrect answer. Please try again.');

  const expected = Buffer.from(sign(nonce, expiry, Number(cleanAnswer)), 'hex');
  const received = Buffer.from(signature, 'hex');

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw fail('Incorrect answer. Please try again.');
  }

  usedNonces.set(nonce, expiry); // one-time use
  return true;
};

module.exports = { generateMathChallenge, verifyMathChallenge };
