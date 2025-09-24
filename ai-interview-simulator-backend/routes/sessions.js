const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createSession,
  getSession,
  joinSession,
  listUserSessions,
  addQuestion
} = require('../controllers/sessionController');

// create session
router.post('/', auth, createSession);

// list sessions for current user
router.get('/', auth, listUserSessions);

// get session
router.get('/:id', auth, getSession);

// join session
router.post('/:id/join', auth, joinSession);

// add question to session
router.post('/:id/questions', auth, addQuestion);

module.exports = router;
