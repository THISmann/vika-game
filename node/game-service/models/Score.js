const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    index: true
  },
  playerName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false,
  collection: 'scores'
});

// Ensure playerId is unique
scoreSchema.index({ playerId: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;

