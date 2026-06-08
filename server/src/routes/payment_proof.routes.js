const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProof, listMyProofs } = require('../controllers/payment_proof.controller');
const { createPaymentProofSchema } = require('../validators/payment_proof.validator');
const { proofStorage } = require('../config/cloudinary');

const upload = multer({
  storage: proofStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for proofs
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  }
});

router.use(authMiddleware);

router.post('/', upload.single('image'), validate(createPaymentProofSchema), createProof);
router.get('/', listMyProofs);

module.exports = router;