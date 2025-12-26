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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allow multiple null values
    index: true
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  contact: {
    type: String,
    trim: true
  },
  useCase: {
    type: String,
    enum: ['education', 'corporate', 'entertainment', 'events', 'other'],
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending',
    index: true
  },
  statusChangedAt: {
    type: Date
  },
  statusChangedBy: {
    type: String // Admin username who changed the status
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: false, // Keep same structure as JSON
  collection: 'users'
});

// Ensure id is unique
userSchema.index({ id: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;




