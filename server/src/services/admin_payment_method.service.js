const { findAllPaymentMethods, insertPaymentMethod, updatePaymentMethodById, toggleMethodStatus, deleteMethodById, findByCode } = require('../repositories/payment_method.repository');

const getAllPaymentMethods = async () => {
  return await findAllPaymentMethods();
};

const addPaymentMethod = async (data) => {
  const existing = await findByCode(data.code);
  if (existing) {
    const err = new Error(`Payment method with code '${data.code}' already exists`);
    err.status = 409;
    throw err;
  }
  return await insertPaymentMethod(data);
};

const editPaymentMethod = async (id, data) => {
  return await updatePaymentMethodById(id, data);
};

const setPaymentMethodStatus = async (id) => {
  return await toggleMethodStatus(id);
};

const removePaymentMethod = async (id) => {
  return await deleteMethodById(id);
};

module.exports = {
  getAllPaymentMethods,
  addPaymentMethod,
  editPaymentMethod,
  setPaymentMethodStatus,
  removePaymentMethod
};