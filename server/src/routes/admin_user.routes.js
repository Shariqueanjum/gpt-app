const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { adminMoneyActionLimiter } = require('../middlewares/rateLimit.middleware');
const { listUsers, getUser, getUserFullProfile, getUserTransactionHistory, getUserWithdrawalHistory, getUserReferralData, ban, unban, adjustBalance } = require('../controllers/admin_user.controller');
const {
  getOverview, getSurveyHistory, getBonusHistory, getReversalHistory,
  getWithdrawalHistory, getReferredUsers
} = require('../controllers/admin_user_report.controller');
const { getLocked, unlock, undo } = require('../controllers/admin_user_locked.controller');
const { banUserSchema, adjustBalanceSchema } = require('../validators/admin.validator');

const {
  userIdParamSchema, surveyHistoryQuerySchema, bonusHistoryQuerySchema, reversalHistoryQuerySchema,
  withdrawalHistoryQuerySchema, referredUsersQuerySchema, allActivityQuerySchema,
  unlockLockedSchema, undoUnlockSchema
} = require('../validators/admin_user_report.validator');

router.use(adminAuthMiddleware);

const idParam = validate(userIdParamSchema, 'params');

// router.get('/', listUsers);
// router.get('/:id', getUser);
// router.get('/:id/details', getUserFullProfile);

router.get('/', listUsers);
router.get('/:id', idParam, getUser);
router.get('/:id/details', idParam, getUserFullProfile);

// ---- Single-user money report (everything an admin needs about ONE user) ----
router.get('/:id/overview', idParam, getOverview);
router.get('/:id/history/surveys', idParam, validate(surveyHistoryQuerySchema, 'query'), getSurveyHistory);
router.get('/:id/history/bonuses', idParam, validate(bonusHistoryQuerySchema, 'query'), getBonusHistory);
router.get('/:id/history/reversals', idParam, validate(reversalHistoryQuerySchema, 'query'), getReversalHistory);
router.get('/:id/history/withdrawals', idParam, validate(withdrawalHistoryQuerySchema, 'query'), getWithdrawalHistory);
router.get('/:id/history/referrals', idParam, validate(referredUsersQuerySchema, 'query'), getReferredUsers);

// ---- Locked balance: move to main balance, and undo ----
router.get('/:id/locked', idParam, getLocked);
router.post('/:id/locked/unlock', adminMoneyActionLimiter, idParam, validate(unlockLockedSchema), unlock);
router.post('/:id/locked/undo', adminMoneyActionLimiter, idParam, validate(undoUnlockSchema), undo);

router.get('/:id/transactions', idParam, validate(allActivityQuerySchema, 'query'), getUserTransactionHistory);
router.get('/:id/withdrawals', idParam, getUserWithdrawalHistory);
router.get('/:id/referrals', idParam, getUserReferralData);
router.put('/:id/ban', idParam, validate(banUserSchema), ban);
router.put('/:id/unban', idParam, unban);
router.post('/:id/adjust-balance', idParam, validate(adjustBalanceSchema), adjustBalance);

// router.get('/:id/transactions', getUserTransactionHistory);
// router.get('/:id/withdrawals', getUserWithdrawalHistory);
// router.get('/:id/referrals', getUserReferralData);
// router.put('/:id/ban', validate(banUserSchema), ban);
// router.put('/:id/unban', unban);
// router.post('/:id/adjust-balance', validate(adjustBalanceSchema), adjustBalance);

module.exports = router;