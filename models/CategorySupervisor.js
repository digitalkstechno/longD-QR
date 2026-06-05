const mongoose = require('mongoose');

const categorySupervisorSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CategorySupervisor', categorySupervisorSchema);
