const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'new_query'
  title: { type: String, required: true },
  desc: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  icon: { type: String, default: 'MessageSquare' },
  color: { type: String, default: 'brand' },
  link: { type: String } // optional link to the ticket
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
