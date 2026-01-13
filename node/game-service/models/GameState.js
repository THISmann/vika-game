const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  isStarted: {
    type: Boolean,
    default: false
  },
  currentQuestionIndex: {
    type: Number,
    default: -1
  },
  currentQuestionId: {
    type: String,
    default: null
  },
  questionStartTime: {
    type: Number,
    default: null
  },
  questionDuration: {
    type: Number,
    default: 30000 // 30 seconds
  },
  connectedPlayers: {
    type: [String],
    default: []
  },
  gameSessionId: {
    type: String,
    default: null
  },
  gameCode: {
    type: String,
    default: null
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: String, // User ID who created this game session
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scheduledStartTime: {
    type: Date,
    default: null,
    index: true
  },
  questionIds: {
    type: [String],
    default: []
  }
}, {
  timestamps: false,
  collection: 'gamestate'
});

// Use a single document identified by a fixed key field
gameStateSchema.add({
  key: {
    type: String,
    default: 'current',
    unique: true,
    index: true
  }
});

// Use a single document with key = 'current'
gameStateSchema.statics.getCurrent = async function() {
  let state = await this.findOne({ key: 'current' });
  if (!state) {
    state = await this.create({ key: 'current' });
  }
  return state;
};

gameStateSchema.statics.updateCurrent = async function(updates) {
  return await this.findOneAndUpdate(
    { key: 'current' },
    { $set: updates },
    { new: true, upsert: true }
  );
};

const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;

