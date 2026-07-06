const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  listAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod
} = require('../controllers/admin_payment_method.controller');
const {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  toggleStatusSchema
} = require('../validators/payment_method.validator');

router.use(adminAuthMiddleware);

router.get('/', listAllPaymentMethods);
router.post('/', validate(createPaymentMethodSchema), createPaymentMethod);
router.put('/:id', validate(updatePaymentMethodSchema), updatePaymentMethod);
router.patch('/:id/toggle', validate(toggleStatusSchema, 'params'), togglePaymentMethodStatus);
router.delete('/:id', deletePaymentMethod);

module.exports = router;