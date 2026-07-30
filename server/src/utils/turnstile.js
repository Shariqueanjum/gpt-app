const verifyTurnstileToken = async (token, remoteip) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Turnstile secret key not configured');
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteip) {
    formData.append('remoteip', remoteip);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const data = await response.json();

  if (!data.success) {
    const error = new Error('CAPTCHA verification failed. Please try again.');
    error.status = 400;
    throw error;
  }

  return true;
};

module.exports = { verifyTurnstileToken };