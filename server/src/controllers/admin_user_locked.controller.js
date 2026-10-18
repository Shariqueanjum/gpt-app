const service = require('../services/admin_user_locked.service');

const uid = (req) => parseInt(req.params.id, 10);
const clientIp = (req) => req.ip || req.connection?.remoteAddress || 'unknown';

/** GET /api/admin/users/:id/locked */
const getLocked = async (req, res, next) => {
  try {
    const data = await service.getLockedOverview(uid(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/users/:id/locked/unlock */
const unlock = async (req, res, next) => {
  try {
    const data = await service.unlockUserLocked(uid(req), req.body, req.admin.id, clientIp(req));
    res.json({ success: true, message: `${data.unlocked_points} points moved to main balance`, data });
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/users/:id/locked/undo */
const undo = async (req, res, next) => {
  try {
    const data = await service.undoUserUnlock(uid(req), req.body.unlock_transaction_id, req.admin.id, clientIp(req));
    res.json({ success: true, message: `${data.undone_points} points moved back to locked`, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLocked, unlock, undo };
