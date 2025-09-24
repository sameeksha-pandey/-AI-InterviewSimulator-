const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// register
router.post('/register', register);

// login
router.post('/login', login);

// get current user (protected)
router.get('/me', auth, getMe);

module.exports = router;
