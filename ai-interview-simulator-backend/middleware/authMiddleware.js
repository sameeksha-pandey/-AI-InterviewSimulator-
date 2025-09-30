const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ message: 'No authorization header' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' });

    const token = parts[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server not configured with JWT_SECRET' });

    const payload = jwt.verify(token, secret);
    req.userId = payload.id || payload.userId || payload._id;
    req.userEmail = payload.email || null;
    next();
  } catch (err) {
    console.error('authMiddleware error', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
