const pool = require('../config/db');
const {  createPaymentProof,  findPaymentProofByUserId,  hasExistingProof, findPendingProofsForAdmin, updatePaymentProofStatus, findPaymentProofById, lockPaymentProofById} = require('../repositories/payment_proof.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');
const { cloudinary } = require('../config/cloudinary');

const PROOF_REWARD_POINTS = 50;

const extractPublicId = (path) => {
  if (!path) return null;
  // Path format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
  const match = path.match(/\/v\d+\/(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

const uploadPaymentProof = async (userId, payload, imageFile) => {
  if (!imageFile) {
    const error = new Error('Payment proof image is required');
    error.status = 400;
    throw error;
  }

  // One per user lifetime
  const alreadyExists = await hasExistingProof(userId);
  if (alreadyExists) {
    const error = new Error('You have already submitted a payment proof. Only one submission is allowed per account.');
    error.status = 409;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const proof = await createPaymentProof(client, {
      user_id: userId,
      image_url: imageFile.path,
      amount: payload.amount,
      method: payload.method
    });

    await client.query('COMMIT');

    return {
      proof: {
        id: proof.id,
        amount: parseFloat(proof.amount),
        method: proof.method,
        status: proof.status,
        image_url: proof.image_url,
        created_at: proof.created_at
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    // Clean up uploaded image on failure
    if (imageFile && imageFile.path) {
      const publicId = extractPublicId(imageFile.path);
      if(publicId){
      cloudinary.uploader.destroy(imageFile.filename).catch(() => {});
      }
    }
    throw err;
  } finally {
    client.release();
  }
};

const getMyPaymentProofs = async (userId) => {
  const proofs = await findPaymentProofByUserId(userId);

  return {
    proofs: proofs.map(p => ({
      id: p.id,
      amount: parseFloat(p.amount),
      method: p.method,
      status: p.status,
      reward_given: p.reward_given,
      admin_note: p.admin_note,
      image_url: p.image_url,
      created_at: p.created_at,
      updated_at: p.updated_at
    }))
  };
};

const getPendingProofsAdmin = async (query = {}) => {
  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await findPendingProofsForAdmin(pagination);
};

const approvePaymentProof = async (proofId, adminId, adminIp, customReward = null) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

   // const proof = await findPaymentProofById(proofId);
    const proof = await lockPaymentProofById(client, proofId);

    if (!proof) {
      const error = new Error('Payment proof not found');
      error.status = 404;
      throw error;
    }

    if (proof.status !== 'pending') {
      const error = new Error(`Payment proof already ${proof.status}`);
      error.status = 400;
      throw error;
    }

    if (proof.reward_given) {
      const error = new Error('Reward already given for this proof');
      error.status = 400;
      throw error;
    }

    const rewardPoints = customReward || PROOF_REWARD_POINTS;

    // Credit user balance
    await client.query(
      'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
      [rewardPoints, proof.user_id]
    );

    // Create reward transaction
    const rewardTx = await createTransaction(client, {
      user_id: proof.user_id,
      type: TRANSACTION_TYPES.PAYMENT_PROOF_REWARD,
      offer_wall_id: null,
      reference_type: 'payment_proof',
      reference_id: proofId,
      amount: rewardPoints,
      commission_earned: 0,
      commission_rate_at_time: null,
      referrer_id: null,
      referrer_earned: 0,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        proof_amount: parseFloat(proof.amount),
        proof_method: proof.method,
        admin_id: adminId,
        reward_points: rewardPoints
      }
    });

    // Update proof status
    const updated = await updatePaymentProofStatus(client, proofId, 'approved', {
      reward_given: true
    });

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'approve_payment_proof',
        'payment_proof',
        proofId,
        JSON.stringify({
          user_id: proof.user_id,
          reward_points: rewardPoints,
          transaction_id: rewardTx.id
        }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      proof: {
        id: updated.id,
        status: updated.status,
        reward_given: updated.reward_given,
        reward_points: rewardPoints,
        user_id: proof.user_id,
        user_public_id: proof.public_id,
        user_username: proof.username
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


const rejectPaymentProof = async (proofId, reason, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const proof = await findPaymentProofById(proofId);

    if (!proof) {
      const error = new Error('Payment proof not found');
      error.status = 404;
      throw error;
    }

    if (proof.status !== 'pending') {
      const error = new Error(`Payment proof already ${proof.status}`);
      error.status = 400;
      throw error;
    }

    const updated = await updatePaymentProofStatus(client, proofId, 'rejected', {
      admin_note: reason
    });

    // Log audit with real IP
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'reject_payment_proof',
        'payment_proof',
        proofId,
        JSON.stringify({
          user_id: proof.user_id,
          reason: reason,
          previous_status: proof.status
        }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      proof: {
        id: updated.id,
        status: updated.status,
        admin_note: updated.admin_note,
        user_id: proof.user_id,
        user_public_id: proof.public_id,
        user_username: proof.username
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


module.exports = { uploadPaymentProof, getMyPaymentProofs, PROOF_REWARD_POINTS, getPendingProofsAdmin, approvePaymentProof, rejectPaymentProof };