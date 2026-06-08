const { processSingleReversal, undoReversal, processBulkReversal } = require('../services/reversal.service');
const fs = require('fs');

const manualReverse = async (req, res, next) => {
  try {
    const { transaction_id, reason } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await processSingleReversal(
      transaction_id, 
      reason || 'Manual reversal', 
      'manual', 
      adminId,
      adminIp
    );

    res.json({
      success: true,
      message: 'Reversal processed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const manualUndo = async (req, res, next) => {
  try {
    const { survey_click_id } = req.body;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await undoReversal(parseInt(survey_click_id), adminId, adminIp);

    res.json({
      success: true,
      message: 'Reversal undone successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const bulkReverse = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      throw error;
    }

    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection.remoteAddress || 'unknown';
    const filePath = req.file.path;

    const result = await processBulkReversal(filePath, adminId, adminIp);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Bulk reversal complete. Processed: ${result.processed}, Skipped: ${result.skipped}`,
      data: result
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

module.exports = {
  manualReverse,
  manualUndo,
  bulkReverse
};