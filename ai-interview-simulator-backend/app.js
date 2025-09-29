require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

connectDB();

// middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse urlencoded bodies

// require auth middleware early
const auth = require('./middleware/authMiddleware');

app.get('/', (req, res) => res.send('AI Interview Simulator Backend running'));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/reports', require('./routes/reports'));

// serve report files statically
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// example protected route (for testing)
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'You hit a protected route', userId: req.userId, email: req.userEmail });
});

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
