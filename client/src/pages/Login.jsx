import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [form, setForm] = useState({email:'', password:''});
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('/api/auth/login', form);
      const token = res.data?.data?.token;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}
