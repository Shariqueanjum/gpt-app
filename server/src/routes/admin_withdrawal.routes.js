const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { listPendingWithdrawals, approve, reject } = require('../controllers/admin_withdrawal.controller');
const { approveWithdrawalSchema, rejectWithdrawalSchema } = require('../validators/admin.validator');

router.use(adminAuthMiddleware);

router.get('/pending', listPendingWithdrawals);
router.put('/:id/approve', validate(approveWithdrawalSchema), approve);
router.put('/:id/reject', validate(rejectWithdrawalSchema), reject);

module.exports = router;