const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { submitAnswer, listSessionAnswers } = require('../controllers/aiController');

// POST feedback: save answer and get ai feedback
router.post('/feedback', auth, submitAnswer);

// GET answers for a session
router.get('/session/:sessionId/answers', auth, listSessionAnswers);

module.exports = router;
