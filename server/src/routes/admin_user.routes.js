const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { listUsers, getUser, getUserFullProfile, getUserTransactionHistory, getUserWithdrawalHistory, getUserReferralData, ban, unban, adjustBalance } = require('../controllers/admin_user.controller');
const { banUserSchema, adjustBalanceSchema } = require('../validators/admin.validator');

router.use(adminAuthMiddleware);

router.get('/', listUsers);
router.get('/:id', getUser);
router.get('/:id/details', getUserFullProfile);
router.get('/:id/transactions', getUserTransactionHistory);
router.get('/:id/withdrawals', getUserWithdrawalHistory);
router.get('/:id/referrals', getUserReferralData);
router.put('/:id/ban', validate(banUserSchema), ban);
router.put('/:id/unban', unban);
router.post('/:id/adjust-balance', validate(adjustBalanceSchema), adjustBalance);

module.exports = router;