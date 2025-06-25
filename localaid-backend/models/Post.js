const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  type: { type: String, enum: ['Help', 'Service', 'Alert'], required: true },
  status: { type: String, enum: ['open', 'active', 'closed'], default: 'open' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // URL to image
  user: { type: String, required: true }, // Username of the post creator
  userId: { type: String, required: true }, // ID of the post creator
  time: { type: Date, default: Date.now },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  distance: { type: Number }, // For now, just a number (later: calculate from geo)
  isPublic: { type: Boolean, default: true }, // Whether the post is visible to all users
});

// Create a 2dsphere index for geospatial queries
PostSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', PostSchema);