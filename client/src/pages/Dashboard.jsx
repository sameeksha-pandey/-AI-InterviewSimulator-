import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import SessionCard from '../components/SessionCard';
import CreateSession from './CreateSession';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/api/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sessions');
    }
  };

  useEffect(() => { load(); }, []);

  const onSaved = (saved) => {
    setShowCreate(false);
    setEditing(null);
    toast.success('Session saved');
    load();
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const onEdit = (session) => {
    setEditing(session);
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Sessions</h2>
        <Button className="btn-primary" onClick={() => { setEditing(null); setShowCreate(true); }}>
          + Create Session
        </Button>
      </div>

      {showCreate && (
        <div className="card">
          <CreateSession existing={editing} onSaved={onSaved} onCancel={() => { setShowCreate(false); setEditing(null); }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.length === 0 && <div className="card">No sessions yet</div>}
        {sessions.map(s => (
          <SessionCard key={s._id} session={s} onDelete={onDelete} onEdit={onEdit} isHost={s.host === localStorage.getItem('userId') || true} />
        ))}
      </div>
    </div>
  );
}
