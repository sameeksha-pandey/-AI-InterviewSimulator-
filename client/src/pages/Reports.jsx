import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Reports(){
  const [reports, setReports] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/api/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Reports</h2>
      {reports.length === 0 && <div className="card">No reports yet</div>}
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r._id} className="card flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.filename}</div>
              <div className="text-sm text-gray-500">{new Date(r.generatedAt).toLocaleString()}</div>
            </div>
            <div>
              <a href={r.path} target="_blank" rel="noreferrer">
                <Button className="btn-primary">Download</Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
