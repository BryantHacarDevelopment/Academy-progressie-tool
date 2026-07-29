import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, ChevronRight, RefreshCw, Search, Users } from 'lucide-react';
import { BRANCHES } from '../constants';
import { listVisibleStudents } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/format';
import ErrorPanel from '../components/ErrorPanel';
import LoadingPanel from '../components/LoadingPanel';
import StatusBadge from '../components/StatusBadge';

function AverageBlock({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="text-[11px] uppercase font-bold text-slate-400">{label}</div>
      <div className="text-xl font-bold text-[#36563D] mt-1">{value ?? '—'}</div>
      <div className="text-[11px] text-slate-400">van 5</div>
    </div>
  );
}

export default function DashboardView({ profile, onSelectStudent, onOpenAnalytics }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('all');
  const [status, setStatus] = useState('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setStudents(await listVisibleStudents());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Onbekende fout.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [profile.id]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !query || student.full_name.toLowerCase().includes(query);
      const matchesBranch = branch === 'all' || student.branch === branch;
      const matchesStatus = status === 'all' || student.status === status;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [students, search, branch, status]);

  const attentionCount = students.filter((student) => student.status === 'aandacht_nodig').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-end">
        <div>
          <h1 className="text-2xl font-bold">Leerlingenoverzicht</h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile.role === 'manager'
              ? 'Je ziet toegewezen leerlingen en leerlingen van jouw vestiging.'
              : 'Bekijk de actuele voortgang van de Academy-leerlingen.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenAnalytics}
            className="bg-white border border-[#36563D] text-[#36563D] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> Analyses
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="bg-[#F2C633] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Vernieuwen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#36563D]/10 flex items-center justify-center text-[#36563D]"><Users /></div>
          <div><div className="text-2xl font-bold">{students.length}</div><div className="text-xs text-slate-500">Lopende leerlingen</div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><BarChart3 /></div>
          <div><div className="text-2xl font-bold">{attentionCount}</div><div className="text-xs text-slate-500">Aandacht nodig</div></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-700"><CalendarDays /></div>
          <div><div className="text-2xl font-bold">Maandelijks</div><div className="text-xs text-slate-500">Vaste rapportagemomenten</div></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-[1fr_190px_190px] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek leerling..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-[#36563D]"
          />
        </div>
        <select value={branch} onChange={(event) => setBranch(event.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <option value="all">Alle vestigingen</option>
          {BRANCHES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <option value="all">Alle statussen</option>
          <option value="op_schema">Op schema</option>
          <option value="loopt_voor">Loopt voor</option>
          <option value="aandacht_nodig">Aandacht nodig</option>
          <option value="gepauzeerd">Gepauzeerd</option>
          <option value="afgerond">Afgerond</option>
        </select>
      </div>

      {error && <ErrorPanel title="Leerlingen konden niet worden geladen" message={error} />}
      {loading && <LoadingPanel text="Leerlingen worden geladen..." />}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">Geen leerlingen gevonden.</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((student) => (
            <button
              type="button"
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-[#36563D] hover:shadow-md transition-all"
            >
              <div className="flex justify-between gap-3 items-start">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#36563D] text-[#F2C633] flex items-center justify-center text-lg font-bold shrink-0">
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg truncate">{student.full_name}</h2>
                    <div className="text-xs text-slate-500">{student.branch} · start {formatDate(student.start_date)}</div>
                  </div>
                </div>
                <StatusBadge status={student.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <AverageBlock label="Techniek" value={student.technicalAverage} />
                <AverageBlock label="Competenties" value={student.competencyAverage} />
              </div>

              <div className="mt-4 text-xs space-y-1.5 text-slate-600">
                <div><span className="text-slate-400">Docent:</span> {student.teacherNames}</div>
                <div><span className="text-slate-400">Manager:</span> {student.managerNames}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Bijgewerkt: {formatDateTime(student.lastUpdated)}</span>
                <span className="font-bold text-[#36563D] flex items-center">Openen <ChevronRight className="w-4 h-4" /></span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
