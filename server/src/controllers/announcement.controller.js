const {  getAnnouncementsForUser,  readAnnouncement,  deleteAnnouncementForUser, createAnnouncementAdmin, getAnnouncementsAdmin, toggleAnnouncementStatus } = require('../services/announcement.service');

const listAnnouncements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getAnnouncementsForUser(userId, req.query);

    res.json({
      success: true,
      unread_count: result.unread_count,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await readAnnouncement(userId, parseInt(id));

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (err) {
    next(err);
  }
};

const hideAnnouncement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await deleteAnnouncementForUser(userId, parseInt(id));

    res.json({
      success: true,
      message: 'Announcement hidden'
    });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const result = await createAnnouncementAdmin(req.body, adminId, adminIp);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: result.announcement
    });
  } catch (err) {
    next(err);
  }
};

const listAnnouncementsAdmin = async (req, res, next) => {
  try {
    const result = await getAnnouncementsAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const toggleAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const adminIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const result = await toggleAnnouncementStatus(parseInt(id), adminId, adminIp);

    res.json({
      success: true,
      message: `Announcement ${result.announcement.is_active ? 'activated' : 'deactivated'}`,
      data: result.announcement
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { listAnnouncements, markAsRead, hideAnnouncement, createAnnouncement, listAnnouncementsAdmin, toggleAnnouncement };