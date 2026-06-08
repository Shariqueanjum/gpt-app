const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { listAuditLogs } = require('../controllers/audit_log.controller');

router.use(adminAuthMiddleware);
router.get('/', listAuditLogs);

module.exports = router;