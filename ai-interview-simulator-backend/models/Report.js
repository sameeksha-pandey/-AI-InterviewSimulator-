const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  score: { type: Number, default: null },
  summary: { type: String, default: '' }
});

module.exports = mongoose.model('Report', ReportSchema);
