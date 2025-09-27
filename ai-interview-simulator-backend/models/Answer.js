const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  clarity: { type: Number, min: 0, max: 10 },
  correctness: { type: Number, min: 0, max: 10 },
  confidence: { type: Number, min: 0, max: 10 },
  overall: { type: Number, min: 0, max: 100 },
  tips: { type: [String], default: [] },
  rawAIResponse: { type: String } // to store raw AI text for debugging
}, { _id: false });

const AnswerSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answerText: { type: String, default: '' },
  feedback: { type: FeedbackSchema, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Answer', AnswerSchema);
