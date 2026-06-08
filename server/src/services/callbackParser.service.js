/**
 * Universal callback parser
 * Reads offer_wall.callback_config to extract fields dynamically
 * Zero code changes when adding new offer walls
 */

const parseS2SCallback = (body, callbackConfig) => {
  if (!callbackConfig || !callbackConfig.s2s) {
    throw new Error('S2S callback config not found for this offer wall');
  }

  const config = callbackConfig.s2s;
  
  const transactionId = body[config.transaction_id_field];
  const rawStatus = body[config.status_field];
  const payout = body[config.payout_field];

  // FIX: Extract sub_id / pub_id — intermediary echoing YOUR internal transaction_id
  // Different intermediaries use different field names: sub_id, pub_id, custom_id, sid, etc.

  const subIdField = config.sub_id_field ;
  const subId = subIdField ? body[subIdField] : null;
  
  // FIX 3: Extract external transaction ID (intermediary's own generated ID)
  // Some send it explicitly, some it's their transaction_id when sub_id is present
  const externalTxIdField = config.external_transaction_id_field;
  const externalTransactionId = externalTxIdField ? body[externalTxIdField]  : (subId ? transactionId : null);


  if (!transactionId) {
    throw new Error(`Missing required field: ${config.transaction_id_field}`);
  }

  // Map provider-specific status to our standard status
  const statusMap = config.status_map || {};
  const mappedStatus = statusMap[rawStatus] || rawStatus;

  return {
    transactionId: transactionId.toString(),
    subId: subId ? subId.toString() : null,
    status: mappedStatus,
    payout: payout !== undefined ? parseFloat(payout) : null,
    externalTransactionId: externalTransactionId ? externalTransactionId.toString() : null,
    rawStatus,
    rawBody: body
  };
};

const parseBrowserCallback = (query, callbackConfig) => {
  if (!callbackConfig || !callbackConfig.browser) {
    throw new Error('Browser callback config not found for this offer wall');
  }

  const config = callbackConfig.browser;
  
  const transactionId = query[config.transaction_id_field];
  const payout = query[config.payout_field];

  if (!transactionId) {
    throw new Error(`Missing required field: ${config.transaction_id_field}`);
  }

    // FIX: Extract sub_id for browser callbacks too
  const subIdField = config.sub_id_field;
  const subId = subIdField ? query[subIdField] : null;
  
  const externalTxIdField = config.external_transaction_id_field;
  const externalTransactionId = externalTxIdField ? query[externalTxIdField] : (subId ? transactionId : null);

  return {
    transactionId: transactionId.toString(),
    subId: subId ? subId.toString() : null,
    externalTransactionId: externalTransactionId ? externalTransactionId.toString() : null,
    payout: payout !== undefined ? parseFloat(payout) : null,
    signature: query[config.signature_field] || query.signature || query.hash || query.sig,
    rawQuery: query
  };
};

module.exports = { parseS2SCallback, parseBrowserCallback };