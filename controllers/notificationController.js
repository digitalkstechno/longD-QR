const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role?.name === 'Admin') {
      query.forAdmin = true;
    } else {
      query.userId = user._id;
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: 'Error updating notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    let query = { isRead: false };
    if (user.role?.name === 'Admin') {
      query.forAdmin = true;
    } else {
      query.userId = user._id;
    }
    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting notification' });
  }
};
