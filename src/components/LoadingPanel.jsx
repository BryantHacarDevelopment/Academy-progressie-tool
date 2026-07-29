import React from 'react';
import { LoaderCircle } from 'lucide-react';

export default function LoadingPanel({ text = 'Gegevens worden geladen...' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
      <LoaderCircle className="w-6 h-6 mx-auto mb-3 animate-spin" />
      {text}
    </div>
  );
}
