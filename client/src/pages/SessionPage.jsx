import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function SessionPage(){
  const { id } = useParams(); // session id
  const [session, setSession] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await api.get(`/api/sessions/${id}`);
        setSession(res.data.session);
      } catch (e) { console.error(e); }
    };
    load();
  }, [id]);

  const submitAnswer = async () => {
    if (!selectedQ || !answerText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/ai/feedback', {
        sessionId: id,
        questionId: selectedQ._id,
        answerText
      });
      setFeedback(res.data.feedback);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">{session.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Questions</h3>
          <ul className="space-y-2">
            {session.questions.map(q => (
              <li key={q._id}>
                <button onClick={()=>{ setSelectedQ(q); setFeedback(null); setAnswerText(''); }} className={"text-left w-full p-2 rounded " + (selectedQ && selectedQ._id === q._id ? 'bg-blue-50' : '')}>
                  <div className="font-medium">{q.text}</div>
                  <div className="text-xs text-gray-500">{q.difficulty}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          {!selectedQ && <div>Select a question on the left</div>}
          {selectedQ && (
            <>
              <h3 className="font-semibold mb-2">{selectedQ.text}</h3>
              <textarea value={answerText} onChange={e=>setAnswerText(e.target.value)} rows={6} className="w-full p-2 border rounded mb-3" placeholder="Type your answer here..."></textarea>
              <div>
                <button onClick={submitAnswer} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                  {loading ? 'Submitting...' : 'Submit Answer & Get AI Feedback'}
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
                    {feedback.tips && feedback.tips.map((t, i)=> <li key={i}>{t}</li>)}
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
