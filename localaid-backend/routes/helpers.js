const express = require('express');
const router = express.Router();
const Helper = require('../models/Helper');
const Post = require('../models/Post');

// Get all helpers for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const helpers = await Helper.find({ postId: req.params.postId })
      .sort({ timestamp: -1 });
    res.json(helpers);
  } catch (err) {
    console.error('Error fetching helpers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new helper
router.post('/', async (req, res) => {
  try {
    const { postId, helperId, helperName } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is already a helper
    const existingHelper = await Helper.findOne({ postId, helperId });
    if (existingHelper) {
      return res.status(400).json({ error: 'You are already a helper for this post' });
    }

    const helper = new Helper({
      postId,
      helperId,
      helperName,
      status: 'pending'
    });

    await helper.save();
    res.status(201).json(helper);
  } catch (err) {
    console.error('Error adding helper:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update helper status
router.patch('/:helperId', async (req, res) => {
  try {
    const { status } = req.body;
    const helper = await Helper.findByIdAndUpdate(
      req.params.helperId,
      { status },
      { new: true }
    );
    if (!helper) {
      return res.status(404).json({ error: 'Helper not found' });
    }
    res.json(helper);
  } catch (err) {
    console.error('Error updating helper status:', err);
    res.status(400).json({ error: err.message });
  }
});

// Remove a helper
router.delete('/:helperId', async (req, res) => {
  try {
    const helper = await Helper.findByIdAndDelete(req.params.helperId);
    if (!helper) {
      return res.status(404).json({ error: 'Helper not found' });
    }
    res.json({ message: 'Helper removed successfully' });
  } catch (err) {
    console.error('Error removing helper:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 