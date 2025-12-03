const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false, // Keep same structure as JSON
  collection: 'users'
});

// Ensure id is unique
userSchema.index({ id: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

