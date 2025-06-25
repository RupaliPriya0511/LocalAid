const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const notifications = await Notification.find({ recipient: username })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// Mark notifications as read
router.put('/read', async (req, res) => {
  try {
    const { notificationIds } = req.body;
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { read: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ error: 'Server error marking notifications as read' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { recipient, sender, type, postId, message } = req.body;
    const notification = new Notification({
      recipient,
      sender,
      type,
      postId,
      message
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Server error creating notification' });
  }
});

module.exports = router; 