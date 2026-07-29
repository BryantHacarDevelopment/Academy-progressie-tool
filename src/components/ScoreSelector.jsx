import React from 'react';
import { SCORE_OPTIONS } from '../constants';

const selectedClasses = {
  1: 'bg-red-500 text-white border-red-500',
  2: 'bg-orange-500 text-white border-orange-500',
  3: 'bg-yellow-400 text-slate-900 border-yellow-400',
  4: 'bg-emerald-500 text-white border-emerald-500',
  5: 'bg-[#36563D] text-white border-[#36563D]',
};

export default function ScoreSelector({ value, onChange, disabled = false, compact = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SCORE_OPTIONS.map((option) => {
        const selected = Number(value) === option.value;
        return (
          <button
            type="button"
            key={option.value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            title={option.label}
            aria-label={`${option.value}: ${option.label}`}
            aria-pressed={selected}
            className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-lg border font-bold transition-all disabled:cursor-default ${
              selected
                ? selectedClasses[option.value]
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#36563D] disabled:hover:border-slate-200'
            }`}
          >
            {option.value}
          </button>
        );
      })}
    </div>
  );
}
