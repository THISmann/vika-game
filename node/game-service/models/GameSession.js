const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: String, // User ID who created this game session
    required: true,
    index: true
  },
  questionIds: {
    type: [String], // Array of question IDs
    default: []
  },
  gameCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  scheduledStartTime: {
    type: Date,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  questionDuration: {
    type: Number, // Duration in milliseconds
    default: 30000 // 30 seconds
  },
  isStarted: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'gamesessions'
});

// Indexes for efficient queries
gameSessionSchema.index({ createdBy: 1, status: 1 });
gameSessionSchema.index({ createdBy: 1, createdAt: -1 });
gameSessionSchema.index({ scheduledStartTime: 1, status: 1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

module.exports = GameSession;

