const crypto = require('crypto');

const verifyCallbackHash = (params, hashAlgorithm, hashKey, hashFields) => {
  // No hash configured — skip verification (safe for providers without signatures)
  if (!hashAlgorithm || !hashKey) {
    return { valid: true, skipped: true };
  }

  // Extract signature from common field names
  const signature = params.signature || params.hash || params.sig || params.h;
  if (!signature) {
    return { valid: false, reason: 'Missing signature field' };
  }

  // Build string to hash from specified fields
  const values = hashFields.map(field => (params[field] || '').toString()).join('');
  
  let expected;
  
  switch (hashAlgorithm.toLowerCase()) {
    case 'sha256':
      expected = crypto.createHmac('sha256', hashKey).update(values).digest('hex');
      break;
    case 'md5':
      expected = crypto.createHash('md5').update(values + hashKey).digest('hex');
      break;
    default:
      return { valid: false, reason: `Unsupported hash algorithm: ${hashAlgorithm}` };
  }

  const normalizedSig = signature.toLowerCase();
  const normalizedExpected = expected.toLowerCase();

  return {
    valid: normalizedSig === normalizedExpected,
    skipped: false,
    reason: normalizedSig === normalizedExpected ? undefined : 'Signature mismatch'
  };
};

module.exports = { verifyCallbackHash };