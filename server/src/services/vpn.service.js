const { getSettingByKey } = require('../repositories/settings.repository');

const checkVPN = async (ip) => {
  const enabled = await getSettingByKey('vpn_detection_enabled');
  if (enabled !== 'true') {
    return null; // Detection disabled
  }

  try {
    // Using proxycheck.io (free tier: 1000/day)
    const response = await fetch(`https://proxycheck.io/v2/${ip}?vpn=1&proxy=1&asn=1`);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error('VPN check service error');
    }

    const ipData = data[ip];
    
    return {
      is_vpn: ipData.vpn === 'yes',
      is_proxy: ipData.proxy === 'yes',
      is_tor: ipData.type === 'Tor',
      provider: ipData.provider || null,
      country: ipData.isocode || null,
      risk_score: parseInt(ipData.risk) || 0,
      raw_response: ipData
    };

  } catch (err) {
    console.error(`[VPNCheck] Failed for IP ${ip}:`, err.message);
    // Return safe default — don't block user if service fails
    return {
      is_vpn: false,
      is_proxy: false,
      is_tor: false,
      provider: null,
      country: null,
      risk_score: 0,
      raw_response: { error: err.message },
      check_failed: true
    };
  }
};

module.exports = { checkVPN };