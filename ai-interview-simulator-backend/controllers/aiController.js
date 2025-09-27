const axios = require('axios');
const Answer = require('../models/Answer');
const Session = require('../models/Session');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

async function getAIFeedback(questionText, answerText) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test') {
    return {
      clarity: 7,
      correctness: 6,
      confidence: 6,
      tips: ['Be more specific with examples', 'Mention edge cases', 'Explain time complexity'],
      raw: 'MOCK: provide more detail'
    };
  }

  const prompt = [
    { role: 'system', content: 'You are an expert interview evaluator. For the given question and candidate answer, produce JSON only with numeric scores clarity, correctness, confidence (0-10) and a short array "tips" (3 items max). Also return a short "comment". THE RESPONSE MUST BE A VALID JSON OBJECT ONLY.' },
    { role: 'user', content: `Question: ${questionText}\n\nAnswer: ${answerText}\n\nReturn JSON: { "clarity": <0-10>, "correctness": <0-10>, "confidence": <0-10>, "tips": ["tip1","tip2"], "comment":"short comment" }` }
  ];

  try {
    // Build request headers; include OpenAI-Project if provided in env (for sk-proj keys)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    };
    if (process.env.OPENAI_PROJECT_ID) {
      headers['OpenAI-Project'] = process.env.OPENAI_PROJECT_ID;
      console.log('Using OpenAI-Project header:', process.env.OPENAI_PROJECT_ID);
    }

    console.log('Calling OpenAI with model=', MODEL, 'promptLen=', prompt.reduce((s,m)=>s+m.content.length,0));
    const resp = await axios.post(OPENAI_URL, {
      model: MODEL,
      messages: prompt,
      temperature: 0.2,
      max_tokens: 250
    }, { headers });

    const text = resp.data?.choices?.[0]?.message?.content;
    console.log('OpenAI raw response text:', text && text.slice(0,1000)); // log first 1000 chars
    // parse logic unchanged...
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      const match = text && text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else {
        console.warn('Could not parse JSON from model output. Returning raw text.');
        return { clarity: null, correctness: null, confidence: null, tips: [], raw: text, comment: text };
      }
    }

    return {
      clarity: Number(parsed.clarity ?? null),
      correctness: Number(parsed.correctness ?? null),
      confidence: Number(parsed.confidence ?? null),
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5) : [],
      raw: text,
      comment: parsed.comment || ''
    };
  } catch (err) {
    // detailed diagnostic logging
    console.error('OpenAI request error: name=', err.name, 'message=', err.message);
    if (err.response) {
      console.error('OpenAI response status:', err.response.status);
      console.error('OpenAI response data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('No response from OpenAI (network or other error). Full err:', err);
    }
    throw new Error('AI service error');
  }
}


exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, questionId, answerText } = req.body;

    if (!sessionId || !questionId || !answerText) {
      return res.status(400).json({ message: 'sessionId, questionId and answerText required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Save initial answer doc
    const ans = new Answer({
      session: sessionId,
      questionId,
      user: userId,
      answerText
    });
    await ans.save();

    // Get question text to send to AI if in session
    const q = session.questions.find(q => q._id.toString() === questionId);
    const questionText = q ? q.text : 'No question text found';

    // Call OpenAI
    let aiResult;
    try {
      aiResult = await getAIFeedback(questionText, answerText);
    } catch (err) {
      // update answer with error note and return
      ans.feedback = { clarity: null, correctness: null, confidence: null, overall: null, tips: [], rawAIResponse: `AI error: ${err.message}` };
      await ans.save();
      return res.status(502).json({ message: 'AI service failed', error: err.message });
    }

    // compute overall (weighted)
    const c1 = aiResult.clarity ?? 0;
    const c2 = aiResult.correctness ?? 0;
    const c3 = aiResult.confidence ?? 0;
    // If any null then overall = null
    let overall = null;
    if ([c1, c2, c3].every(v => typeof v === 'number' && !isNaN(v))) {
      overall = Math.round(((c1 * 0.35) + (c2 * 0.5) + (c3 * 0.15)) * 10); // make 0-100
    }

    ans.feedback = {
      clarity: c1,
      correctness: c2,
      confidence: c3,
      overall,
      tips: aiResult.tips || [],
      rawAIResponse: aiResult.raw || (aiResult.comment || '')
    };

    await ans.save();

    return res.json({ message: 'Feedback saved', feedback: ans.feedback, answerId: ans._id });
  } catch (err) {
    console.error('submitAnswer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listSessionAnswers = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
    const answers = await Answer.find({ session: sessionId }).populate('user', 'name email').sort({ createdAt: -1 }).lean();
    res.json({ answers });
  } catch (err) {
    console.error('listSessionAnswers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
