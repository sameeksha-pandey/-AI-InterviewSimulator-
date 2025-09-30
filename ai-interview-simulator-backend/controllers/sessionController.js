const Session = require('../models/Session');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

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
      participants: [req.userId],
      status: qs.length > 0 ? 'open' : 'draft'
    });

    await session.save();
    res.status(201).json({ message: 'Session created', session });
  } catch (err) {
    console.error('createSession error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error('getSession error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listUserSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await Session.find({
      $or: [{ host: userId }, { participants: userId }]
    }).sort({ createdAt: -1 }).lean();
    res.json({ sessions });
  } catch (err) {
    console.error('listUserSessions error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error('joinSession error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, difficulty, tags } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Question text required' });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.host.toString() !== req.userId) return res.status(403).json({ message: 'Only host can add questions' });

    const question = { text: text.trim(), difficulty: difficulty || 'medium', tags: Array.isArray(tags) ? tags : [] };
    session.questions.push(question);
    if (session.status === 'draft') session.status = 'open';
    await session.save();
    res.status(201).json({ message: 'Question added', session });
  } catch (err) {
    console.error('addQuestion error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions, status } = req.body;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.host.toString() !== req.userId) return res.status(403).json({ message: 'Only host can update session' });

    if (title) session.title = title.trim();
    if (typeof description !== 'undefined') session.description = description.trim();
    if (Array.isArray(questions)) {
      session.questions = questions.map(q => ({
        text: (q.text || '').trim(),
        difficulty: q.difficulty || 'medium',
        tags: Array.isArray(q.tags) ? q.tags : []
      }));
    }
    if (status) session.status = status;
    await session.save();
    res.json({ message: 'Session updated', session });
  } catch (err) {
    console.error('updateSession error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.host.toString() !== req.userId) return res.status(403).json({ message: 'Only host can delete session' });

    await Session.deleteOne({ _id: id });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error('deleteSession error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
