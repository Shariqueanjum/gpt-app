const pool = require('../config/db');

const getActiveAnnouncementsForUser = async (userId, pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  // Get announcements that are active AND not deleted by this user
  const dataRes = await pool.query(
    `SELECT 
      a.id, a.title, a.message, a.is_active, a.created_at,
      COALESCE(ua.is_read, false) as is_read,
      ua.read_at
     FROM announcements a
     LEFT JOIN user_announcements ua 
       ON a.id = ua.announcement_id AND ua.user_id = $1 AND ua.is_deleted = false
     WHERE a.is_active = true
       AND (ua.is_deleted IS NULL OR ua.is_deleted = false)
     ORDER BY a.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  // Count total active (for user)
  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total
     FROM announcements a
     LEFT JOIN user_announcements ua 
       ON a.id = ua.announcement_id AND ua.user_id = $1
     WHERE a.is_active = true
       AND (ua.is_deleted IS NULL OR ua.is_deleted = false)`,
    [userId]
  );

  // Count unread
  const unreadRes = await pool.query(
    `SELECT COUNT(*)::int as unread_count
     FROM announcements a
     LEFT JOIN user_announcements ua 
       ON a.id = ua.announcement_id AND ua.user_id = $1
     WHERE a.is_active = true
       AND (ua.is_deleted IS NULL OR ua.is_deleted = false)
       AND (ua.is_read IS NULL OR ua.is_read = false)`,
    [userId]
  );

  return {
    data: dataRes.rows,
    meta: {
      page,
      limit,
      total: countRes.rows[0].total,
      totalPages: Math.ceil(countRes.rows[0].total / limit),
      hasNext: page * limit < countRes.rows[0].total,
      hasPrev: page > 1
    },
    unread_count: unreadRes.rows[0].unread_count
  };
};

const markAnnouncementAsRead = async (userId, announcementId) => {
    const checkRes = await pool.query(
    `SELECT id FROM announcements WHERE id = $1 AND is_active = true`,
    [announcementId]
  );

  if (checkRes.rows.length === 0) {
    const error = new Error('Announcement not found or inactive');
    error.status = 404;
    throw error;
  }
  
    await pool.query(
    `INSERT INTO user_announcements (user_id, announcement_id, is_read, read_at, is_deleted)
     VALUES ($1, $2, true, CURRENT_TIMESTAMP, false)
     ON CONFLICT (user_id, announcement_id) 
     DO UPDATE SET is_read = true, read_at = CURRENT_TIMESTAMP, is_deleted = false`,
    [userId, announcementId]
  );
};

const hideAnnouncementForUser = async (userId, announcementId) => {
   const checkRes = await pool.query(
    `SELECT id FROM announcements WHERE id = $1`,
    [announcementId]
  );

  if (checkRes.rows.length === 0) {
    const error = new Error('Announcement not found');
    error.status = 404;
    throw error;
  }
 
    await pool.query(
    `INSERT INTO user_announcements (user_id, announcement_id, is_read, is_deleted)
     VALUES ($1, $2, true, true)
     ON CONFLICT (user_id, announcement_id) 
     DO UPDATE SET is_deleted = true, is_read = true, read_at = COALESCE(user_announcements.read_at, CURRENT_TIMESTAMP)`,
    [userId, announcementId]
  );
};

const createAnnouncement = async (clientOrPool, data) => {
  const executor = clientOrPool || pool;
  const { title, message } = data;

  const res = await executor.query(
    `INSERT INTO announcements (title, message, is_active)
     VALUES ($1, $2, true)
     RETURNING *`,
    [title, message]
  );
  return res.rows[0];
};

const findAnnouncementById = async (clientOrPool, id) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `SELECT id, title, message, is_active, created_at FROM announcements WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};

const findAnnouncementByIdForUpdate = async (client, id) => {
  const res = await client.query(
    `SELECT id, title, message, is_active, created_at FROM announcements WHERE id = $1 FOR UPDATE`,
    [id]
  );
  return res.rows[0];
};

const getAllAnnouncementsForAdmin = async (pagination = {}) => {
  const limit = Math.min(Math.max(parseInt(pagination.limit) || 20, 1), 100);
  const page = Math.max(parseInt(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const countRes = await pool.query(
    `SELECT COUNT(*)::int as total FROM announcements`
  );

  const dataRes = await pool.query(
    `SELECT id, title, message, is_active, created_at
     FROM announcements
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    data: dataRes.rows,
    meta: {
      page,
      limit,
      total: countRes.rows[0].total,
      totalPages: Math.ceil(countRes.rows[0].total / limit),
      hasNext: page * limit < countRes.rows[0].total,
      hasPrev: page > 1
    }
  };
};

const updateAnnouncementStatus = async (clientOrPool, id, isActive) => {
  const executor = clientOrPool || pool;
  const res = await executor.query(
    `UPDATE announcements 
     SET is_active = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [isActive, id]
  );
  return res.rows[0];
};


module.exports = { getActiveAnnouncementsForUser, markAnnouncementAsRead, hideAnnouncementForUser, createAnnouncement, findAnnouncementById, findAnnouncementByIdForUpdate,  getAllAnnouncementsForAdmin, updateAnnouncementStatus};