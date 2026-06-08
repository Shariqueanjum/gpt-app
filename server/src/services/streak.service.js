const pool = require('../config/db');
const {getUserStreak, lockUserStreak, updateStreak } = require('../repositories/streak.repository');
const { getNumericSetting } = require('./settings.service');
const { createTransaction } = require('../repositories/transaction.repository');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../constants/transactionTypes');

const STREAK_REWARD = 1; // Points per day, can be moved to settings later

const processDailyStreak = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const streak = await lockUserStreak(client, userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = streak.last_active_date ? new Date(streak.last_active_date) : null;
    
    let newStreak = streak.current_streak || 0;
    let reward = 0;
    let message = '';

    if (!lastActive) {
      // First time ever
      newStreak = 1;
      reward = STREAK_REWARD;
      message = 'Streak started! Day 1';
    } else {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already active today
        await client.query('COMMIT');
        return {
          streak: newStreak,
          reward: 0,
          message: 'Already checked in today',
          already_checked_in: true
        };
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
        reward = STREAK_REWARD;
        message = `Streak continued! Day ${newStreak}`;
      } else {
        // Streak broken
        newStreak = 1;
        reward = STREAK_REWARD;
        message = 'Streak reset. Day 1';
      }
    }

    // Credit reward
    if (reward > 0) {
      await client.query(
        'UPDATE users SET balance_available = balance_available + $1 WHERE id = $2',
        [reward, userId]
      );

      await createTransaction(client, {
        user_id: userId,
        type: TRANSACTION_TYPES.DAILY_BONUS,
        offer_wall_id: null,
        reference_type: 'streak',
        reference_id: newStreak,
        amount: reward,
        commission_earned: 0,
        commission_rate_at_time: null,
        referrer_id: null,
        referrer_earned: 0,
        status: TRANSACTION_STATUS.COMPLETED,
        metadata: {
          streak_day: newStreak,
          reward: reward
        }
      });
    }

    // Update streak
    await updateStreak(client, userId, newStreak, today);

    await client.query('COMMIT');

    return {
      streak: newStreak,
      reward: reward,
      message: message,
      already_checked_in: false
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getStreakStatus = async (userId) => {

  const streak = await getUserStreak(userId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = streak.last_active_date ? new Date(streak.last_active_date) : null;
  
  let canCheckIn = true;
  let daysSinceLast = null;
  
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    daysSinceLast = diffDays;
    canCheckIn = diffDays >= 1;
  }

  return {
    current_streak: streak.current_streak || 0,
    last_active_date: streak.last_active_date,
    can_check_in: canCheckIn,
    days_since_last: daysSinceLast,
    daily_reward: STREAK_REWARD
  };
};

module.exports = { processDailyStreak, getStreakStatus };