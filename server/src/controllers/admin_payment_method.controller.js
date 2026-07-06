const { getAllPaymentMethods, addPaymentMethod, editPaymentMethod, setPaymentMethodStatus,removePaymentMethod } = require('../services/admin_payment_method.service');

const listAllPaymentMethods = async (req, res, next) => {
  try {
    const methods = await getAllPaymentMethods();
    res.json({ success: true, data: methods });
  } catch (err) {
    next(err);
  }
};

const createPaymentMethod = async (req, res, next) => {
  try {
    const method = await addPaymentMethod(req.body);
    res.status(201).json({ success: true, message: 'Payment method created', data: method });
  } catch (err) {
    next(err);
  }
};

const updatePaymentMethod = async (req, res, next) => {
  try {
    const method = await editPaymentMethod(req.params.id, req.body);
    res.json({ success: true, message: 'Payment method updated', data: method });
  } catch (err) {
    next(err);
  }
};

const togglePaymentMethodStatus = async (req, res, next) => {
  try {
    const method = await setPaymentMethodStatus(req.params.id);
    res.json({
      success: true,
      message: `Payment method ${method.is_active ? 'activated' : 'deactivated'}`,
      data: method
    });
  } catch (err) {
    next(err);
  }
};

const deletePaymentMethod = async (req, res, next) => {
  try {
    await removePaymentMethod(req.params.id);
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod
};