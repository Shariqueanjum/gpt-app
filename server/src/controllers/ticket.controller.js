const { createTicketRecord , getMyTickets, getAllTicketsAdmin, respondToTicket} = require('../services/ticket.service');

const createTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await createTicketRecord(userId, req.body, req.file || null);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: result.ticket
    });
  } catch (err) {
    next(err);
  }
};

const listMyTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // req.query is already validated by Zod middleware
    const result = await getMyTickets(userId, req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const listAllTickets = async (req, res, next) => {
  try {
    // req.query is validated by Zod middleware
    const result = await getAllTicketsAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

const respondTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const adminIp = req.ip;

    const result = await respondToTicket(parseInt(id), req.body, adminId, adminIp);

    res.json({
      success: true,
      message: 'Ticket responded successfully',
      data: result.ticket
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTicket, listMyTickets, listAllTickets, respondTicket};