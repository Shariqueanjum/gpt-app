const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { getTransactions } = require('../controllers/transaction.controller');
const { transactionQuerySchema } = require('../validators/transaction.validator');

router.use(authMiddleware);
router.get('/', validate(transactionQuerySchema, 'query'), getTransactions);

module.exports = router;