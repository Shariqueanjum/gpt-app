const { createSurveyClickRecord } = require('../services/survey_click.service');
const { logOutgoingTraffic} = require('../services/traffic_log.service');
const { findUserById } = require('../repositories/user.repository');
const { findById } = require('../repositories/offer_wall.repository');

const createClick = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const userId = req.user.id;
    const result = await createSurveyClickRecord(userId, req.body);

    // Fetch user and offer wall details for logging
    const [user, offerWall] = await Promise.all([
      findUserById(userId),
      findById(req.body.offer_wall_id)
    ]);

     // Log outgoing traffic with FULL details
    await logOutgoingTraffic({
      type: 'survey_click',
      user_id: userId,
      user_public_id: user?.public_id,
      user_username: user?.username,
      offer_wall_id: req.body.offer_wall_id,
      offer_wall_name: offerWall?.name,
      offer_wall_internal_id: offerWall?.internal_id,
      survey_click_id: result.click?.id || null,
      internal_transaction_id: result.click?.transaction_id,
      url: result.click?.redirect_url || result.click?.iframe_src,
      method: 'GET',
      request_body: req.body,
      response_status: 200,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      processing_time_ms: Date.now() - startTime,
      processing_result: {
        success: true,
        transaction_id: result.click?.transaction_id,
        type: result.click?.type,
        redirect_url: result.click?.redirect_url || null,
        iframe_src: result.click?.iframe_src || null
      }
    });
  

    res.status(201).json({
      success: true,
      message: 'Survey click recorded successfully',
      data: result.click
    });
  } catch (err) {

     // Log failed outgoing traffic
    await logOutgoingTraffic({
      type: 'survey_click',
      user_id: req.user?.id,
      offer_wall_id: req.body?.offer_wall_id,
      url: req.originalUrl,
      method: req.method,
      request_body: req.body,
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

module.exports = { createClick };