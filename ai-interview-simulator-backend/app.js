require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// connect database
connectDB();

// middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies

// routes
app.get('/', (req, res) => res.send('AI Interview Simulator Backend running'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
// simple protected test route
const auth = require('./middleware/authMiddleware');
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
