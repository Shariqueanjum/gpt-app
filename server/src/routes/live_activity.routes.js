const express = require('express')
const router  = express.Router()
const { stream, recent } = require('../controllers/live_activity.controller')

// No auth — data is anonymised (first 2 chars + ***)
router.get('/stream', stream)
router.get('/recent', recent)

module.exports = router
