const Session = require('../models/Session');
const User = require('../models/User');
const Answer = require('../models/Answer');

// Create session (host only - determined by token)
exports.createSession = async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const qs = Array.isArray(questions) ? questions.map(q => ({
      text: (q.text || '').trim(),
      difficulty: q.difficulty || 'medium',
      tags: Array.isArray(q.tags) ? q.tags : []
    })) : [];

    const session = new Session({
      title: title.trim(),
      description: (description || '').trim(),
      host: req.userId,
      questions: qs,
      participants: [req.userId], // host is automatically a participant
      status: qs.length > 0 ? 'open' : 'draft'
    });

    await session.save();

    res.status(201).json({ message: 'Session created', session });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by id
exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate('host', 'name email')
      .populate('participants', 'name email')
      .lean();

    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json({ session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join session (adds user to participants)
exports.joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.participants.some(p => p.toString() === userId)) {
      return res.json({ message: 'Already joined', session });
    }

    session.participants.push(userId);
    await session.save();

    res.json({ message: 'Joined session', session });
  } catch (err) {
    console.error('Join session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List sessions for user (hosted or joined)
exports.listUserSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await Session.find({
      $or: [
        { host: userId },
        { participants: userId }
      ]
    }).sort({ createdAt: -1 }).limit(100).lean();

    res.json({ sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a question to a session (host only)
exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params; // session id
    const { text, difficulty, tags } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: 'Question text required' });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.host.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only host can add questions' });
    }

    const question = {
      text: text.trim(),
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : []
    };

    session.questions.push(question);
    // if previously draft, open it
    if (session.status === 'draft') session.status = 'open';

    await session.save();

    res.status(201).json({ message: 'Question added', session });
  } catch (err) {
    console.error('Add question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
