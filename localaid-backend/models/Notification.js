const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // username of the recipient
  sender: { type: String, required: true }, // username of the sender
  type: { 
    type: String, 
    enum: ['HELP_OFFER', 'MESSAGE', 'HELPER_ACCEPTED', 'HELPER_REJECTED', 'NEW_POST'],
    required: true 
  },
  postId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create index for efficient querying
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 