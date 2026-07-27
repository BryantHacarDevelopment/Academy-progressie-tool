import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';

import { supabase, supabaseConfigError } from './supabaseClient';

const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'Jan de Vries',
    photo:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    startDate: '01-09-2025',
    status: 'Loopt voor',
    teacher: 'Mark Visser',
  },
  {
    id: '2',
    name: 'Daan van Dijk',
    photo:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    startDate: '01-11-2025',
    status: 'Op schema',
    teacher: 'Mark Visser',
  },
  {
    id: '3',
    name: 'Sanne Bakker',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    startDate: '15-01-2026',
    status: 'Aandacht nodig',
    teacher: 'Peter Hermans',
  },
];

const MODULES_DATA = [
  {
    id: 'm1',
    title: '1. Persoonlijke veiligheid',
    items: [
      'PBM’s correct gebruiken',
      'Elektrische gevaren herkennen',
      'Spanningsloos werken',
      'Spanningsloosheid controleren',
      'LMRA uitvoeren',
      'Gereedschap vooraf controleren',
      'Veilig samenwerken',
      'Handelen bij noodsituaties',
    ],
  },
  {
    id: 'm2',
    title: '2. Elektrotechniek basis',
    items: [
      'Multimeter gebruiken',
      'Spanningstester gebruiken',
      'Ampèretang gebruiken',
      'Installatietester gebruiken',
      'Aardlektester gebruiken',
      'Isolatieweerstand meten',
      'Handgereedschap gebruiken',
      'Elektrisch gereedschap gebruiken',
    ],
  },
  {
    id: 'm3',
    title: '3. Leiding- en draadwerk',
    items: [
      'Inbouw en opbouw',
      'Buissoort kiezen',
      'Leidingwerk monteren',
      'Inbouwdozen plaatsen',
      'Draad strippen',
      'Draad trekken',
      'Verbindingen maken',
    ],
  },
  {
    id: 'm4',
    title: '4. Groepenkasten (Basis)',
    items: [
      'Hoofdschakelaar herkennen',
      'Aardlekschakelaar herkennen',
      'Installatieautomaat',
      'Componenten monteren',
      'Bedrading aanbrengen',
      'Visuele controle',
    ],
  },
];

function HacarLogo({ className = 'h-12 w-auto' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hacar-logo"
    >
      <rect width="100" height="100" rx="20" fill="#36563D" />
      <path
        d="M30 25V75"
        stroke="#F2C633"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M70 25V75"
        stroke="#F2C633"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M30 50H70"
        stroke="#F2C633"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FullScreenMessage({ title, text }) {
  return (
    <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <HacarLogo className="h-16 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-[#1D252C]">{title}</h1>
        <p className="text-sm text-slate-500 mt-2">{text}</p>
      </div>
    </div>
  );
}

function LoginView({ onLoginSuccess, onOpenDemo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(supabaseConfigError);
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!supabase) {
      setErrorMessage(
        supabaseConfigError || 'De verbinding met Supabase is niet ingesteld.'
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(`Inloggen mislukt: ${error.message}`);
        return;
      }

      if (!data.session || !data.user) {
        setErrorMessage(
          'Supabase heeft geen geldige gebruikerssessie teruggegeven.'
        );
        return;
      }

      onLoginSuccess(data.user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Systeemfout: ${error.message}`
          : 'Er is een onbekende fout ontstaan.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center mb-4">
            <HacarLogo className="h-20 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#1D252C]">
            Hacar Academy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log in met je Supabase-account
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-700 mb-1.5"
            >
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none"
                placeholder="naam@hacar.nl"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-700 mb-1.5"
            >
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full bg-[#36563D] hover:bg-[#2a4330] disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onOpenDemo}
            className="w-full bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Open demonstratie
          </button>
          <p className="text-xs text-center text-slate-400 mt-2">
            De demonstratie gebruikt geen database.
          </p>
        </div>
      </div>
    </div>
  );
}

function normalizeStudent(row) {
  return {
    id: String(row.id),
    name:
      row.name ||
      row.full_name ||
      row.display_name ||
      row.email ||
      'Naam ontbreekt',
    photo: row.photo || row.photo_url || row.avatar_url || '',
    startDate: row.startDate || row.start_date || 'Niet ingevuld',
    status: row.status || 'Actief',
    teacher:
      row.teacher ||
      row.teacher_name ||
      row.instructor_name ||
      'Niet toegewezen',
  };
}

function GroupLineChart() {
  const chartWidth = 800;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;
  const denominator = Math.max(MODULES_DATA.length - 1, 1);

  const data = MODULES_DATA.map((module, index) => ({
    name: `M${index + 1}`,
    average: Math.max(0, 90 - index * 15),
  }));

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <h3 className="text-lg font-bold text-[#1D252C] mb-4">
        Groepsgemiddelde per module
      </h3>

      <div className="min-w-[600px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full h-auto"
          aria-label="Grafiek met groepsgemiddelde per module"
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const y =
              paddingY + chartHeight - (value / 100) * chartHeight;

            return (
              <g key={value}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E5E0D9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fontSize="10"
                  textAnchor="end"
                  fill="#94a3b8"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          <polyline
            points={data
              .map((item, index) => {
                const x =
                  paddingX +
                  index * ((chartWidth - paddingX * 2) / denominator);
                const y =
                  paddingY +
                  chartHeight -
                  (item.average / 100) * chartHeight;
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#36563D"
            strokeWidth="4"
          />

          {data.map((item, index) => {
            const x =
              paddingX +
              index * ((chartWidth - paddingX * 2) / denominator);
            const y =
              paddingY +
              chartHeight -
              (item.average / 100) * chartHeight;

            return (
              <g key={item.name}>
                <circle cx={x} cy={y} r="5" fill="#F2C633" />
                <text
                  x={x}
                  y={chartHeight + 35}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function StudentDashboard({
  students,
  mode,
  loading,
  errorMessage,
  onSelectStudent,
  onOpenAnalysis,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
  }, [searchTerm, students]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">
            Leerlingenoverzicht
          </h2>
          <p className="text-sm text-slate-500">
            {mode === 'ONLINE'
              ? 'Je bent verbonden met Supabase.'
              : 'Je bekijkt demonstratiegegevens.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="bg-white border border-[#36563D] text-[#36563D] font-bold px-4 py-2 rounded-lg flex items-center shadow-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyse
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="bg-[#F2C633] hover:bg-yellow-400 disabled:bg-slate-300 text-[#1D252C] font-bold px-4 py-2 rounded-lg flex items-center shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Vernieuwen
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">De leerlinggegevens konden niet worden geladen.</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Zoek op naam..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#36563D]"
        />
      </div>

      {loading && (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
          Leerlinggegevens worden geladen...
        </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
          {mode === 'ONLINE'
            ? 'Er staan nog geen leerlingen in de tabel students, of je account heeft geen leesrechten.'
            : 'Geen leerlingen gevonden.'}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <button
              type="button"
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="text-left bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] transition-all hover:shadow-md group p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#36563D] text-[#F2C633] flex items-center justify-center text-xl font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D]">
                    {student.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Start: {student.startDate}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between text-xs mb-4 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className="font-bold text-[#36563D]">
                    {student.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block mb-0.5">
                    Begeleider
                  </span>
                  <span className="font-semibold text-[#1D252C]">
                    {student.teacher}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Profiel
                </span>
                <span className="font-bold text-[#36563D] flex items-center">
                  Openen
                  <ChevronRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreButton({ value, selectedValue, onSelect }) {
  const selectedClasses = {
    0: 'bg-slate-400 text-white border-slate-400',
    1: 'bg-[#FE615A] text-white border-[#FE615A]',
    2: 'bg-orange-500 text-white border-orange-500',
    3: 'bg-[#F2C633] text-white border-[#F2C633]',
    4: 'bg-[#3EC55F] text-white border-[#3EC55F]',
  };

  const className =
    selectedValue === value
      ? selectedClasses[value]
      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100';

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-10 h-10 rounded border font-bold ${className}`}
      aria-pressed={selectedValue === value}
    >
      {value}
    </button>
  );
}

function StudentProfile({ studentId, students, onBack }) {
  const student = students.find(
    (candidate) => String(candidate.id) === String(studentId)
  );
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});
  const [saveMessage, setSaveMessage] = useState('');

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-[#36563D] font-bold text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Terug naar overzicht
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          Deze leerling kon niet worden gevonden.
        </div>
      </div>
    );
  }

  function handleLocalSave() {
    sessionStorage.setItem(
      `hacar-academy-scores-${student.id}`,
      JSON.stringify(scores)
    );
    setSaveMessage(
      'De scores zijn tijdelijk in deze browsersessie bewaard. Voor permanente opslag is een scores-tabel in Supabase nodig.'
    );
  }

  useEffect(() => {
    const savedScores = sessionStorage.getItem(
      `hacar-academy-scores-${student.id}`
    );

    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch {
        sessionStorage.removeItem(`hacar-academy-scores-${student.id}`);
      }
    }
  }, [student.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-[#36563D] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Terug naar overzicht
        </button>

        <button
          type="button"
          onClick={handleLocalSave}
          className="flex items-center justify-center bg-[#36563D] hover:bg-[#2a4330] text-white px-4 py-2 rounded-lg font-bold text-sm shadow"
        >
          <Save className="w-4 h-4 mr-2" />
          Scores tijdelijk bewaren
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm">
          {saveMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
        {student.photo ? (
          <img
            src={student.photo}
            alt=""
            className="w-20 h-20 rounded-full border-4 border-slate-50 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#36563D] text-[#F2C633] flex items-center justify-center text-3xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1D252C]">
              {student.name}
            </h2>
            <p className="text-sm text-slate-500">Academy Basis</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">
              Docent
            </p>
            <p className="font-semibold text-sm">{student.teacher}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">
              Status
            </p>
            <p className="font-semibold text-sm text-[#36563D]">
              {student.status}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-medium">
        <span className="text-[#1D252C] font-bold uppercase tracking-wide mr-2">
          Legenda:
        </span>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded bg-slate-400 mr-1.5" />
          0 = Nog niet
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded bg-[#FE615A] mr-1.5" />
          1 = Niet beheerst
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded bg-orange-500 mr-1.5" />
          2 = Begeleiding
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded bg-[#F2C633] mr-1.5" />
          3 = Grotendeels
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded bg-[#3EC55F] mr-1.5" />
          4 = Zelfstandig
        </div>
      </div>

      <div className="space-y-4">
        {MODULES_DATA.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedModule((current) =>
                  current === module.id ? null : module.id
                )
              }
              className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-slate-50 border-b border-slate-100"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-[#36563D]">
                  {module.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:block">
                  {module.items.length} onderdelen
                </span>
              </div>

              {expandedModule === module.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedModule === module.id && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <tbody className="divide-y divide-slate-50">
                    {module.items.map((item, index) => {
                      const itemKey = `${module.id}-${index}`;

                      return (
                        <tr key={itemKey} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-700 w-1/2">
                            {item}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1.5 p-1 bg-slate-100/50 rounded-lg inline-flex">
                              {[0, 1, 2, 3, 4].map((value) => (
                                <ScoreButton
                                  key={value}
                                  value={value}
                                  selectedValue={scores[itemKey]}
                                  onSelect={(newValue) =>
                                    setScores((current) => ({
                                      ...current,
                                      [itemKey]: newValue,
                                    }))
                                  }
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisView({ onBack }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-[#36563D] font-bold text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Terug naar dashboard
      </button>

      <h2 className="text-2xl font-bold text-[#1D252C] mb-6">
        Analyse en trends
      </h2>

      <GroupLineChart />
    </div>
  );
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('OFFLINE');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        console.error('Sessie kon niet worden hersteld:', error);
      }

      setUser(data.session?.user ?? null);
      setMode(data.session?.user ? 'ONLINE' : 'OFFLINE');
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setUser(session?.user ?? null);
      setMode(session?.user ? 'ONLINE' : 'OFFLINE');
      setAuthLoading(false);

      if (!session) {
        setStudents([]);
        setSelectedStudentId(null);
        setCurrentView('DASHBOARD');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadStudents() {
    if (mode === 'DEMO') {
      setStudents(MOCK_STUDENTS);
      setStudentsError('');
      return;
    }

    if (!supabase || !user) {
      setStudents([]);
      return;
    }

    setStudentsLoading(true);
    setStudentsError('');

    try {
      const { data, error } = await supabase.from('students').select('*');

      if (error) {
        throw error;
      }

      const normalizedStudents = (data ?? [])
        .map(normalizeStudent)
        .sort((a, b) => a.name.localeCompare(b.name, 'nl'));

      setStudents(normalizedStudents);
    } catch (error) {
      console.error('Leerlingen ophalen mislukt:', error);
      setStudents([]);
      setStudentsError(
        error instanceof Error
          ? error.message
          : 'Onbekende fout bij het ophalen van leerlingen.'
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  useEffect(() => {
    if (user && mode === 'ONLINE') {
      loadStudents();
    } else if (mode === 'DEMO') {
      setStudents(MOCK_STUDENTS);
      setStudentsError('');
    }
  }, [user, mode]);

  async function handleLogout() {
    if (mode === 'ONLINE' && supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Uitloggen mislukt:', error);
        window.alert(`Uitloggen mislukt: ${error.message}`);
        return;
      }
    }

    setUser(null);
    setMode('OFFLINE');
    setStudents([]);
    setSelectedStudentId(null);
    setCurrentView('DASHBOARD');
  }

  if (authLoading) {
    return (
      <FullScreenMessage
        title="Hacar Academy"
        text="Je bestaande inlogsessie wordt gecontroleerd..."
      />
    );
  }

  if (!user) {
    return (
      <LoginView
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setMode('ONLINE');
        }}
        onOpenDemo={() => {
          setUser({ id: 'demo-user', email: 'demo@hacar.nl' });
          setMode('DEMO');
          setStudents(MOCK_STUDENTS);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] font-['Poppins',sans-serif] text-[#1D252C]">
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <button
            type="button"
            className="flex items-center space-x-3"
            onClick={() => {
              setCurrentView('DASHBOARD');
              setSelectedStudentId(null);
            }}
          >
            <div className="bg-white p-1 rounded shadow-sm flex">
              <HacarLogo className="h-8 w-auto" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Hacar <span className="text-[#F2C633]">Academy</span>
            </h1>
          </button>

          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                mode === 'ONLINE'
                  ? 'bg-[#3EC55F]/20 border-[#3EC55F] text-[#3EC55F]'
                  : 'bg-[#F2C633]/20 border-[#F2C633] text-[#F2C633]'
              }`}
            >
              {mode === 'ONLINE' ? 'VERBONDEN' : 'DEMO'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-[#F2C633] font-bold text-sm flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main>
        {currentView === 'DASHBOARD' && !selectedStudentId && (
          <StudentDashboard
            students={students}
            mode={mode}
            loading={studentsLoading}
            errorMessage={studentsError}
            onSelectStudent={(id) => {
              setSelectedStudentId(id);
              setCurrentView('PROFILE');
            }}
            onOpenAnalysis={() => setCurrentView('ANALYSIS')}
            onRefresh={loadStudents}
          />
        )}

        {currentView === 'PROFILE' && selectedStudentId && (
          <StudentProfile
            studentId={selectedStudentId}
            students={students}
            onBack={() => {
              setSelectedStudentId(null);
              setCurrentView('DASHBOARD');
            }}
          />
        )}

        {currentView === 'ANALYSIS' && (
          <AnalysisView onBack={() => setCurrentView('DASHBOARD')} />
        )}
      </main>
    </div>
  );
}
