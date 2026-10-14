const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  listSurveyActivity,
  getStats,
  getFilterOptions,
  getClickDetail,
  reverseClick,
  undoClick
} = require('../controllers/survey_activity.controller');
const {
  surveyActivityQuerySchema,
  surveyActivityStatsQuerySchema,
  clickIdParamSchema,
  reverseSurveyClickSchema
} = require('../validators/survey_activity.validator');

router.use(adminAuthMiddleware);

router.get('/', validate(surveyActivityQuerySchema, 'query'), listSurveyActivity);

// Fixed paths must stay above '/:id' or they would be read as a click id
router.get('/stats', validate(surveyActivityStatsQuerySchema, 'query'), getStats);
router.get('/filters', getFilterOptions);

router.get('/:id', validate(clickIdParamSchema, 'params'), getClickDetail);
router.post('/:id/reverse', validate(clickIdParamSchema, 'params'), validate(reverseSurveyClickSchema), reverseClick);
router.post('/:id/undo', validate(clickIdParamSchema, 'params'), undoClick);

module.exports = router;
