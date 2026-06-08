const { findByInternalId } = require('../repositories/offer_wall.repository');
const { findUserById } = require('../repositories/user.repository');
const { verifyCallbackHash } = require('../utils/hashVerifier');
const { parseS2SCallback, parseBrowserCallback } = require('../services/callbackParser.service');
const { processSurveyCompletion, processNonSuccessCallback } = require('../services/credit.service');
const { logIncomingTraffic } = require('../services/traffic_log.service');


// Helper to build processing result
const buildProcessingResult = (success, message, data = {}) => ({
  success,
  message,
  ...data,
  timestamp: new Date().toISOString()
});

// S2S Callback: POST /api/callback/:internal_id
const handleS2S = async (req, res, next) => {
  const startTime = Date.now();

  let offerWall = null;
  let parsed = null;
  let userId = null;
  let username = null;
  
  try {
    const { internal_id } = req.params;
    
    // Find offer wall
     offerWall = await findByInternalId(internal_id);

    if (!offerWall) {

      await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_internal_id: internal_id,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        request_body: req.body,
        response_status: 404,
        response_body: { success: false, message: 'Offer wall not found' },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(false, 'Offer wall not found')
      });

      return res.status(404).json({ success: false, message: 'Offer wall not found' });

    }

    const callbackConfig = offerWall.callback_config;
    const payload = { ...req.query, ...req.body };

    // Parse callback using DB-driven config
     parsed = parseS2SCallback(payload, callbackConfig);

    // Verify hash if configured
    const hashCheck = verifyCallbackHash(
      payload,
      offerWall.hash_algorithm,
      offerWall.hash_key,
      callbackConfig.s2s?.hash_fields || []
    );

    if (!hashCheck.valid) {

     await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        request_body: req.body,
        response_status: 400,
        response_body: { success: false, message: hashCheck.reason || 'Invalid signature' },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(false, hashCheck.reason || 'Invalid signature', { hash_check: hashCheck })
      });

      return res.status(400).json({ success: false, message: hashCheck.reason || 'Invalid signature' });

    }

    // Process based on status
    if (parsed.status === 'success' || parsed.status === 'completed') {
      const result = await processSurveyCompletion(parsed, offerWall);

      console.log("I am the result ",result);

       await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        user_id: result.user_id,
        user_username: result.username,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        request_body: req.body,
        response_status: 200,
        response_body: { success: true, message: 'Survey credited successfully', data: result },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(true, 'Survey credited successfully', result)
      });

      return res.json({
        success: true,
        message: 'Survey credited successfully',
        data: result
      });
    } else {
      // Failed, rejected, etc.
      const result = await processNonSuccessCallback(parsed.transactionId, parsed.status, offerWall);
        
      await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        user_id: result.user_id,
        user_username: result.username,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        request_body: req.body,
        response_status: 200,
        response_body: { success: true, message: `Survey marked as ${parsed.status}`, data: result },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(true, `Survey marked as ${parsed.status}`, result)
      });

      return res.json({
        success: true,
        message: `Survey marked as ${parsed.status}`,
        data: result
      });
    }

  } catch (err) {
     await logIncomingTraffic({
      type: 's2s_callback',
      offer_wall_id: offerWall?.id,
      offer_wall_name: offerWall?.name,
      offer_wall_internal_id: internal_id,
      user_id: userId,
      user_username: username,
      internal_transaction_id: parsed?.subId || parsed?.transactionId,
      external_transaction_id: parsed?.externalTransactionId,
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      query_params: req.query,
      request_body: req.body,
      response_status: 200,
      response_body: { success: false, message: err.message },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      processing_time_ms: Date.now() - startTime,
      error_message: err.message,
      error_stack: err.stack,
      processing_result: buildProcessingResult(false, err.message, { status_code: err.status || 500 })
    });

    return res.status(200).json({ success: false, message: err.message });

  }
};

// Browser Callback: GET /api/callback/:internal_id/browser/:status
const handleBrowser = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { internal_id, status } = req.params;
     let offerWall = null;
     let parsed = null;
     let userId = null;
     let username = null;
    
     offerWall = await findByInternalId(internal_id);

    if (!offerWall) {
      await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_internal_id: internal_id,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        response_status: 302,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(false, 'Offer wall not found')
      });

      return redirectToFrontend(res, 'error', 'Offer wall not found');
    }

    const callbackConfig = offerWall.callback_config;
      parsed = parseBrowserCallback(req.query, callbackConfig);

    // Verify hash if configured
    const hashCheck = verifyCallbackHash(
      req.query,
      offerWall.hash_algorithm,
      offerWall.hash_key,
      callbackConfig.browser?.hash_fields || []
    );

    if (!hashCheck.valid) {

    await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        response_status: 302,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(false, 'Invalid signature', { hash_check: hashCheck })
      });
       
      return redirectToFrontend(res, 'error', 'Invalid signature');
    }

    // Process based on status from URL path
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'success') {
      const result = await processSurveyCompletion(parsed, offerWall);
      console.log("i am the result",result);

    await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        user_id: result.user_id,
        user_username: result.username,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        response_status: 302,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(true, 'Survey credited via browser', result)
      });

      return redirectToFrontend(res, 'success', null, result.user_credited);

    } else {
      const mappedStatus = 
        normalizedStatus === 'failed' ? 'failed' :
        normalizedStatus === 'quota' || normalizedStatus === 'quota_full' ? 'quota_full' :
        normalizedStatus === 'security' || normalizedStatus === 'security_terminated' ? 'security_terminated' :
        normalizedStatus;

      await processNonSuccessCallback(parsed.transactionId, mappedStatus, offerWall);
      
      await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        user_id: result.user_id,
        user_username: result.username,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        query_params: req.query,
        response_status: 302,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(true, `Browser callback: ${mappedStatus}`, { mapped_status: mappedStatus })
      });

      return redirectToFrontend(res, normalizedStatus);
    }

  } catch (err) {

   await logIncomingTraffic({
      type: 'browser_callback',
      offer_wall_id: offerWall?.id,
      offer_wall_name: offerWall?.name,
      offer_wall_internal_id: internal_id,
      user_id: userId,
      user_username: username,
      internal_transaction_id: parsed?.subId || parsed?.transactionId,
      external_transaction_id: parsed?.externalTransactionId,
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      query_params: req.query,
      response_status: 302,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      processing_time_ms: Date.now() - startTime,
      error_message: err.message,
      error_stack: err.stack,
      processing_result: buildProcessingResult(false, err.message)
    });

    return redirectToFrontend(res, 'error', err.message);
  }
};

// Helper to redirect to frontend with query params
const redirectToFrontend = (res, status, reason = null, amount = null) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ status });
  
  if (reason) params.append('reason', reason);
  if (amount !== null) params.append('amount', amount.toString());

  return res.redirect(`${baseUrl}/earn?${params.toString()}`);
};

module.exports = { handleS2S, handleBrowser };