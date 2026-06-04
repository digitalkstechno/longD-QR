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

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  subject: { 
    type: String, 
    required: true,
    get: decrypt,
    set: encrypt
  },
  description: { 
    type: String, 
    required: true,
    get: decrypt,
    set: encrypt
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Expired'],
    default: 'Open'
  },
  internalNotes: [noteSchema],
  timeline: [timelineSchema],
  expiryAt: { type: Date, required: true }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Ticket', ticketSchema);
