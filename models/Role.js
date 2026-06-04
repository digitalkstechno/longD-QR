const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  permissions: {
    dashboard: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    query: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    users: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    departments: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    sla: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    escalations: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    reports: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
    settings: { view: { type: Boolean, default: false }, create: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } }
  },
  isSystem: {
    type: Boolean,
    default: false // Set to true for default Admin/Staff so they can't be deleted
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
