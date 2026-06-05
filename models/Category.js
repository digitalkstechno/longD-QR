const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
