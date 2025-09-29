const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const Answer = require('../models/Answer');
const Session = require('../models/Session');
const Report = require('../models/Report');
const User = require('../models/User');

exports.generateReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isPremium) {
      return res.status(402).json({ message: 'Premium required to generate detailed report' });
    }

    // load session and answers
    const session = await Session.findById(sessionId).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const answers = await Answer.find({ session: sessionId, user: userId }).lean();

    // compute overall score (average of feedback.overall when present) and small summary
    let total = 0, cnt = 0;
    const strengths = [];
    const weaknesses = [];
    answers.forEach(a => {
      if (a.feedback && typeof a.feedback.overall === 'number') {
        total += a.feedback.overall;
        cnt++;
      }
      if (a.feedback && Array.isArray(a.feedback.tips)) {
        a.feedback.tips.forEach(t => {
          // heuristic: tips containing 'specific' or 'examples' -> weakness
          const txt = t.toLowerCase();
          if (txt.includes('specific') || txt.includes('example') || txt.includes('edge')) {
            weaknesses.push(t);
          } else {
            strengths.push(t);
          }
        });
      }
    });
    const overall = cnt ? Math.round(total / cnt) : null;
    const summary = overall ? `Average score: ${overall}/100. ${answers.length} answers evaluated.` : 'No scored answers yet';

    // prepare reports folder
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const filename = `report_${userId}_${sessionId}_${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);

    // generate PDF
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    doc.fontSize(18).text('AI Interview Simulator — Detailed Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`User: ${user.name} <${user.email}>`);
    doc.text(`Session: ${session.title || sessionId}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown();

    if (overall !== null) doc.fontSize(14).text(`Overall Score: ${overall}/100`);
    else doc.fontSize(14).text('Overall Score: N/A');

    doc.moveDown();
    doc.fontSize(12).text('Summary:');
    doc.font('Helvetica-Oblique').text(summary);
    doc.font('Helvetica').moveDown();

    // per-answer breakdown
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i];
      doc.fontSize(12).fillColor('black').text(`Q${i + 1}:`, { underline: true });
      const q = session.questions.find(q => q._id.toString() === a.questionId.toString());
      doc.fontSize(11).text(q ? q.text : 'Question text not found');
      doc.moveDown(0.2);
      doc.font('Helvetica-Oblique').text('Candidate Answer:');
      doc.font('Helvetica').text(a.answerText || 'No answer text');
      doc.moveDown(0.2);
      doc.text('Feedback:');
      if (a.feedback) {
        doc.text(`Clarity: ${a.feedback.clarity ?? 'N/A'}`);
        doc.text(`Correctness: ${a.feedback.correctness ?? 'N/A'}`);
        doc.text(`Confidence: ${a.feedback.confidence ?? 'N/A'}`);
        if (a.feedback.tips && a.feedback.tips.length) {
          doc.text('Tips:');
          a.feedback.tips.forEach((t, idx) => doc.text(`  ${idx + 1}. ${t}`));
        }
      } else {
        doc.text('No feedback available');
      }
      if (i < answers.length - 1) doc.addPage();
    }

    doc.end();

    writeStream.on('finish', async () => {
      const report = new Report({
        session: sessionId,
        user: userId,
        filename,
        path: `/reports/${filename}`,
        generatedAt: new Date(),
        score: overall,
        summary
      });
      await report.save();
      return res.json({ message: 'Report generated', url: `/reports/${filename}`, reportId: report._id });
    });

    writeStream.on('error', (err) => {
      console.error('PDF write error', err);
      return res.status(500).json({ message: 'Failed to write PDF' });
    });

  } catch (err) {
    console.error('generateReport error', err);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

exports.listReports = async (req, res) => {
  try {
    const userId = req.userId;
    const reports = await Report.find({ user: userId }).sort({ generatedAt: -1 }).lean();
    res.json({ reports });
  } catch (err) {
    console.error('listReports error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
