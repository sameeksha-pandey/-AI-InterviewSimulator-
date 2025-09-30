import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile(){
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const goPremium = () => navigate('/premium');

  if (!user) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Profile</h2>
      <div className="text-sm mb-2"><strong>Name:</strong> {user.name}</div>
      <div className="text-sm mb-4"><strong>Email:</strong> {user.email}</div>
      <div className="mb-4"><strong>Status:</strong> {user.isPremium ? <span className="text-green-600">Premium</span> : <span className="text-gray-600">Free</span>}</div>
      {!user.isPremium && <Button className="btn-primary" onClick={goPremium}>Buy Premium</Button>}
    </div>
  );
}
