const pool = require('../config/db');
const {  getActiveAnnouncementsForUser,  markAnnouncementAsRead,  hideAnnouncementForUser, createAnnouncement, getAllAnnouncementsForAdmin, findAnnouncementByIdForUpdate, updateAnnouncementStatus} = require('../repositories/announcement.repository');
const {sanitizeAnnouncementHTML} = require('../utils/sanitizer');

const getAnnouncementsForUser = async (userId, query = {}) => {
  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await getActiveAnnouncementsForUser(userId, pagination);
};

const readAnnouncement = async (userId, announcementId) => {
  await markAnnouncementAsRead(userId, announcementId);
  return { read: true };
};

const deleteAnnouncementForUser = async (userId, announcementId) => {
  await hideAnnouncementForUser(userId, announcementId);
  return { deleted: true };
};

const createAnnouncementAdmin = async (payload, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // XSS sanitize the message
    const sanitizedMessage = sanitizeAnnouncementHTML(payload.message);

    const announcement = await createAnnouncement(client, {
      title: payload.title,
      message: sanitizedMessage
    });

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'create_announcement',
        'announcement',
        announcement.id,
        JSON.stringify({ 
          title: payload.title,
          was_sanitized: sanitizedMessage !== payload.message 
        }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      announcement: {
        id: announcement.id,
        title: announcement.title,
        message: announcement.message, // sanitized
        is_active: announcement.is_active,
        created_at: announcement.created_at
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getAnnouncementsAdmin = async (query = {}) => {
  const pagination = {
    page: query.page,
    limit: query.limit
  };

  return await getAllAnnouncementsForAdmin(pagination);
};

const toggleAnnouncementStatus = async (id, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

   const current = await findAnnouncementByIdForUpdate(client, id);

    if (!current) {
      const error = new Error('Announcement not found');
      error.status = 404;
      throw error;
    }

    const newStatus = !current.is_active;
    const updated = await updateAnnouncementStatus(client, id, newStatus);

    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        newStatus ? 'activate_announcement' : 'deactivate_announcement',
        'announcement',
        id,
        JSON.stringify({ new_status: newStatus }),
        adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      announcement: {
        id: updated.id,
        title: updated.title,
        is_active: updated.is_active
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getAnnouncementsForUser, readAnnouncement, deleteAnnouncementForUser, createAnnouncementAdmin, getAnnouncementsAdmin, toggleAnnouncementStatus };