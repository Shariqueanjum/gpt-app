const { findByInternalId } = require('../repositories/offer_wall.repository');
const { findUserById } = require('../repositories/user.repository');
const { verifyCallbackHash } = require('../utils/hashVerifier');
const { parseS2SCallback, parseBrowserCallback } = require('../services/callbackParser.service');
const { processSurveyCompletion, processNonSuccessCallback } = require('../services/credit.service');
const { logIncomingTraffic } = require('../services/traffic_log.service');
const { processSingleReversal } = require('../services/reversal.service');
const { logger, ipLogFields } = require('../utils/logger');
const { recordCallback } = require('../utils/metrics');


// Helper to build processing result
const buildProcessingResult = (success, message, data = {}) => ({
  success,
  message,
  ...data,
  timestamp: new Date().toISOString()
});

// traffic_logs.user_username is VARCHAR(50); a provider-supplied value can be longer
const clip = (value, max = 50) => (value ? value.toString().slice(0, max) : null);

// ---------------------------------------------------------------------------
// Structured logging for callbacks. Events:
//   callback_accepted      survey credited
//   callback_acknowledged  bonus/screenout acknowledged, nothing credited
//   callback_duplicate     already credited before / duplicate provider id
//   callback_bad_signature hash check failed
//   callback_rejected      we refused it (unknown wall, unknown click, bad payload...)
//   callback_non_success   provider reported failed / terminated / quota etc. (recorded)
//   callback_reversal      reversal postback (outcome: reversed | acknowledged | failed)
//   callback_error         unexpected server fault (includes stack)
// Logging can never break a callback: everything is wrapped in try/catch.
// Only ids are logged - never the raw query/body, hash keys or signatures.
// ---------------------------------------------------------------------------
const cbLog = (req, level, event, channel, ctx = {}) => {
  try {
    const { offerWall, parsed, internal_id, started, extra, err } = ctx;
    const fields = {
      event,
      channel,
      offer_wall: offerWall?.internal_id || internal_id || null,
      offer_wall_id: offerWall?.id || null,
      provider_status: parsed?.status || null,
      provider_raw_status: parsed?.rawStatus || null,
      internal_txn: parsed?.subId || parsed?.transactionId || null,
      external_txn: parsed?.externalTransactionId || null,
      payout: parsed?.payout ?? null,
      ...ipLogFields(req),
      processing_ms: started ? Date.now() - started : null,
      ...(extra || {})
    };
    if (err) fields.err = err;
    (req.log || logger)[level](fields, event);
    recordCallback(event, offerWall?.internal_id);
  } catch (_) { /* never break callback processing because of logging */ }
};

// Decide which event a thrown error is, so bad signatures/duplicates/rejections are searchable.
const classifyCallbackError = (err) => {
  const msg = (err && err.message) || '';
  const status = err && err.status;
  if (status === 409 || /already processed|already exists|already credited/i.test(msg)) {
    return { level: 'warn', event: 'callback_duplicate', reason: msg };
  }
  if ((status && status < 500) || /^Missing required field|callback config not found/i.test(msg)) {
    return { level: 'warn', event: 'callback_rejected', reason: msg };
  }
  return { level: 'error', event: 'callback_error', reason: msg };
};

const logCallbackCatch = (req, channel, err, ctx, userInfo) => {
  const c = classifyCallbackError(err);
  cbLog(req, c.level, c.event, channel, {
    ...ctx,
    extra: { reason: c.reason, status: err.status || 500, click_id: err.click_id || null, user_id: err.user_id || userInfo?.user_id || null },
    err: c.event === 'callback_error' ? err : undefined
  });
};

// S2S Callback: POST /api/callback/:internal_id
const handleS2S = async (req, res, next) => {
  const startTime = Date.now();

  let offerWall = null;
  let parsed = null;
  let userId = null;
  let username = null;
  let internal_id = null;
  
  try {
     ({ internal_id } = req.params);
    
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
      
      cbLog(req, 'warn', 'callback_rejected', 's2s', { internal_id, started: startTime, extra: { reason: 'wall_not_found' } });
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
      callbackConfig.s2s?.hash_fields || [],
      callbackConfig.s2s?.hash_separator || ''
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
      
      cbLog(req, 'warn', 'callback_bad_signature', 's2s', { offerWall, parsed, started: startTime, extra: { reason: hashCheck.reason || 'Invalid signature' } });
      return res.status(400).json({ success: false, message: hashCheck.reason || 'Invalid signature' });

    }

    // Process based on status
    if (parsed.status === 'success' || parsed.status === 'completed') {
      const result = await processSurveyCompletion(parsed, offerWall);

      if (result?.acknowledged) {
        await logIncomingTraffic({
          type: 's2s_callback',
          offer_wall_id: offerWall.id,
          offer_wall_name: offerWall.name,
          offer_wall_internal_id: offerWall.internal_id,
          survey_click_id: result.click_id,
          user_id: result.user_id,
          user_username: result.username || clip(parsed.username),
          internal_transaction_id: parsed.subId || parsed.transactionId,
          external_transaction_id: parsed.externalTransactionId,
          url: req.originalUrl,
          method: req.method,
          headers: req.headers,
          query_params: req.query,
          request_body: req.body,
          response_status: 200,
          response_body: { success: true },
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          processing_time_ms: Date.now() - startTime,
          processing_result: buildProcessingResult(true, 'Bonus / screenout callback acknowledged — not credited', {
            acknowledged: true,
            payout_received: parsed.payout
          })
        });
         cbLog(req, 'info', 'callback_acknowledged', 's2s', { offerWall, parsed, started: startTime, extra: { click_id: result.click_id, user_id: result.user_id } });
         return res.status(200).json({
        success: true
      });
    }

       await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        survey_click_id: result.click_id,
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

      if (result?.duplicate) {
        cbLog(req, 'warn', 'callback_duplicate', 's2s', { offerWall, parsed, started: startTime, extra: { reason: 'already_credited' } });
      } else {
        cbLog(req, 'info', 'callback_accepted', 's2s', { offerWall, parsed, started: startTime, extra: {
          click_id: result?.click_id, user_id: result?.user_id, transaction_id: result?.transaction_id,
          points: result?.user_credited, locked: result?.is_locked
        } });
      }


      return res.json({
        success: true,
        message: 'Survey credited successfully',
        data: result
      });
    // } else if (parsed.status === 'reversed') {
    //   const lookupId = parsed.subId || parsed.externalTransactionId || parsed.transactionId;
    //   let reversalResult, reversalError = null;
    //   try {
    //     reversalResult = await processSingleReversal(
    //       lookupId,
    //       `Provider reversal postback (raw status: ${parsed.rawStatus || parsed.status})`,
    //       'callback', null, req.ip
    //     );
    //   } catch (err) {
    //     reversalError = err;
    //     reversalResult = { reversed: false, error: err.message };
    //   }
    } else if (parsed.status === 'reversed') {
      let reversalResult, reversalError = null;
      try {
        reversalResult = await processSingleReversal(
          {
            transactionId: parsed.subId || parsed.transactionId,
            externalTransactionId: parsed.externalTransactionId,
            offerWallId: offerWall.id,
            payout: parsed.payout
          },
          `Provider reversal postback (raw status: ${parsed.rawStatus || parsed.status})`,
          'callback', null, req.ip
        );
      } catch (err) {
        reversalError = err;
        reversalResult = {
          reversed: false,
          error: err.message,
          click_id: err.click_id || null,
          user_id: err.user_id || null,
          username: err.username || null
        };
      }

      await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        survey_click_id: reversalResult.click_id,
        user_id: reversalResult.user_id,
        user_username: reversalResult.username,
        internal_transaction_id: parsed.subId || parsed.transactionId,
        external_transaction_id: parsed.externalTransactionId,
        url: req.originalUrl, method: req.method,
        headers: req.headers, query_params: req.query, request_body: req.body,
        response_status: 200,
        response_body: { success: !reversalError, message: reversalError?.message || 'Reversal processed', data: reversalResult },
        ip_address: req.ip, user_agent: req.headers['user-agent'],
        processing_time_ms: Date.now() - startTime,
        processing_result: buildProcessingResult(
          !reversalError,
          reversalError?.message || (reversalResult.acknowledged ? 'Bonus reversal acknowledged — nothing to deduct' : 'Reversal processed via callback'),
          reversalResult
        )
      });

      cbLog(req, reversalError ? 'warn' : 'info', 'callback_reversal', 's2s', { offerWall, parsed, started: startTime, extra: {
        outcome: reversalError ? 'failed' : (reversalResult?.acknowledged ? 'acknowledged' : 'reversed'),
        reason: reversalError?.message || null,
        click_id: reversalResult?.click_id || null, user_id: reversalResult?.user_id || null
      } });

      return res.json({
        success: !reversalError,
        message: reversalError ? reversalError.message : 'Reversal processed successfully',
        data: reversalResult
      });
    } else {
      // Failed, rejected, etc.
      const result = await processNonSuccessCallback(parsed, offerWall);
        
      await logIncomingTraffic({
        type: 's2s_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        survey_click_id: result.click_id,
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

      cbLog(req, 'info', 'callback_non_success', 's2s', { offerWall, parsed, started: startTime, extra: { click_id: result?.click_id, user_id: result?.user_id } });

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
      survey_click_id: err.click_id || null,
      user_id: err.user_id || userId,
      user_username: err.username || username || clip(parsed?.username),
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

    logCallbackCatch(req, 's2s', err, { offerWall, parsed, internal_id, started: startTime }, { user_id: userId });
    return res.status(200).json({ success: false, message: err.message });

  }
};

// Browser Callback: GET /api/callback/:internal_id/browser/:status
const handleBrowser = async (req, res, next) => {
    const startTime = Date.now();

    let internal_id = null;
     let status = null;
     let offerWall = null;
     let parsed = null;
     let userId = null;
     let username = null;
    try{
     ({ internal_id, status } = req.params);
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
      
      cbLog(req, 'warn', 'callback_rejected', 'browser', { internal_id, started: startTime, extra: { reason: 'wall_not_found' } });
      return redirectToFrontend(res, 'error', 'Offer wall not found');
    }

    const callbackConfig = offerWall.callback_config;
      parsed = parseBrowserCallback(req.query, callbackConfig);

    // Verify hash if configured
    const hashCheck = verifyCallbackHash(
      req.query,
      offerWall.hash_algorithm,
      offerWall.hash_key,
      callbackConfig.browser?.hash_fields || [],
      callbackConfig.browser?.hash_separator || ''
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
      
      cbLog(req, 'warn', 'callback_bad_signature', 'browser', { offerWall, parsed, started: startTime, extra: { reason: hashCheck.reason || 'Invalid signature' } });
      return redirectToFrontend(res, 'error', 'Invalid signature');
    }

    // Process based on status from URL path
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'success') {
      const result = await processSurveyCompletion(parsed, offerWall);

    await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        survey_click_id: result.click_id,
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
        processing_result: buildProcessingResult(true, result.acknowledged ? 'Bonus / screenout callback acknowledged — not credited' : 'Survey credited via browser', result)
      });

      if (result?.duplicate) {
        cbLog(req, 'warn', 'callback_duplicate', 'browser', { offerWall, parsed, started: startTime, extra: { reason: 'already_credited' } });
      } else if (result?.acknowledged) {
        cbLog(req, 'info', 'callback_acknowledged', 'browser', { offerWall, parsed, started: startTime, extra: { click_id: result.click_id, user_id: result.user_id } });
      } else {
        cbLog(req, 'info', 'callback_accepted', 'browser', { offerWall, parsed, started: startTime, extra: {
          click_id: result?.click_id, user_id: result?.user_id, transaction_id: result?.transaction_id,
          points: result?.user_credited, locked: result?.is_locked
        } });
      }

      return redirectToFrontend(res, 'success', null, result.user_credited);

    } else {
      const mappedStatus = 
        normalizedStatus === 'failed' ? 'failed' :
        normalizedStatus === 'quota' || normalizedStatus === 'quota_full' ? 'quota_full' :
        normalizedStatus === 'security' || normalizedStatus === 'security_terminated' ? 'security_terminated' :
        normalizedStatus;

      const result = await processNonSuccessCallback(parsed, offerWall);
      
      await logIncomingTraffic({
        type: 'browser_callback',
        offer_wall_id: offerWall.id,
        offer_wall_name: offerWall.name,
        offer_wall_internal_id: offerWall.internal_id,
        survey_click_id: result.click_id,
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

      cbLog(req, 'info', 'callback_non_success', 'browser', { offerWall, parsed, started: startTime, extra: { browser_status: normalizedStatus, click_id: result?.click_id, user_id: result?.user_id } });
      return redirectToFrontend(res, normalizedStatus);
    }

  } catch (err) {

   await logIncomingTraffic({
      type: 'browser_callback',
      offer_wall_id: offerWall?.id,
      offer_wall_name: offerWall?.name,
      offer_wall_internal_id: internal_id,
      survey_click_id: err.click_id || null,
      user_id: err.user_id || userId,
      user_username: err.username || username || clip(parsed?.username),
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

    logCallbackCatch(req, 'browser', err, { offerWall, parsed, internal_id, started: startTime }, { user_id: userId });
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