const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  qrCodeImage: { type: String },
  qrPath: { type: String, unique: true, required: true },
  location: { type: String, default: '' }, // e.g., "Room 101", "Table 5", "Reception Desk"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);
