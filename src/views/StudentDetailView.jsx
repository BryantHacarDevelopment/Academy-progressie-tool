import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Sparkles,
  UserRound,
} from 'lucide-react';
import {
  addItemNote,
  addModuleNote,
  createMonthlyReport,
  getStudentDetail,
  saveCompetencyProgress,
  saveItemProgress,
} from '../lib/api';
import { average, currentMonthStart, formatDate, formatDateTime, formatMonth, roundOne } from '../lib/format';
import { STUDENT_STATUS_OPTIONS, scoreLabel } from '../constants';
import ErrorPanel from '../components/ErrorPanel';
import LoadingPanel from '../components/LoadingPanel';
import ScoreLegend from '../components/ScoreLegend';
import ScoreSelector from '../components/ScoreSelector';
import StatusBadge from '../components/StatusBadge';

function AverageCard({ label, value, subtext }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs uppercase font-bold text-slate-400">{label}</div>
      <div className="text-3xl font-bold text-[#36563D] mt-1">{value ?? '—'}</div>
      <div className="text-xs text-slate-500 mt-1">{subtext}</div>
    </div>
  );
}

function NotesList({ notes, emptyText = 'Nog geen opmerkingen.' }) {
  if (!notes.length) {
    return <div className="text-xs text-slate-400 py-2">{emptyText}</div>;
  }

  return (
    <div className="space-y-2 mt-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-sm whitespace-pre-wrap">{note.body}</p>
          <div className="text-[11px] text-slate-400 mt-2">
            {note.author?.full_name ?? 'Onbekende gebruiker'} · {formatDateTime(note.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ reports }) {
  const points = [...reports]
    .sort((a, b) => String(a.report_month).localeCompare(String(b.report_month)))
    .map((report) => {
      const values = (report.monthly_item_snapshots ?? []).map((item) => item.score);
      return { month: report.report_month, value: average(values) };
    })
    .filter((point) => point.value !== null);

  if (points.length < 2) {
    return <div className="text-sm text-slate-400 py-8 text-center">Minimaal twee maandrapporten nodig voor een groeigrafiek.</div>;
  }

  const width = 760;
  const height = 230;
  const padX = 40;
  const padY = 25;
  const step = (width - padX * 2) / Math.max(points.length - 1, 1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 35}`} className="min-w-[650px] w-full">
        {[1, 2, 3, 4, 5].map((value) => {
          const y = padY + height - ((value - 1) / 4) * height;
          return (
            <g key={value}>
              <line x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={padX - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{value}</text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#36563D"
          strokeWidth="4"
          points={points.map((point, index) => {
            const x = padX + index * step;
            const y = padY + height - ((point.value - 1) / 4) * height;
            return `${x},${y}`;
          }).join(' ')}
        />
        {points.map((point, index) => {
          const x = padX + index * step;
          const y = padY + height - ((point.value - 1) / 4) * height;
          return (
            <g key={point.month}>
              <circle cx={x} cy={y} r="6" fill="#F2C633" stroke="#36563D" strokeWidth="2" />
              <text x={x} y={height + 48} textAnchor="middle" fontSize="10" fill="#64748b">
                {new Intl.DateTimeFormat('nl-NL', { month: 'short' }).format(new Date(point.month))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function StudentDetailView({ studentId, profile, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState(null);
  const [itemState, setItemState] = useState({});
  const [competencyState, setCompetencyState] = useState({});
  const [saving, setSaving] = useState('');
  const [notice, setNotice] = useState('');
  const [moduleNoteDrafts, setModuleNoteDrafts] = useState({});
  const [itemNoteDrafts, setItemNoteDrafts] = useState({});
  const [reportMonth, setReportMonth] = useState(currentMonthStart());
  const [reportSummary, setReportSummary] = useState('');
  const [reportStatus, setReportStatus] = useState('op_schema');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const canEdit = profile.role === 'admin' || profile.role === 'teacher';

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentDetail(studentId);
      setDetail(data);
      setExpandedModule((current) => current ?? data.modules[0]?.id ?? null);
      setItemState(Object.fromEntries(data.itemProgress.map((entry) => [entry.module_item_id, {
        score: entry.score,
        comment: entry.comment ?? '',
      }])));
      setCompetencyState(Object.fromEntries(data.competencyProgress.map((entry) => [entry.competency_id, {
        score: entry.score,
        comment: entry.comment ?? '',
      }])));
      setReportStatus(data.student.status ?? 'op_schema');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Onbekende fout.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [studentId]);

  const technicalAverage = useMemo(() => roundOne(average(Object.values(itemState).map((entry) => entry.score))), [itemState]);
  const competencyAverage = useMemo(() => roundOne(average(Object.values(competencyState).map((entry) => entry.score))), [competencyState]);

  const yearReports = useMemo(() => {
    if (!detail) return [];
    return detail.reports.filter((report) => new Date(report.report_month).getFullYear() === Number(selectedYear));
  }, [detail, selectedYear]);

  const reportYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    detail?.reports.forEach((report) => years.add(new Date(report.report_month).getFullYear()));
    return [...years].sort((a, b) => b - a);
  }, [detail]);

  async function handleSaveModule(module) {
    setSaving(`module-${module.id}`);
    setNotice('');
    try {
      const entries = module.module_items
        .map((item) => ({
          moduleItemId: item.id,
          score: itemState[item.id]?.score,
          comment: itemState[item.id]?.comment ?? '',
        }))
        .filter((entry) => Number(entry.score) >= 1 && Number(entry.score) <= 5);

      await saveItemProgress(studentId, entries, profile.id);
      setNotice(`${module.title} is opgeslagen.`);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opslaan mislukt.');
    } finally {
      setSaving('');
    }
  }

  async function handleSaveCompetencies() {
    setSaving('competencies');
    setNotice('');
    try {
      const entries = detail.competencies
        .map((competency) => ({
          competencyId: competency.id,
          score: competencyState[competency.id]?.score,
          comment: competencyState[competency.id]?.comment ?? '',
        }))
        .filter((entry) => Number(entry.score) >= 1 && Number(entry.score) <= 5);

      await saveCompetencyProgress(studentId, entries, profile.id);
      setNotice('Competenties zijn opgeslagen.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opslaan mislukt.');
    } finally {
      setSaving('');
    }
  }

  async function handleAddModuleNote(moduleId) {
    const body = moduleNoteDrafts[moduleId]?.trim();
    if (!body) return;
    setSaving(`module-note-${moduleId}`);
    try {
      await addModuleNote(studentId, moduleId, body, profile.id);
      setModuleNoteDrafts((current) => ({ ...current, [moduleId]: '' }));
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opmerking opslaan mislukt.');
    } finally {
      setSaving('');
    }
  }

  async function handleAddItemNote(itemId) {
    const body = itemNoteDrafts[itemId]?.trim();
    if (!body) return;
    setSaving(`item-note-${itemId}`);
    try {
      await addItemNote(studentId, itemId, body, profile.id);
      setItemNoteDrafts((current) => ({ ...current, [itemId]: '' }));
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opmerking opslaan mislukt.');
    } finally {
      setSaving('');
    }
  }

  async function handleCreateReport() {
    setSaving('report');
    setNotice('');
    try {
      await createMonthlyReport({
        studentId,
        month: reportMonth,
        summary: reportSummary,
        status: reportStatus,
      });
      setReportSummary('');
      setNotice(`Maandrapport ${formatMonth(reportMonth)} is vastgelegd.`);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Maandrapport maken mislukt.');
    } finally {
      setSaving('');
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><LoadingPanel text="Leerlingprofiel wordt geladen..." /></div>;
  }

  if (error && !detail) {
    return <div className="max-w-7xl mx-auto px-4 py-8 space-y-4"><button type="button" onClick={onBack} className="font-bold text-sm flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Terug</button><ErrorPanel message={error} /></div>;
  }

  const teachers = detail.assignments.filter((assignment) => assignment.assignment_role === 'teacher').map((assignment) => assignment.profile?.full_name).filter(Boolean);
  const managers = detail.assignments.filter((assignment) => assignment.assignment_role === 'manager').map((assignment) => assignment.profile?.full_name).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-7 space-y-6">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <button type="button" onClick={onBack} className="font-bold text-sm flex items-center text-slate-600 hover:text-[#36563D]"><ArrowLeft className="w-4 h-4 mr-1" /> Terug naar overzicht</button>
        <button type="button" onClick={load} className="font-bold text-sm flex items-center bg-white border border-slate-200 px-3 py-2 rounded-lg"><RefreshCw className="w-4 h-4 mr-2" /> Vernieuwen</button>
      </div>

      {error && <ErrorPanel message={error} />}
      {notice && <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-sm font-medium">{notice}</div>}

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-5 items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-[#36563D] text-[#F2C633] text-2xl font-bold flex items-center justify-center">{detail.student.full_name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold">{detail.student.full_name}</h1>
              <p className="text-sm text-slate-500">{detail.student.branch} · gestart {formatDate(detail.student.start_date)}</p>
            </div>
          </div>
          <div><div className="text-xs uppercase font-bold text-slate-400">Docent</div><div className="font-semibold mt-1">{teachers.join(', ') || 'Niet toegewezen'}</div></div>
          <div><div className="text-xs uppercase font-bold text-slate-400">Manager</div><div className="font-semibold mt-1">{managers.join(', ') || 'Niet toegewezen'}</div></div>
          <div><div className="text-xs uppercase font-bold text-slate-400 mb-1">Status</div><StatusBadge status={detail.student.status} /></div>
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-1">
        {[
          ['overview', 'Overzicht', UserRound],
          ['modules', 'Modules', BookOpen],
          ['competencies', 'Competenties', Sparkles],
          ['reports', 'Rapportages', BarChart3],
        ].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)} className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === id ? 'bg-[#36563D] text-white' : 'hover:bg-slate-50 text-slate-600'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AverageCard label="Technische score" value={technicalAverage} subtext="Gemiddelde van alle beoordeelde onderdelen" />
            <AverageCard label="Competenties" value={competencyAverage} subtext="Gemiddelde van alle beoordeelde soft skills" />
            <AverageCard label="Maandrapporten" value={detail.reports.length} subtext="Beschikbaar voor maand- en jaaranalyse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-bold text-lg">Modulescores</h2>
              <div className="mt-4 space-y-3">
                {detail.modules.map((module) => {
                  const values = module.module_items.map((item) => itemState[item.id]?.score).filter(Boolean);
                  const moduleAverage = roundOne(average(values));
                  return (
                    <div key={module.id} className="flex items-center gap-3">
                      <div className="text-sm flex-1 truncate">{module.title}</div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#36563D]" style={{ width: `${moduleAverage ? (moduleAverage / 5) * 100 : 0}%` }} /></div>
                      <div className="text-sm font-bold w-8 text-right">{moduleAverage ?? '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-bold text-lg">Laatste maandrapport</h2>
              {detail.reports[0] ? (
                <div className="mt-4">
                  <div className="flex justify-between items-center gap-3"><div className="font-bold capitalize">{formatMonth(detail.reports[0].report_month)}</div><StatusBadge status={detail.reports[0].status} /></div>
                  <p className="text-sm text-slate-600 mt-4 whitespace-pre-wrap">{detail.reports[0].summary || 'Geen algemene samenvatting toegevoegd.'}</p>
                  <div className="text-xs text-slate-400 mt-4">Vastgelegd door {detail.reports[0].author?.full_name ?? 'onbekend'} op {formatDateTime(detail.reports[0].created_at)}</div>
                </div>
              ) : <div className="text-sm text-slate-400 mt-4">Nog geen maandrapport vastgelegd.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-4">
          <ScoreLegend />
          {!canEdit && <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">Managers kunnen scores en opmerkingen bekijken. Wijzigingen worden door een docent of beheerder ingevoerd.</div>}

          {detail.modules.map((module) => {
            const open = expandedModule === module.id;
            const moduleNotes = detail.moduleNotes.filter((note) => note.module_id === module.id);
            const moduleScores = module.module_items.map((item) => itemState[item.id]?.score).filter(Boolean);
            const moduleAverage = roundOne(average(moduleScores));

            return (
              <section key={module.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button type="button" onClick={() => setExpandedModule(open ? null : module.id)} className="w-full px-5 py-4 flex justify-between gap-4 items-center hover:bg-slate-50">
                  <div className="text-left">
                    <div className="font-bold text-lg text-[#36563D]">{module.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{module.module_items.length} onderdelen · gemiddelde {moduleAverage ?? 'niet beoordeeld'}</div>
                  </div>
                  {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {open && (
                  <div className="border-t border-slate-100">
                    <div className="p-5 bg-slate-50/70 border-b border-slate-100">
                      <p className="text-sm text-slate-600">{module.description}</p>
                      <div className="mt-4">
                        <div className="text-xs font-bold uppercase text-slate-500">Module-opmerkingen</div>
                        <NotesList notes={moduleNotes} />
                        {canEdit && (
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <textarea value={moduleNoteDrafts[module.id] ?? ''} onChange={(event) => setModuleNoteDrafts((current) => ({ ...current, [module.id]: event.target.value }))} placeholder="Nieuwe opmerking over deze module..." className="flex-1 min-h-20 rounded-lg border border-slate-200 p-3 text-sm" />
                            <button type="button" onClick={() => handleAddModuleNote(module.id)} disabled={!moduleNoteDrafts[module.id]?.trim() || saving === `module-note-${module.id}`} className="self-start bg-white border border-[#36563D] text-[#36563D] rounded-lg px-4 py-2.5 font-bold text-sm disabled:opacity-40 flex items-center gap-2"><MessageSquarePlus className="w-4 h-4" /> Plaatsen</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {module.module_items.map((item) => {
                        const notes = detail.itemNotes.filter((note) => note.module_item_id === item.id);
                        const state = itemState[item.id] ?? { score: null, comment: '' };
                        return (
                          <div key={item.id} className="p-5 grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_auto_minmax(280px,1.15fr)] gap-4 items-start">
                            <div>
                              <div className="font-semibold">{item.title}</div>
                              {item.description && <div className="text-xs text-slate-500 mt-1">{item.description}</div>}
                              <NotesList notes={notes} emptyText="Geen losse opmerkingen." />
                              {canEdit && (
                                <div className="flex gap-2 mt-3">
                                  <input value={itemNoteDrafts[item.id] ?? ''} onChange={(event) => setItemNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Losse opmerking toevoegen..." className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                                  <button type="button" onClick={() => handleAddItemNote(item.id)} disabled={!itemNoteDrafts[item.id]?.trim() || saving === `item-note-${item.id}`} className="px-3 py-2 rounded-lg bg-slate-100 font-bold text-xs disabled:opacity-40">Toevoegen</button>
                                </div>
                              )}
                            </div>
                            <ScoreSelector value={state.score} disabled={!canEdit} onChange={(score) => setItemState((current) => ({ ...current, [item.id]: { ...state, score } }))} />
                            <div>
                              <label className="text-xs font-bold text-slate-500">Toelichting bij actuele score</label>
                              <textarea
                                value={state.comment}
                                disabled={!canEdit}
                                onChange={(event) => setItemState((current) => ({ ...current, [item.id]: { ...state, comment: event.target.value } }))}
                                placeholder="Wat gaat goed en wat vraagt aandacht?"
                                className="w-full min-h-24 mt-1 rounded-lg border border-slate-200 p-3 text-sm disabled:bg-slate-50"
                              />
                              {state.score && <div className="text-[11px] text-slate-400 mt-1">{scoreLabel(state.score)}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {canEdit && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button type="button" onClick={() => handleSaveModule(module)} disabled={saving === `module-${module.id}`} className="bg-[#36563D] text-white rounded-lg px-5 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving === `module-${module.id}` ? 'Opslaan...' : 'Module opslaan'}</button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {activeTab === 'competencies' && (
        <div className="space-y-4">
          <ScoreLegend />
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {detail.competencies.map((competency) => {
              const state = competencyState[competency.id] ?? { score: null, comment: '' };
              return (
                <div key={competency.id} className="p-5 grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_auto_minmax(300px,1.2fr)] gap-4 items-start">
                  <div><div className="font-bold">{competency.title}</div><div className="text-xs text-slate-500 mt-1">{competency.description}</div></div>
                  <ScoreSelector value={state.score} disabled={!canEdit} onChange={(score) => setCompetencyState((current) => ({ ...current, [competency.id]: { ...state, score } }))} />
                  <textarea value={state.comment} disabled={!canEdit} onChange={(event) => setCompetencyState((current) => ({ ...current, [competency.id]: { ...state, comment: event.target.value } }))} placeholder="Toelichting op deze competentie..." className="w-full min-h-24 rounded-lg border border-slate-200 p-3 text-sm disabled:bg-slate-50" />
                </div>
              );
            })}
            {canEdit && <div className="p-4 bg-slate-50 flex justify-end"><button type="button" onClick={handleSaveCompetencies} disabled={saving === 'competencies'} className="bg-[#36563D] text-white rounded-lg px-5 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving === 'competencies' ? 'Opslaan...' : 'Competenties opslaan'}</button></div>}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-5">
          {canEdit && (
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-[#36563D]" /><h2 className="font-bold text-lg">Maandrapport vastleggen</h2></div>
              <p className="text-sm text-slate-500 mt-1">De actuele module- en competentiescores worden als momentopname opgeslagen.</p>
              <div className="grid grid-cols-1 md:grid-cols-[180px_220px_1fr_auto] gap-3 mt-4 items-start">
                <input type="month" value={reportMonth.slice(0, 7)} onChange={(event) => setReportMonth(`${event.target.value}-01`)} className="rounded-lg border border-slate-200 px-3 py-2.5" />
                <select value={reportStatus} onChange={(event) => setReportStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5">
                  {STUDENT_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <textarea value={reportSummary} onChange={(event) => setReportSummary(event.target.value)} placeholder="Samenvatting: groei, sterke punten, aandachtspunten..." className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm" />
                <button type="button" onClick={handleCreateReport} disabled={saving === 'report'} className="bg-[#36563D] text-white rounded-lg px-4 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Vastleggen</button>
              </div>
            </section>
          )}

          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap justify-between gap-3 items-center"><h2 className="font-bold text-lg">Jaarontwikkeling</h2><select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{reportYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
            <MiniLineChart reports={yearReports} />
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-lg">Maandrapporten</h2>
            {yearReports.length === 0 && <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">Geen maandrapporten voor {selectedYear}.</div>}
            {yearReports.map((report) => {
              const moduleAverage = roundOne(average((report.monthly_item_snapshots ?? []).map((entry) => entry.score)));
              const compAverage = roundOne(average((report.monthly_competency_snapshots ?? []).map((entry) => entry.score)));
              return (
                <article key={report.id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex flex-wrap justify-between gap-3"><div><div className="font-bold text-lg capitalize">{formatMonth(report.report_month)}</div><div className="text-xs text-slate-400">Door {report.author?.full_name ?? 'onbekend'} · {formatDateTime(report.created_at)}</div></div><StatusBadge status={report.status} /></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"><AverageCard label="Techniek" value={moduleAverage} subtext={`${report.monthly_item_snapshots?.length ?? 0} onderdelen`} /><AverageCard label="Competenties" value={compAverage} subtext={`${report.monthly_competency_snapshots?.length ?? 0} competenties`} /></div>
                  <p className="text-sm text-slate-600 mt-4 whitespace-pre-wrap">{report.summary || 'Geen samenvatting toegevoegd.'}</p>
                </article>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
