import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, RefreshCw, TrendingUp, TriangleAlert, Users } from 'lucide-react';
import { getAnalyticsData } from '../lib/api';
import { average, roundOne } from '../lib/format';
import ErrorPanel from '../components/ErrorPanel';
import LoadingPanel from '../components/LoadingPanel';
import StatusBadge from '../components/StatusBadge';

function Stat({ icon: Icon, label, value, subtext }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4 items-center">
      <div className="w-11 h-11 rounded-xl bg-[#36563D]/10 text-[#36563D] flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div><div className="text-2xl font-bold">{value}</div><div className="text-sm font-semibold">{label}</div><div className="text-xs text-slate-400">{subtext}</div></div>
    </div>
  );
}

function HorizontalBar({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(160px,1fr)_minmax(140px,1.3fr)_40px] gap-3 items-center">
      <div className="text-sm truncate" title={label}>{label}</div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#36563D]" style={{ width: `${value ? (value / 5) * 100 : 0}%` }} /></div>
      <div className="text-sm font-bold text-right">{value ?? '—'}</div>
    </div>
  );
}

export default function AnalyticsView({ onSelectStudent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await getAnalyticsData());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Onbekende fout.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const moduleAverages = useMemo(() => {
    if (!data) return [];
    return data.modules.map((module) => {
      const itemIds = new Set(module.module_items.map((item) => item.id));
      const values = data.itemProgress.filter((entry) => itemIds.has(entry.module_item_id)).map((entry) => entry.score);
      return { id: module.id, title: module.title, average: roundOne(average(values)), count: values.length };
    });
  }, [data]);

  const competencyAverages = useMemo(() => {
    if (!data) return [];
    return data.competencies.map((competency) => {
      const values = data.competencyProgress.filter((entry) => entry.competency_id === competency.id).map((entry) => entry.score);
      return { id: competency.id, title: competency.title, average: roundOne(average(values)), count: values.length };
    });
  }, [data]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><LoadingPanel text="Analyses worden opgebouwd..." /></div>;

  const students = data?.students ?? [];
  const attention = students.filter((student) => student.status === 'aandacht_nodig');
  const groupTechnical = roundOne(average(students.map((student) => student.technicalAverage).filter(Boolean)));
  const groupCompetencies = roundOne(average(students.map((student) => student.competencyAverage).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between gap-4 items-end">
        <div><h1 className="text-2xl font-bold">Analyses</h1><p className="text-sm text-slate-500 mt-1">Managementoverzicht van technische ontwikkeling, competenties en aandachtspunten.</p></div>
        <button type="button" onClick={load} className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Vernieuwen</button>
      </div>

      {error && <ErrorPanel message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={Users} label="Leerlingen" value={students.length} subtext="Binnen jouw zichtbare groep" />
        <Stat icon={BarChart3} label="Techniek gemiddeld" value={groupTechnical ?? '—'} subtext="Score van 1 tot 5" />
        <Stat icon={TrendingUp} label="Competenties gemiddeld" value={groupCompetencies ?? '—'} subtext="Score van 1 tot 5" />
        <Stat icon={TriangleAlert} label="Aandacht nodig" value={attention.length} subtext="Op basis van leerlingstatus" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold text-lg">Gemiddelde per module</h2>
          <div className="mt-5 space-y-3">
            {moduleAverages.map((module) => <HorizontalBar key={module.id} label={module.title} value={module.average} />)}
          </div>
        </section>
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold text-lg">Gemiddelde per competentie</h2>
          <div className="mt-5 space-y-3">
            {competencyAverages.map((competency) => <HorizontalBar key={competency.id} label={competency.title} value={competency.average} />)}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100"><h2 className="font-bold text-lg">Leerlingenvergelijking</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Leerling</th><th className="px-5 py-3">Vestiging</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Techniek</th><th className="px-5 py-3">Competenties</th><th className="px-5 py-3"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold">{student.full_name}</td>
                  <td className="px-5 py-4">{student.branch}</td>
                  <td className="px-5 py-4"><StatusBadge status={student.status} /></td>
                  <td className="px-5 py-4 font-bold">{student.technicalAverage ?? '—'}</td>
                  <td className="px-5 py-4 font-bold">{student.competencyAverage ?? '—'}</td>
                  <td className="px-5 py-4 text-right"><button type="button" onClick={() => onSelectStudent(student.id)} className="text-[#36563D] font-bold">Bekijken</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
