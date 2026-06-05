const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const noteSchema = new mongoose.Schema({
  text: String,
  addedBy: String,
  addedAt: { type: Date, default: Date.now }
});

const timelineSchema = new mongoose.Schema({
  title: String,
  desc: String,
  time: String
});

const escalationSchema = new mongoose.Schema({
  escalatedAt: { type: Date, default: Date.now },
  previousAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  newAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String
});

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String },
  qrCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { 
    type: String, 
    required: true,
    get: decrypt,
    set: encrypt
  },
  attachment: { type: String },
  assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Time Expired', 'Escalated'],
    default: 'Open'
  },
  internalNotes: [noteSchema],
  timeline: [timelineSchema],
  escalationHistory: [escalationSchema],
  slaResolutionTime: { type: Number, required: true },
  slaTimeUnit: { type: String, enum: ['Minutes', 'Hours'], required: true },
  expiryAt: { type: Date, required: true }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Ticket', ticketSchema);
