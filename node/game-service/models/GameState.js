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
  }
}, {
  timestamps: false,
  collection: 'gamestate'
});

// Use a single document with _id = 'current'
gameStateSchema.statics.getCurrent = async function() {
  let state = await this.findOne({ _id: 'current' });
  if (!state) {
    state = await this.create({ _id: 'current' });
  }
  return state;
};

gameStateSchema.statics.updateCurrent = async function(updates) {
  return await this.findOneAndUpdate(
    { _id: 'current' },
    { $set: updates },
    { new: true, upsert: true }
  );
};

const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;

