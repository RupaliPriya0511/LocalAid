const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Post = require('../models/Post');

// Get messages for a post between two specific users
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userA, userB } = req.query;

    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both users must be specified' });
    }

    // Find messages where (sender=userA and receiver=userB) OR (sender=userB and receiver=userA)
    const messages = await Message.find({
      postId,
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA }
      ]
    }).sort('timestamp');

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

module.exports = router;


