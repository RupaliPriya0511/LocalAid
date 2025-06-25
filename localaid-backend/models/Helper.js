const mongoose = require('mongoose');

const HelperSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  helperId: { 
    type: String, 
    required: true 
  },
  helperName: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index to prevent duplicate helpers
HelperSchema.index({ postId: 1, helperId: 1 }, { unique: true });

module.exports = mongoose.model('Helper', HelperSchema); 