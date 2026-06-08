const { getAuditLogs } = require('../services/audit_log.service');

const listAuditLogs = async (req, res, next) => {
  try {
    const result = await getAuditLogs(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAuditLogs };