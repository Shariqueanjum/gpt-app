const { executeQuery, executeCount } = require('../repositories/login_history.repository');
const { buildSelectQuery, buildCountQuery } = require('../utils/queryBuilder');
const geoip = require('geoip-lite');


// ---- Display helpers (login history screen only; unrelated to device fingerprinting) ----
 
// "Mozilla/5.0 (Windows NT 10.0...) Chrome/124..." -> "Chrome on Windows"
const parseUserAgent = (ua) => {
  if (!ua || typeof ua !== 'string') return null;
 
  let os = null;
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
 
  let browser = null;
  if (/Edg(e|A|iOS)?\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Firefox\/|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Chrome\/|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  else if (/MSIE |Trident\//i.test(ua)) browser = 'Internet Explorer';
 
  if (browser && os) return `${browser} on ${os}`;
  return browser || os || null;
};
 
// IP -> "Patna, India" (null for local/private/unknown IPs)
const getLocationFromIP = (ip) => {
  if (!ip) return null;
  const cleanIp = String(ip).split(',')[0].trim().replace(/^::ffff:/, '');
  const geo = geoip.lookup(cleanIp);
  if (!geo || !geo.country) return null;
 
  let country = geo.country;
  try { country = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country) || geo.country; } catch (_) { /* keep code */ }
 
  return geo.city ? `${geo.city}, ${country}` : country;
};


const getMyLoginHistory = async (userId, validatedQuery) => {
  // User can ONLY see their own data — enforced here
  const filters = {
    userId,
    status: validatedQuery.status,
    ipAddress: validatedQuery.ip_address,
    dateFrom: validatedQuery.date_from,
    dateTo: validatedQuery.date_to
  };

  const pagination = {
    page: validatedQuery.page,
    limit: validatedQuery.limit
  };

  const sort = {
    column: validatedQuery.sort_by,
    order: validatedQuery.sort_order
  };

  const selectQuery = buildSelectQuery(filters, pagination, sort);
  const countQuery = buildCountQuery(filters);

  const [data, total] = await Promise.all([
    executeQuery(selectQuery.sql, selectQuery.values),
    executeCount(countQuery.sql, countQuery.values)
  ]);

  const { page, limit } = selectQuery.pagination;

  return {
    data: data.map(row => ({
    ...row,
     // The UI reads these two fields; they were never being sent before , added on 5/10/26
    device_info: parseUserAgent(row.user_agent),
    location: row.location || getLocationFromIP(row.ip_address),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null
  })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = { getMyLoginHistory };