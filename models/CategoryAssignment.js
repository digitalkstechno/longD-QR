const mongoose = require('mongoose');

const categoryAssignmentSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CategoryAssignment', categoryAssignmentSchema);
