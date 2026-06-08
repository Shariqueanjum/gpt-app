const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { listPendingProofs, approveProof, rejectProof } = require('../controllers/payment_proof.controller');
const { approvePaymentProofSchema, rejectPaymentProofSchema } = require('../validators/payment_proof.validator');

router.use(adminAuthMiddleware);

router.get('/', listPendingProofs);
router.put('/:id/approve', validate(approvePaymentProofSchema), approveProof);
router.put('/:id/reject', validate(rejectPaymentProofSchema), rejectProof);

module.exports = router;