import React, { useState } from 'react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function CreateSession({ existing, onSaved, onCancel }) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [questions, setQuestions] = useState(existing?.questions || [{ text: '', difficulty: 'medium', tags: [] }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', difficulty: 'medium', tags: [] }]);
  const updateQuestion = (idx, key, val) => setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [key]: val } : q));
  const removeQuestion = (idx) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title required');
    setSaving(true);
    try {
      const payload = { title, description, questions };
      if (existing) {
        const res = await api.put(`/api/sessions/${existing._id}`, payload);
        onSaved && onSaved(res.data.session || res.data);
      } else {
        const res = await api.post('/api/sessions', payload);
        onSaved && onSaved(res.data.session || res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" />
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Questions</h4>
          <button type="button" onClick={addQuestion} className="text-sm text-indigo-600">+ Add</button>
        </div>

        <div className="space-y-3 mt-2">
          {questions.map((q, i) => (
            <div key={i} className="p-3 border rounded">
              <input value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)} placeholder={`Question ${i + 1}`} className="w-full p-2 border rounded mb-2" />
              <div className="flex items-center gap-2">
                <select value={q.difficulty} onChange={e => updateQuestion(i, 'difficulty', e.target.value)} className="p-2 border rounded">
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
                <button type="button" onClick={() => removeQuestion(i)} className="text-sm text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Session'}</Button>
        <Button type="button" className="btn-ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
