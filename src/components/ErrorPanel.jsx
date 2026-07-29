import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorPanel({ title = 'Er ging iets mis', message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 flex gap-3">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm mt-1 break-words">{message}</div>
      </div>
    </div>
  );
}
