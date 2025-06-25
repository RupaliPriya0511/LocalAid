const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get all posts within 2km radius of user's location
router.get('/', async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    
    let query = { isPublic: true };
    
    // If location is provided, filter posts within 2km radius
    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 2000 // 2km in meters
        }
      };
    }

    const posts = await Post.find(query).populate('user').sort({ time: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new post with file upload
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { longitude, latitude, ...postData } = req.body;
    let fileUrl = '';
    let image = '';
    let video = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      // Check file type
      if (req.file.mimetype.startsWith('image/')) {
        image = fileUrl;
      } else if (req.file.mimetype.startsWith('video/')) {
        video = fileUrl;
      }
    }
    const post = new Post({
      ...postData,
      image,
      video,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      isPublic: true,
      time: new Date()
    });
    await post.save();

    // Notify all users except the creator
    const allUsers = await User.find({ name: { $ne: postData.user } });
    const notifications = allUsers.map(user => ({
      recipient: user.name,
      sender: postData.user,
      type: 'NEW_POST',
      postId: post._id.toString(),
      message: `New post: "${postData.title}" by ${postData.user}`
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ 
      userId: req.params.userId,
      isPublic: true 
    }).sort({ time: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this if not present
router.get('/:id', async (req, res) => {
  try {
    // const post = await Post.findById(req.params.id);
    const post = await Post.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH endpoint to update post status
router.patch('/:id/status', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!req.body.status || !['open', 'closed'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    post.status = req.body.status;
    await post.save();
    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('postsUpdated');
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE endpoint to delete a post by id
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('postsUpdated');
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;