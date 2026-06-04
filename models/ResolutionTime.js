const mongoose = require('mongoose');

const resolutionTimeSchema = new mongoose.Schema({
  timeValue: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ResolutionTime', resolutionTimeSchema);
