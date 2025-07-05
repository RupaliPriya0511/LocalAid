const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'localaid_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage });

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH endpoint to update user profile (name, locationName, avatar)
router.patch('/:id', async (req, res) => {
  try {
    const { name, locationName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, locationName, avatar },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Emit WebSocket event for profile update
    const io = req.app.get('io');
    if (io) {
      io.emit('userProfileUpdated', {
        userId: user._id,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          locationName: user.locationName
        }
      });
      console.log(`Profile update event emitted for user: ${user.name}`);
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST endpoint to upload avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = req.file.path; // Cloudinary URL
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Emit WebSocket event for avatar update
    const io = req.app.get('io');
    if (io) {
      io.emit('userProfileUpdated', {
        userId: user._id,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          locationName: user.locationName
        }
      });
      console.log(`Avatar update event emitted for user: ${user.name}`);
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 