const { getOfferWallByInternalId } = require('../services/offer_wall.service');
const { createSurveyClickRecord } = require('../services/survey_click.service');
const { logOutgoingTraffic } = require('../services/traffic_log.service');
const { findUserById } = require('../repositories/user.repository');

/**
 * POST /api/offer-walls/:internal_id/entry
 * Creates a click record and returns the entry URL for the user.
 * Works for router and iframe types.
 * For api type, returns has_survey_list flag.
 *
 * NOTE: this is the ONLY entry point for router/iframe clicks (the "Start
 * Earning Now" button and iframe load both go through here — see
 * EarnPage.jsx: getEntryUrl / handleRouterStart). It must log outgoing
 * traffic itself, same as survey_click.controller.js does for API-type
 * clicks, or these clicks silently increment the user's click count while
 * never appearing in Admin > Traffic Logs.
 */
const getEntryUrl = async (req, res, next) => {
  const startTime = Date.now();
  const { internal_id } = req.params;
  let wall = null;

  try {
    wall = await getOfferWallByInternalId(internal_id);

    // For API type, we don't create click here — surveys are fetched first
    if (wall.type === 'api') {
      return res.json({
        success: true,
        data: {
          type: 'api',
          has_survey_list: true,
          redirect_url: null,
          iframe_src: null,
          transaction_id: null
        }
      });
    }

    // For router and iframe, create click immediately
    const result = await createSurveyClickRecord(req.user.id, {
      offer_wall_id: wall.id
    });

    // Log outgoing traffic — same shape survey_click.controller.js uses,
    // so both click paths show up identically in Admin > Traffic Logs.
    const user = await findUserById(req.user.id);

    await logOutgoingTraffic({
      type: 'survey_click',
      user_id: req.user.id,
      user_public_id: user?.public_id,
      user_username: user?.username,
      offer_wall_id: wall.id,
      offer_wall_name: wall.name,
      offer_wall_internal_id: wall.internal_id,
      survey_click_id: result.click?.id || null,
      internal_transaction_id: result.click?.transaction_id,
      url: result.click.redirect_url || result.click.iframe_src,
      method: 'GET',
      request_body: { offer_wall_id: wall.id, internal_id },
      response_status: 200,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      processing_time_ms: Date.now() - startTime,
      processing_result: {
        success: true,
        transaction_id: result.click?.transaction_id,
        type: result.click.type,
        redirect_url: result.click.redirect_url || null,
        iframe_src: result.click.iframe_src || null
      }
    });

    res.json({
      success: true,
      data: {
        type: result.click.type,
        redirect_url: result.click.redirect_url || null,
        iframe_src: result.click.iframe_src || null,
        transaction_id: result.click.transaction_id
      }
    });
  } catch (err) {
    // Log the failed attempt too — a banned user or missing wall trying to
    // enter should still be visible in Traffic Logs, not just in server logs.
    await logOutgoingTraffic({
      type: 'survey_click',
      user_id: req.user?.id,
      offer_wall_id: wall?.id,
      offer_wall_name: wall?.name,
      offer_wall_internal_id: wall?.internal_id || internal_id,
      url: req.originalUrl,
      method: req.method,
      request_body: { offer_wall_id: wall?.id, internal_id },
      response_status: err.status || 500,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      processing_time_ms: Date.now() - startTime,
      error_message: err.message,
      error_stack: err.stack,
      processing_result: {
        success: false,
        error: err.message
      }
    });

    next(err);
  }
};

module.exports = { getEntryUrl };