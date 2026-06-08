const express = require('express');
const router = express.Router();
const { createAdmin } = require('../controllers/admin_seed.controller');

router.post('/', createAdmin);

module.exports = router;