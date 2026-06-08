const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parses CSV file into array of objects
 * Required: transaction_id
 * Optional: amount, date, reason, survey_id
 */
const parseReversalCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Normalize headers (lowercase, trim)
        const normalized = {};
        Object.keys(row).forEach(key => {
          normalized[key.trim().toLowerCase()] = row[key]?.trim() || null;
        });

        // Validate transaction_id
        const txnId = normalized.transaction_id;
        if (!txnId || txnId.length < 5) {
          return; // Skip invalid rows
        }

        results.push({
          transaction_id: txnId,
          amount: normalized.amount ? parseFloat(normalized.amount) : null,
          date: normalized.date || null,
          reason: normalized.reason || 'Client reversal',
          survey_id: normalized.survey_id || null
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

module.exports = { parseReversalCSV };