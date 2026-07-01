const { getOfferWallByInternalId } = require('../services/offer_wall.service');
const { createSurveyClickRecord } = require('../services/survey_click.service');

/**
 * POST /api/offer-walls/:internal_id/entry
 * Creates a click record and returns the entry URL for the user.
 * Works for router and iframe types.
 * For api type, returns has_survey_list flag.
 */
const getEntryUrl = async (req, res, next) => {
  try {
    const { internal_id } = req.params;
    const wall = await getOfferWallByInternalId(internal_id);

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
    next(err);
  }
};

module.exports = { getEntryUrl };