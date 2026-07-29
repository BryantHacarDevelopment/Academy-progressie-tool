import React from 'react';
import { statusLabel } from '../constants';

const classes = {
  op_schema: 'bg-blue-50 text-blue-700 border-blue-200',
  loopt_voor: 'bg-green-50 text-green-700 border-green-200',
  aandacht_nodig: 'bg-red-50 text-red-700 border-red-200',
  gepauzeerd: 'bg-amber-50 text-amber-700 border-amber-200',
  afgerond: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${classes[status] ?? classes.op_schema}`}>
      {statusLabel(status)}
    </span>
  );
}
