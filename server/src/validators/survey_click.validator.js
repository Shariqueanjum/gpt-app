const { z } = require('zod');

const createClickSchema = z.object({
  offer_wall_id: z
    .number()
    .int()
    .positive('Offer wall ID must be a positive integer'),

  survey_id: z
    .string()
    .trim()
    .max(100)
    .optional(),

  survey_name: z
    .string()
    .trim()
    .max(255)
    .optional(),

  loi: z
    .number()
    .int()
    .positive()
    .optional(),

  cpa: z
    .number()
    .positive()
    .optional()
});

module.exports = {
  createClickSchema
};