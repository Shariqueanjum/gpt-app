const { findActivePaymentMethods, seedPaymentMethods } = require('../repositories/payment_method.repository');

const getPaymentMethods = async () => {
  const methods = await findActivePaymentMethods();
  
  return methods.map(m => ({
    id: m.id,
    name: m.name,
    code: m.code,
    min_amount: parseFloat(m.min_amount),
    max_amount: parseFloat(m.max_amount),
    processing_fee: parseFloat(m.processing_fee),
    instructions: m.instructions,
    display_order: m.display_order
  }));
};

const seedDefaultMethods = async () => {
  await seedPaymentMethods();
  return { message: 'Payment methods seeded successfully' };
};

module.exports = { getPaymentMethods, seedDefaultMethods };