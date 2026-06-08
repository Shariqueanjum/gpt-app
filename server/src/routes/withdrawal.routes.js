const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createWithdrawal, listMyWithdrawals } = require('../controllers/withdrawal.controller');
const { requestWithdrawalSchema } = require('../validators/withdrawal.validator');

router.use(authMiddleware);

router.post('/', validate(requestWithdrawalSchema), createWithdrawal);
router.get('/', listMyWithdrawals);

module.exports = router;