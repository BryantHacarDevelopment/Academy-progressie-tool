import React from 'react';
import { SCORE_OPTIONS } from '../constants';

const swatches = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-400',
  4: 'bg-emerald-500',
  5: 'bg-[#36563D]',
};

export default function ScoreLegend() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-5 gap-y-2 items-center text-xs">
      <span className="font-bold uppercase tracking-wide">Legenda:</span>
      {SCORE_OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center">
          <span className={`w-4 h-4 rounded mr-1.5 ${swatches[option.value]}`} />
          {option.value} = {option.shortLabel}
        </div>
      ))}
      <div className="text-slate-500">Leeg = nog niet beoordeeld</div>
    </div>
  );
}
