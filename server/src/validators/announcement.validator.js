const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000, 'Message too long')
});

module.exports = { createAnnouncementSchema };