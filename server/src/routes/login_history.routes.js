const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { getUserLoginHistory } = require('../controllers/login_history.controller');
const { loginHistoryQuerySchema } = require('../validators/login_history.validator');

router.use(authMiddleware);
router.get('/', validate(loginHistoryQuerySchema, 'query'), getUserLoginHistory);

module.exports = router;