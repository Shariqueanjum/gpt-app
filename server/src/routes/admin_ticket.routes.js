const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const { listAllTickets, respondTicket } = require('../controllers/ticket.controller');
const { adminTicketQuerySchema, respondTicketSchema } = require('../validators/ticket.validator');

router.use(adminAuthMiddleware);
router.get('/', validate(adminTicketQuerySchema, 'query'), listAllTickets);
router.put('/:id/respond', validate(respondTicketSchema), respondTicket);

module.exports = router;