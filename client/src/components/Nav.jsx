import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Nav() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('nav getMe', err);
      }
    })();
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">AI Interview</Link>
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <Link to="/reports" className="text-sm text-gray-700">Reports</Link>
              <Link to="/premium" className="text-sm text-indigo-600">Premium</Link>
              <Link to="/profile" className="text-sm text-gray-700">{user?.isPremium ? 'Premium ✅' : 'Profile'}</Link>
              <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-2">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
