import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState('');

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await api.get('/api/sessions');
        setSessions(res.data.sessions || []);
      } catch (e) {
        setErr('Failed to load sessions');
      }
    };
    load();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Sessions</h2>
        <Link to="/create" className="text-sm text-blue-600">+ Create (TODO)</Link>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      <div className="space-y-3">
        {sessions.length === 0 && <div className="p-4 bg-white rounded shadow">No sessions yet</div>}
        {sessions.map(s => (
          <Link to={`/session/${s._id}`} key={s._id} className="block bg-white p-4 rounded shadow hover:shadow-md">
            <div className="font-bold">{s.title}</div>
            <div className="text-sm text-gray-600">{s.description}</div>
            <div className="text-xs text-gray-400 mt-2">Status: {s.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
