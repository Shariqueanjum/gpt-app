const pool = require('../config/db');
const { LEVEL_CONFIG, MAX_LEVEL } = require('../constants/levelConfig');
const { getUserSurveyStats, lockUserForLevelCheck, updateUserLevel } = require('../repositories/level.repository');
const { findUserById } = require('../repositories/user.repository');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const calculateUserLevel = async (userId, lockedUser = null ) => {
   const user = lockedUser || await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const stats = await getUserSurveyStats(userId);
  const currentLevel = user.level || 1;

  // Find the highest level the user qualifies for
  let newLevel = 1;
  
  for (const config of LEVEL_CONFIG) {
    if (stats.total_completed >= config.surveys_required && 
        stats.reversal_rate <= config.reversal_rate_max) {
      newLevel = config.level;
    } else {
      // Levels are sequential — once we don't qualify, stop
      // But we need to check all because higher levels might have same criteria
      // Actually, surveys_required increases, so we can break early if not met
      if (config.surveys_required > stats.total_completed) {
        break;
      }
    }
  }

  // Cap at MAX_LEVEL
  newLevel = Math.min(newLevel, MAX_LEVEL);

  return {
    user_id: userId,
    username: user.username,
    current_level: currentLevel,
    new_level: newLevel,
    stats,
    qualifies_for_upgrade: newLevel > currentLevel
  };
};

const checkAndUpgradeLevel = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
     const lockedUser = await lockUserForLevelCheck(client, userId);
      if (!lockedUser) {
      throw new Error('User not found');
    }

    const levelData = await calculateUserLevel(userId, lockedUser);
    
    if (!levelData.qualifies_for_upgrade) {
      await client.query('COMMIT');
      return {
        upgraded: false,
        ...levelData
      };
    }

    const newLevelConfig = LEVEL_CONFIG.find(l => l.level === levelData.new_level);
    const reward = newLevelConfig ? newLevelConfig.reward : 0;

    // Update user level
    const updated = await updateUserLevel(client, userId, levelData.new_level);

    // Credit reward if any
    if (reward > 0) {
      await client.query(
        'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
        [reward, userId]
      );

      // Create level up bonus transaction
      await createTransaction(client, {
        user_id: userId,
        type: TRANSACTION_TYPES.LEVEL_UP_BONUS,
        offer_wall_id: null,
        reference_type: 'level_upgrade',
        reference_id: levelData.new_level,
        amount: reward,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.COMPLETED,
        metadata: {
          previous_level: levelData.current_level,
          new_level: levelData.new_level,
          surveys_completed: levelData.stats.total_completed,
          reversal_rate: levelData.stats.reversal_rate
        }
      });
    }

    await client.query('COMMIT');

    return {
      upgraded: true,
      user_id: userId,
      username: updated.username,
      previous_level: levelData.current_level,
      new_level: updated.level,
      reward: reward,
      stats: levelData.stats
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getLevelProgress = async (userId) => {
  const user = await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const stats = await getUserSurveyStats(userId);
  const currentLevel = user.level || 1;
  const currentConfig = LEVEL_CONFIG.find(l => l.level === currentLevel);
  const nextConfig = LEVEL_CONFIG.find(l => l.level === currentLevel + 1);

  // Progress to next level
  let progress = null;
  if (nextConfig) {
    const surveysNeeded = nextConfig.surveys_required - currentConfig.surveys_required;
    const surveysDone = stats.total_completed - currentConfig.surveys_required;
    const percentage = Math.min(100, Math.max(0, Math.floor((surveysDone / surveysNeeded) * 100)));
    
    progress = {
      next_level: nextConfig.level,
      surveys_required: nextConfig.surveys_required,
      surveys_completed: stats.total_completed,
      surveys_remaining: Math.max(0, nextConfig.surveys_required - stats.total_completed),
      reversal_rate_current: stats.reversal_rate,
      reversal_rate_max: nextConfig.reversal_rate_max,
      percentage: percentage
    };
  }

  return {
    user_id: userId,
    username: user.username,
    current_level: currentLevel,
    current_reward: currentConfig ? currentConfig.reward : 0,
    stats,
    progress,
    all_levels: LEVEL_CONFIG.map(l => ({
      level: l.level,
      surveys_required: l.surveys_required,
      reversal_rate_max: l.reversal_rate_max,
      reward: l.reward,
      unlocked: stats.total_completed >= l.surveys_required && stats.reversal_rate <= l.reversal_rate_max
    }))
  };
};

module.exports = { calculateUserLevel, checkAndUpgradeLevel, getLevelProgress };