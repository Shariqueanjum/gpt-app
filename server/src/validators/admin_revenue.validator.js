const { z } = require('zod');

const MAX_INT = 2147483647;
const MAX_CUSTOM_DAYS = 3660; // ~10 years

const blankOr = (schema) => z.union([z.literal(''), schema]).optional();
const intText = (label) =>
  z.string().regex(/^\d{1,10}$/, `${label} must be a whole number`)
    .refine((v) => Number(v) <= MAX_INT, `${label} is too large`);
const dateText = (label) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be YYYY-MM-DD`)
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), `${label} is not a real date`);

const yearText = blankOr(intText('year').refine((v) => Number(v) >= 2000 && Number(v) <= 2100, 'year must be between 2000 and 2100'));

// A full breakdown of ONE period (a month, a quarter, a year, or a custom date range)
const breakdownQuerySchema = z.object({
  granularity: z.enum(['month', 'quarter', 'year', 'custom']),
  year: yearText,
  index: blankOr(intText('index')),
  date_from: blankOr(dateText('date_from')),
  date_to: blankOr(dateText('date_to')),
  offer_wall_id: blankOr(intText('offer_wall_id')),
}).superRefine((d, ctx) => {
  const add = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (d.granularity === 'custom') {
    if (!d.date_from) add('date_from', 'date_from is required');
    if (!d.date_to) add('date_to', 'date_to is required');
    if (d.date_from && d.date_to) {
      const days = (new Date(d.date_to) - new Date(d.date_from)) / 86400000;
      if (days < 0) add('date_to', 'date_from must be before or equal to date_to');
      if (days > MAX_CUSTOM_DAYS) add('date_to', 'Date range is too long');
    }
    return;
  }
  if (!d.year) add('year', 'year is required');
  if (d.granularity === 'month' && !(Number(d.index) >= 1 && Number(d.index) <= 12)) add('index', 'month must be 1-12');
  if (d.granularity === 'quarter' && !(Number(d.index) >= 1 && Number(d.index) <= 4)) add('index', 'quarter must be 1-4');
});

// A list of periods for the trend chart / table
const trendQuerySchema = z.object({
  granularity: z.enum(['month', 'quarter', 'year']),
  year: yearText,
  offer_wall_id: blankOr(intText('offer_wall_id')),
});

module.exports = { breakdownQuerySchema, trendQuerySchema };
