const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  choices: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Choices array cannot be empty'
    }
  },
  answer: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: false, // Keep same structure as JSON
  collection: 'questions'
});

// Ensure id is unique
questionSchema.index({ id: 1 }, { unique: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

