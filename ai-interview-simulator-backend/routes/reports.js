const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { generateReport, listReports } = require('../controllers/reportController');

router.post('/generate', auth, generateReport);
router.get('/', auth, listReports);

module.exports = router;
