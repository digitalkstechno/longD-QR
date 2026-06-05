const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const CategoryAssignment = require('../models/CategoryAssignment');
const CategorySupervisor = require('../models/CategorySupervisor');
const CategorySLA = require('../models/CategorySLA');
const { Parser } = require('json2csv');

// Helper to auto-expire and escalate tickets
const checkAndEscalateTickets = async (io) => {
  try {
    const now = new Date();
    
    // Find tickets that are expired but not yet escalated
    const expiredTickets = await Ticket.find({
      status: { $in: ['Open', 'In Progress'] },
      expiryAt: { $lt: now }
    }).populate('supervisorId').populate('assignedStaffId').populate('categoryId');

    for (const ticket of expiredTickets) {
      const previousAssignee = ticket.assignedStaffId;
      const supervisorAssignment = await CategorySupervisor.findOne({
        categoryId: ticket.categoryId?._id || ticket.categoryId
      }).populate('supervisorId');
      const resolvedSupervisor = supervisorAssignment?.supervisorId || ticket.supervisorId;
      
      ticket.status = 'Escalated';

      if (resolvedSupervisor?._id) {
        ticket.supervisorId = resolvedSupervisor._id;
      }
      
      // Add escalation history
      ticket.escalationHistory.push({
        escalatedAt: now,
        previousAssignee: previousAssignee?._id,
        newAssignee: resolvedSupervisor?._id,
        reason: 'SLA Timeout - Auto Escalated'
      });
      
      // Update assigned staff to supervisor if available
      if (resolvedSupervisor?._id) {
        ticket.assignedStaffId = resolvedSupervisor._id;
      }
      
      // Add to timeline
      ticket.timeline.push({
        title: 'Ticket Escalated',
        desc: resolvedSupervisor?._id
          ? 'SLA time expired - ticket escalated to supervisor'
          : 'SLA time expired - ticket escalated',
        time: new Date().toLocaleTimeString()
      });
      
      await ticket.save();
      
      // Create notifications
      if (resolvedSupervisor?._id) {
        const supervisorNotif = new Notification({
          type: 'escalation',
          title: 'Ticket Escalated',
          desc: `Ticket ${ticket.id} has been escalated to you due to SLA timeout.`,
          icon: 'ShieldAlert',
          color: 'danger',
          link: `/admin/queries/${ticket.id}`
        });
        await supervisorNotif.save();
      }
      
      const adminNotif = new Notification({
        type: 'escalation_admin',
        title: 'Ticket Escalation',
        desc: `Ticket ${ticket.id} has been escalated.`,
        icon: 'ShieldAlert',
        color: 'danger',
        link: `/admin/queries/${ticket.id}`
      });
      await adminNotif.save();
      
      if (io) {
        io.emit('ticket_escalated', {
          id: ticket.id,
          customerName: ticket.customerName,
          status: 'Escalated'
        });
      }
    }
  } catch (err) {
    console.error('Error escalating tickets:', err);
  }
};

exports.cronCheckAndEscalateTickets = checkAndEscalateTickets;

exports.getTickets = async (req, res) => {
  try {
    await checkAndEscalateTickets();
    
    // Pagination & Search Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const departmentId = req.query.departmentId || '';
    const categoryId = req.query.categoryId || '';
    const assignedStaffId = req.query.assignedStaffId || '';

    // Build Query
    const query = {};
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (departmentId && departmentId !== 'All') query.departmentId = departmentId;
    if (categoryId && categoryId !== 'All') query.categoryId = categoryId;
    if (assignedStaffId && assignedStaffId !== 'All') query.assignedStaffId = assignedStaffId;

    const skip = (page - 1) * limit;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('qrCodeId')
      .populate('departmentId')
      .populate('categoryId')
      .populate('assignedStaffId')
      .populate('supervisorId')
      .populate('escalationHistory.previousAssignee')
      .populate('escalationHistory.newAssignee');

    res.json({
      data: tickets,
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

exports.getDashboardStats = async (req, res) => {
  try {
    await checkAndEscalateTickets();
    
    const [total, open, inProgress, resolved, timeExpired, escalated] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'Open' }),
      Ticket.countDocuments({ status: 'In Progress' }),
      Ticket.countDocuments({ status: 'Resolved' }),
      Ticket.countDocuments({ status: 'Time Expired' }),
      Ticket.countDocuments({ status: 'Escalated' }),
    ]);
    
    // Department-wise tickets
    const deptStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Category-wise tickets
    const catStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent tickets
    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('qrCodeId')
      .populate('departmentId')
      .populate('categoryId')
      .populate('assignedStaffId');

    res.json({
      total,
      open,
      inProgress,
      resolved,
      timeExpired,
      escalated,
      deptStats,
      catStats,
      recentTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStaffDashboardStats = async (req, res) => {
  try {
    const { staffId } = req.query;
    if (!staffId) return res.status(400).json({ message: 'Staff ID required' });
    
    await checkAndEscalateTickets();
    
    const [myOpen, myInProgress, myResolved, myExpired] = await Promise.all([
      Ticket.countDocuments({ status: 'Open', assignedStaffId: staffId }),
      Ticket.countDocuments({ status: 'In Progress', assignedStaffId: staffId }),
      Ticket.countDocuments({ status: 'Resolved', assignedStaffId: staffId }),
      Ticket.countDocuments({ status: { $in: ['Time Expired', 'Escalated'] }, assignedStaffId: staffId }),
    ]);
    
    const myTickets = await Ticket.find({ assignedStaffId: staffId })
      .sort({ createdAt: -1 })
      .populate('qrCodeId')
      .populate('departmentId')
      .populate('categoryId')
      .populate('supervisorId');

    res.json({
      myOpen,
      myInProgress,
      myResolved,
      myExpired,
      myTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportTicketsCSV = async (req, res) => {
  try {
    await checkAndEscalateTickets();
    const search = req.query.search || '';
    const status = req.query.status || '';
    const departmentId = req.query.departmentId || '';
    const categoryId = req.query.categoryId || '';

    const query = {};
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (departmentId && departmentId !== 'All') query.departmentId = departmentId;
    if (categoryId && categoryId !== 'All') query.categoryId = categoryId;

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate('qrCodeId')
      .populate('departmentId')
      .populate('categoryId')
      .populate('assignedStaffId')
      .lean();
    
    const csvData = tickets.map(t => ({
      ID: t.id,
      Customer: t.customerName,
      Email: t.email,
      Mobile: t.mobileNumber,
      Department: t.departmentId?.name || 'N/A',
      Category: t.categoryId?.name || 'N/A',
      AssignedTo: t.assignedStaffId?.name || 'N/A',
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
    const ticket = await Ticket.findOne({ id: req.params.id })
      .populate('qrCodeId')
      .populate('departmentId')
      .populate('categoryId')
      .populate('assignedStaffId')
      .populate('supervisorId')
      .populate('escalationHistory.previousAssignee')
      .populate('escalationHistory.newAssignee');
      
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
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
      qrCodeId,
      qrPath,
      departmentId, 
      categoryId, 
      description,
      attachment
    } = req.body;

    // Get category assignment for staff
    const assignment = await CategoryAssignment.findOne({ categoryId }).populate('staffId');
    // Get supervisor
    const supervisor = await CategorySupervisor.findOne({ categoryId }).populate('supervisorId');
    // Get SLA
    const sla = await CategorySLA.findOne({ categoryId });
    
    if (!sla) {
      return res.status(400).json({ message: 'No SLA configured for this category' });
    }

    // Generate custom ID TKT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await Ticket.countDocuments();
    const nextId = (count + 1).toString().padStart(4, '0');
    const customId = `TKT-${year}-${nextId}`;

    // Calculate expiry time
    let expiryMs;
    if (sla.timeUnit === 'Minutes') {
      expiryMs = sla.resolutionTime * 60 * 1000;
    } else { // Hours
      expiryMs = sla.resolutionTime * 60 * 60 * 1000;
    }
    const expiryAt = new Date(Date.now() + expiryMs);

    const ticket = new Ticket({
      id: customId,
      customerName,
      mobileNumber,
      email,
      qrCodeId,
      departmentId,
      categoryId,
      description,
      attachment,
      assignedStaffId: assignment?.staffId?._id,
      supervisorId: supervisor?.supervisorId?._id,
      status: 'In Progress',
      slaResolutionTime: sla.resolutionTime,
      slaTimeUnit: sla.timeUnit,
      expiryAt,
      internalNotes: [],
      timeline: [{
        title: 'Ticket Created',
        desc: 'Customer submitted a new ticket (auto assigned to staff)',
        time: new Date().toLocaleTimeString()
      }],
      escalationHistory: []
    });

    await ticket.save();
    await ticket.populate('qrCodeId');
    await ticket.populate('departmentId');
    await ticket.populate('categoryId');
    await ticket.populate('assignedStaffId');
    await ticket.populate('supervisorId');

    // Create notification for assigned staff
    if (assignment?.staffId) {
      const staffNotif = new Notification({
        type: 'new_ticket_assigned',
        title: 'New Ticket Assigned',
        desc: `New ticket ${ticket.id} has been assigned to you.`,
        icon: 'MessageSquare',
        color: 'brand',
        link: `/admin/queries/${ticket.id}`
      });
      await staffNotif.save();
    }

    // Create notification for admin
    const notification = new Notification({
      type: 'new_query',
      title: 'New Customer Query',
      desc: `New query ${ticket.id} received from ${ticket.customerName}.`,
      icon: 'MessageSquare',
      color: 'brand',
      link: `/admin/queries/${ticket.id}`
    });
    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_ticket', {
        id: ticket.id,
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
    const { status, internalNotes, assignedStaffId } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (status) {
      ticket.status = status;
      ticket.timeline.push({
        title: 'Status Updated',
        desc: `Status changed to ${status}`,
        time: new Date().toLocaleTimeString()
      });
    }
    if (internalNotes) ticket.internalNotes = internalNotes;
    if (assignedStaffId) ticket.assignedStaffId = assignedStaffId;

    await ticket.save();
    await ticket.populate('qrCodeId');
    await ticket.populate('departmentId');
    await ticket.populate('categoryId');
    await ticket.populate('assignedStaffId');
    await ticket.populate('supervisorId');
    await ticket.populate('escalationHistory.previousAssignee');
    await ticket.populate('escalationHistory.newAssignee');
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
};

exports.addNoteToTicket = async (req, res) => {
  try {
    const { text, addedBy } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.internalNotes.push({
      text,
      addedBy,
      addedAt: new Date()
    });
    
    ticket.timeline.push({
      title: 'Note Added',
      desc: `${addedBy} added a note`,
      time: new Date().toLocaleTimeString()
    });

    await ticket.save();
    await ticket.populate('qrCodeId');
    await ticket.populate('departmentId');
    await ticket.populate('categoryId');
    await ticket.populate('assignedStaffId');
    await ticket.populate('supervisorId');
    await ticket.populate('escalationHistory.previousAssignee');
    await ticket.populate('escalationHistory.newAssignee');
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error adding note', error: error.message });
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
