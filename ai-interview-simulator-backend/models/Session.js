const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: { type: [String], default: [] }
}, { _id: true });

const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: { type: [QuestionSchema], default: [] },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  currentQuestionIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'open', 'in_progress', 'finished'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
