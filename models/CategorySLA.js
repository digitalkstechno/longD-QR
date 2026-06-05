const mongoose = require('mongoose');

const categorySLASchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  resolutionTime: { type: Number, required: true },
  timeUnit: { type: String, enum: ['Minutes', 'Hours'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('CategorySLA', categorySLASchema);
