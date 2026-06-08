const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createClick } = require('../controllers/survey_click.controller');
const { createClickSchema } = require('../validators/survey_click.validator');

router.use(authMiddleware);
router.post('/', validate(createClickSchema), createClick);

module.exports = router;