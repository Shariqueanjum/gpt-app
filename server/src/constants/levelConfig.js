const LEVEL_CONFIG = Object.freeze([
  { level: 1, surveys_required: 0, reversal_rate_max: 100, reward: 0 },
  { level: 2, surveys_required: 5, reversal_rate_max: 5, reward: 100 },
  { level: 3, surveys_required: 15, reversal_rate_max: 5, reward: 100 },
  { level: 4, surveys_required: 30, reversal_rate_max: 5, reward: 200 },
  { level: 5, surveys_required: 50, reversal_rate_max: 5, reward: 200 },
  { level: 6, surveys_required: 80, reversal_rate_max: 5, reward: 200 },
  { level: 7, surveys_required: 120, reversal_rate_max: 5, reward: 200 },
  { level: 8, surveys_required: 160, reversal_rate_max: 5, reward: 400 },
  { level: 9, surveys_required: 225, reversal_rate_max: 5, reward: 400 },
  { level: 10, surveys_required: 300, reversal_rate_max: 5, reward: 500 },
  { level: 11, surveys_required: 350, reversal_rate_max: 5, reward: 500 },
  { level: 12, surveys_required: 400, reversal_rate_max: 5, reward: 600 },
  { level: 13, surveys_required: 450, reversal_rate_max: 5, reward: 700 },
  { level: 14, surveys_required: 500, reversal_rate_max: 5, reward: 800 },
  { level: 15, surveys_required: 550, reversal_rate_max: 5, reward: 900 },
  { level: 16, surveys_required: 600, reversal_rate_max: 5, reward: 1000 },
  { level: 17, surveys_required: 700, reversal_rate_max: 5, reward: 1200 },
  { level: 18, surveys_required: 800, reversal_rate_max: 5, reward: 1400 },
  { level: 19, surveys_required: 900, reversal_rate_max: 5, reward: 1600 },
  { level: 20, surveys_required: 1000, reversal_rate_max: 5, reward: 2000 }
]);

const MAX_LEVEL = 20;

module.exports = { LEVEL_CONFIG, MAX_LEVEL };