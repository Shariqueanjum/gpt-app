const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTicket, listMyTickets } = require('../controllers/ticket.controller');
const { createTicketSchema, ticketQuerySchema } = require('../validators/ticket.validator');
const { ticketStorage } = require('../config/cloudinary');

const upload = multer({ 
  storage: ticketStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  }
});

// Note: upload runs first to populate req.body from multipart, then validate
router.use(authMiddleware);

router.post('/', upload.single('image'), validate(createTicketSchema), createTicket);

router.get('/', validate(ticketQuerySchema, 'query'), listMyTickets);

module.exports = router;