const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  roomId: { type: String, required: true }, // Unique room ID for each user pair
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create compound index for efficient querying
MessageSchema.index({ postId: 1, roomId: 1 });

module.exports = mongoose.model('Message', MessageSchema);