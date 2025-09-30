import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SessionPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/sessions/${id}`);
        setSession(res.data.session);
        const me = await api.get('/api/auth/me');
        setIsPremium(me.data.user.isPremium);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load session');
      }
    })();
  }, [id]);

  const submitAnswer = async () => {
    if (!selectedQ) return toast.error('Select a question');
    if (!answerText.trim()) return toast.error('Type an answer');
    setLoading(true);
    try {
      const res = await api.post('/api/ai/feedback', { sessionId: id, questionId: selectedQ._id, answerText });
      setFeedback(res.data.feedback);
      toast.success('Feedback saved');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/reports/generate', { sessionId: id });
      const url = res.data.url;
      window.open(url, '_blank');
      toast.success('Report generated');
    } catch (err) {
      if (err.response?.status === 402) toast.error('Premium required');
      else toast.error('Report generation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">{session.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 card">
          <h3 className="font-bold mb-2">Questions</h3>
          <ul className="space-y-2">
            {session.questions.map(q => (
              <li key={q._id}>
                <button onClick={() => { setSelectedQ(q); setFeedback(null); setAnswerText(''); }} className={"text-left w-full p-2 rounded " + (selectedQ && selectedQ._id === q._id ? 'bg-blue-50' : '')}>
                  <div className="font-medium">{q.text}</div>
                  <div className="text-xs text-gray-500">{q.difficulty}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 card">
          {!selectedQ && <div>Select a question on the left</div>}
          {selectedQ && (
            <>
              <h3 className="font-semibold mb-2">{selectedQ.text}</h3>
              <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} rows={6} className="w-full p-2 border rounded mb-3" placeholder="Type your answer here..." />
              <div className="flex gap-3">
                <button onClick={submitAnswer} disabled={loading} className="btn btn-primary">
                  {loading ? 'Submitting...' : 'Submit Answer & Get AI Feedback'}
                </button>
                <button onClick={generateReport} className="btn btn-ghost">
                  {isPremium ? 'Generate & Download Report' : 'Buy Premium for Detailed Report'}
                </button>
              </div>

              {feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="font-bold mb-2">AI Feedback</div>
                  <div>Clarity: {feedback.clarity ?? 'N/A'}</div>
                  <div>Correctness: {feedback.correctness ?? 'N/A'}</div>
                  <div>Confidence: {feedback.confidence ?? 'N/A'}</div>
                  <div className="mt-2">Tips:</div>
                  <ul className="list-disc ml-5">
                    {feedback.tips && feedback.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
