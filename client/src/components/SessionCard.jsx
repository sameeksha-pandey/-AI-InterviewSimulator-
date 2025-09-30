import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SessionCard({ session, onDelete, onEdit, isHost }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{session.title}</h3>
          <p className="text-sm text-gray-500">{session.description}</p>
          <div className="mt-2 text-xs text-gray-400">{session.questions?.length || 0} questions</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/session/${session._id}`} className="text-sm text-indigo-600">Open</Link>
          {isHost && (
            <>
              <button onClick={() => onEdit(session)} aria-label="Edit" className="p-1 rounded hover:bg-gray-100">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(session._id)} aria-label="Delete" className="p-1 rounded hover:bg-gray-100">
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
