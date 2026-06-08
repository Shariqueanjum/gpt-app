const pool = require('../config/db');
const { createTicket, countTicketsWithImagesLast30Days, getTicketsByUserId, getAllTicketsForAdmin,findTicketById,updateTicketResponse } = require('../repositories/ticket.repository');
const { cloudinary } = require('../config/cloudinary');

const TICKET_CATEGORIES = Object.freeze([
  'payment_issue',
  'account_problem',
  'survey_problem',
  'withdrawal_issue',
  'referral_issue',
  'bug_report',
  'feature_request',
  'other'
]);

const extractPublicId = (path) => {
  if (!path) return null;
  const match = path.match(/\/v\d+\/(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

const createTicketRecord = async (userId, payload, imageFile) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validate category
    if (!TICKET_CATEGORIES.includes(payload.category)) {
      const error = new Error(`Invalid category. Must be one of: ${TICKET_CATEGORIES.join(', ')}`);
      error.status = 400;
      throw error;
    }

    let imageUrl = null;
    let warning = null;

    // If image uploaded, check rate limit: max 3 images per 30 days per user
    if (imageFile) {
      const imageCount = await countTicketsWithImagesLast30Days(userId);
      if (imageCount >= 3) {
        // Don't block ticket — just drop the image and warn
        warning = `Image attachment limit reached (${imageCount}/3 per 30 days). Your image was not saved.`;
        // Clean up the uploaded file from Cloudinary if multer already uploaded it
        if (imageFile && imageFile.path) {
          const publicId = extractPublicId(imageFile.path);
          if(publicId){
          cloudinary.uploader.destroy(imageFile.filename).catch(() => {});
          }
        }
      } else {
        imageUrl = imageFile.path;
      }
    }

    const ticket = await createTicket(client, {
      user_id: userId,
      category: payload.category,
      subject: payload.subject,
      message: payload.message,
      image_url: imageUrl
    });

    await client.query('COMMIT');

    return {
      ticket: {
        id: ticket.id,
        category: ticket.category,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        image_url: ticket.image_url,
        created_at: ticket.created_at
      },
      warning: warning
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getMyTickets = async (userId, validatedQuery) => {
  // Map validated query to filters (exactly like your login_history pattern)
  const filters = {};

  if (validatedQuery.status) filters.status = validatedQuery.status;
  if (validatedQuery.id) filters.id = validatedQuery.id;
  if (validatedQuery.date_from && validatedQuery.date_to) {
    filters.dateFrom = validatedQuery.date_from;
    filters.dateTo = validatedQuery.date_to;
  }

  const pagination = {
    page: validatedQuery.page,
    limit: validatedQuery.limit
  };

  const sort = {
    column: validatedQuery.sort_by,
    order: validatedQuery.sort_order
  };

  return await getTicketsByUserId(userId, filters, pagination, sort);
};

const getAllTicketsAdmin = async (validatedQuery) => {
  const filters = {};

  if (validatedQuery.status) filters.status = validatedQuery.status;
  if (validatedQuery.category) filters.category = validatedQuery.category;
  if (validatedQuery.user_id) filters.userId = validatedQuery.user_id;
  if (validatedQuery.search) filters.search = validatedQuery.search;
  if (validatedQuery.date_from && validatedQuery.date_to) {
    filters.dateFrom = validatedQuery.date_from;
    filters.dateTo = validatedQuery.date_to;
  }

  const pagination = {
    page: validatedQuery.page,
    limit: validatedQuery.limit
  };

  const sort = {
    column: validatedQuery.sort_by,
    order: validatedQuery.sort_order
  };

  return await getAllTicketsForAdmin(filters, pagination, sort);
};

const respondToTicket = async (ticketId, payload, adminId, adminIp) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ticket = await findTicketById(ticketId);
    
    if (!ticket) {
      const error = new Error('Ticket not found');
      error.status = 404;
      throw error;
    }

    // Default to closing if no status provided (natural admin behavior)
    const newStatus = payload.status || 'closed';

    const updated = await updateTicketResponse(client, ticketId, payload.admin_response, newStatus);

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId, 
        'respond_ticket', 
        'ticket', 
        ticketId, 
        JSON.stringify({ 
          previous_status: ticket.status,
          new_status: newStatus,
          response_preview: payload.admin_response.substring(0, 100)
        }), 
         adminIp
      ]
    );

    await client.query('COMMIT');

    return {
      ticket: {
        id: updated.id,
        category: updated.category,
        subject: updated.subject,
        message: updated.message,
        status: updated.status,
        admin_response: updated.admin_response,
        user_id: updated.user_id,
        user_public_id: ticket.user_public_id,
        user_username: ticket.user_username,
        updated_at: updated.updated_at
      }
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createTicketRecord, TICKET_CATEGORIES, getMyTickets, getAllTicketsAdmin, respondToTicket};