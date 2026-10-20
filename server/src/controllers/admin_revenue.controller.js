const service = require('../services/admin_revenue.service');

/** GET /api/admin/revenue/meta */
const getMeta = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getMeta() }); } catch (err) { next(err); }
};

/** GET /api/admin/revenue/trend?granularity=month&year=2026&offer_wall_id= */
const getTrend = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getTrend(req.query) }); } catch (err) { next(err); }
};

/** GET /api/admin/revenue/breakdown?granularity=month&year=2026&index=8&offer_wall_id= */
const getBreakdown = async (req, res, next) => {
  try { res.json({ success: true, data: await service.getBreakdown(req.query) }); } catch (err) { next(err); }
};

module.exports = { getMeta, getTrend, getBreakdown };
