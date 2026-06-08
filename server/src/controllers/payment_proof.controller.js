const { uploadPaymentProof, getMyPaymentProofs, getPendingProofsAdmin, approvePaymentProof, rejectPaymentProof } = require('../services/payment_proof.service');

const createProof = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await uploadPaymentProof(userId, req.body, req.file || null);

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. It will be reviewed by our team.',
      data: result.proof
    });
  } catch (err) {
    next(err);
  }
};

const listMyProofs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getMyPaymentProofs(userId);

    res.json({
      success: true,
      data: result.proofs
    });
  } catch (err) {
    next(err);
  }
};

const listPendingProofs = async (req, res, next) => {
  try {
    const result = await getPendingProofsAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const approveProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const { reward_points } = req.body;
    const adminIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const result = await approvePaymentProof(
      parseInt(id),
      adminId,
      adminIp,
      reward_points || null
    );

    res.json({
      success: true,
      message: `Payment proof approved. ${result.proof.reward_points} points credited to user.`,
      data: result.proof
    });
  } catch (err) {
    next(err);
  }
};

const rejectProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const result = await rejectPaymentProof(parseInt(id), reason, adminId, adminIp);

    res.json({
      success: true,
      message: 'Payment proof rejected',
      data: result.proof
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProof, listMyProofs, listPendingProofs, approveProof, rejectProof};