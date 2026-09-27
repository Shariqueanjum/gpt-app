const express = require('express')
const router = express.Router()
const { stream } = require('../controllers/admin_live_events.controller')
router.get('/stream', stream)
module.exports = router