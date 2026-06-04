const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { Parser } = require('json2csv');

// Helper to auto-expire tickets
const checkAndExpireTickets = async () => {
  try {
    const now = new Date();
    await Ticket.updateMany(
      { status: { $in: ['Open', 'In Progress'] }, expiryAt: { $lt: now } },
      { $set: { status: 'Expired' } }
    );
  } catch (err) {
    console.error('Error expiring tickets:', err);
  }
};

exports.getTickets = async (req, res) => {
  try {
    await checkAndExpireTickets();
    
    // Pagination & Search Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const departmentId = req.query.departmentId || '';

    // Build Query
    const query = {};
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (departmentId && departmentId !== 'All') query.departmentId = departmentId;

    const skip = (page - 1) * limit;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    // Map to frontend expected format
    const formatted = tickets.map(t => ({
      id: t.id,
      customerName: t.customerName,
      mobileNumber: t.mobileNumber,
      email: t.email,
      departmentId: t.departmentId,
      subject: t.subject,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
      expiryAt: t.expiryAt,
      internalNotes: t.internalNotes,
      timeline: t.timeline
    }));

    res.json({
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportTicketsCSV = async (req, res) => {
  try {
    await checkAndExpireTickets();
    // Use same query parameters if needed, or export all matching
    const search = req.query.search || '';
    const status = req.query.status || '';
    const departmentId = req.query.departmentId || '';

    const query = {};
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (departmentId && departmentId !== 'All') query.departmentId = departmentId;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    
    // Flatten data for CSV
    const csvData = tickets.map(t => ({
      ID: t.id,
      Customer: t.customerName,
      Email: t.email,
      Mobile: t.mobileNumber,
      Subject: t.subject,
      Status: t.status,
      Created: new Date(t.createdAt).toLocaleString(),
      Expiry: new Date(t.expiryAt).toLocaleString()
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('tickets-export.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error during export', error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const t = await Ticket.findOne({ id: req.params.id });
    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    res.json({
      id: t.id,
      customerName: t.customerName,
      mobileNumber: t.mobileNumber,
      email: t.email,
      departmentId: t.departmentId,
      subject: t.subject,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
      expiryAt: t.expiryAt,
      internalNotes: t.internalNotes,
      timeline: t.timeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { 
      customerName, 
      mobileNumber, 
      email, 
      departmentId, 
      subject, 
      description,
      globalResolutionHours
    } = req.body;

    // Generate custom ID TKT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await Ticket.countDocuments();
    const nextId = (count + 1).toString().padStart(4, '0');
    const customId = `TKT-${year}-${nextId}`;

    const expiryAt = new Date(Date.now() + (globalResolutionHours || 24) * 60 * 60 * 1000);

    const ticket = new Ticket({
      id: customId,
      customerName,
      mobileNumber,
      email,
      departmentId,
      subject,
      description,
      status: 'Open',
      expiryAt,
      internalNotes: [],
      timeline: [{
        title: 'Ticket Created',
        desc: 'Customer submitted a new ticket',
        time: new Date().toLocaleTimeString()
      }]
    });

    await ticket.save();

    // Create notification
    const notification = new Notification({
      type: 'new_query',
      title: 'New Customer Query',
      desc: `New query ${ticket.id} received from ${ticket.customerName}.`,
      icon: 'MessageSquare',
      color: 'brand',
      link: `/admin/queries/${ticket.id}`
    });
    await notification.save();

    // Emit socket.io event to notify admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_ticket', {
        id: ticket.id,
        subject: ticket.subject,
        customerName: ticket.customerName,
        createdAt: ticket.createdAt
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error creating ticket', error: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { status, internalNotes, departmentId } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (status) ticket.status = status;
    if (internalNotes) ticket.internalNotes = internalNotes;
    if (departmentId) ticket.departmentId = departmentId;

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting ticket' });
  }
};
