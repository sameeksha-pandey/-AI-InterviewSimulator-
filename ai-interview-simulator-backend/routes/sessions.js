const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createSession,
  getSession,
  joinSession,
  listUserSessions,
  addQuestion,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');

router.post('/', auth, createSession);
router.get('/', auth, listUserSessions);
router.get('/:id', auth, getSession);
router.post('/:id/join', auth, joinSession);
router.post('/:id/questions', auth, addQuestion);
router.put('/:id', auth, updateSession);
router.delete('/:id', auth, deleteSession);

module.exports = router;
