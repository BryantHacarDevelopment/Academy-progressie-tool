import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, LogOut, ShieldCheck, UserPlus, 
  Search, Calendar, ArrowLeft, X, Mail, Lock,
  BarChart3, Filter, Award, Clock, ChevronRight,
  Save, CheckCircle2, BookOpen, FileText, ChevronUp, ChevronDown,
  TrendingUp, Minus, MessageSquare
} from 'lucide-react';

// Database is keihard AAN. Supabase import via ESM module om build-crashes te voorkomen.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let supabase = null;
let systemError = '';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();

const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();
  
  // Deze regel repareert automatisch Vercel URL fouten (verwijdert slashes en /rest/v1)
  const cleanUrl = rawUrl.toString().trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '');
  const cleanKey = rawKey.toString().trim();
  
  if (!cleanUrl || !cleanKey) {
    systemError = 'Sleutels ontbreken in Vercel. Controleer de instellingen.';
  } else {
    supabase = createClient(cleanUrl, cleanKey);
  }
} catch (err) {
  systemError = 'Configuratiefout: ' + err.message;
}

const MOCK_STUDENTS = [
  { id: '1', name: 'Jan de Vries', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', startDate: '01-09-2025', currentMonth: 6, progressPercentage: 78, competencyScore: 2.7, lastUpdated: '22-07-2026', status: 'Loopt voor', teacher: 'Mark Visser' },
  { id: '2', name: 'Daan van Dijk', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', startDate: '01-11-2025', currentMonth: 4, progressPercentage: 52, competencyScore: 2.1, lastUpdated: '18-07-2026', status: 'Op schema', teacher: 'Mark Visser' },
  { id: '3', name: 'Sanne Bakker', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', startDate: '15-01-2026', currentMonth: 2, progressPercentage: 25, competencyScore: 1.6, lastUpdated: '10-07-2026', status: 'Aandacht nodig', teacher: 'Peter Hermans' }
];

const MODULES_DATA = [
  { id: 'm1', title: '1. Persoonlijke veiligheid', items: ['PBM’s correct gebruiken', 'Elektrische gevaren herkennen', 'Spanningsloos werken', 'Spanningsloosheid controleren', 'LMRA uitvoeren', 'Gereedschap vooraf controleren', 'Veilig samenwerken', 'Handelen bij noodsituaties'] },
  { id: 'm2', title: '2. Elektrotechniek basis', items: ['Multimeter gebruiken', 'Spanningstester gebruiken', 'Ampèretang gebruiken', 'Installatietester gebruiken', 'Aardlektester gebruiken', 'Isolatieweerstand meten', 'Handgereedschap gebruiken', 'Elektrisch gereedschap gebruiken'] },
  { id: 'm3', title: '3. Leiding- en draadwerk', items: ['Inbouw en opbouw', 'Buissoort kiezen', 'Leidingwerk monteren', 'Inbouwdozen plaatsen', 'Draad strippen', 'Draad trekken', 'Verbindingen maken'] },
  { id: 'm4', title: '4. Groepenkasten (Basis)', items: ['Hoofdschakelaar herkennen', 'Aardlekschakelaar herkennen', 'Installatieautomaat', 'Componenten monteren', 'Bedrading aanbrengen', 'Visuele controle'] }
];

const COMPETENCIES = [
  'Veiligheidsbewustzijn', 'Leervermogen', 'Zelfstandigheid',
  'Nauwkeurigheid', 'Probleemoplossend vermogen', 'Samenwerken'
];

function HacarLogo({ className = "h-12 w-auto" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#36563D"/>
      <path d="M30 25V75" stroke="#F2C633" strokeWidth="12" strokeLinecap="round"/>
      <path d="M70 25V75" stroke="#F2C633" strokeWidth="12" strokeLinecap="round"/>
      <path d="M30 50H70" stroke="#F2C633" strokeWidth="12" strokeLinecap="round"/>
    </svg>
  );
}

function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
           setErrorMsg('Inloggen mislukt: ' + error.message);
        } else if (data.session) {
           // Succes! Direct doorsturen naar de portaal-weergave.
           onLoginSuccess({ email }, 'ONLINE');
        }
      } catch (err) {
        setErrorMsg('Systeemfout: ' + err.message);
      }
    } else {
      setErrorMsg(systemError || 'Database momenteel niet bereikbaar.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center mb-4"><HacarLogo className="h-20 w-auto" /></div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Hacar Academy</h1>
          <p className="text-sm text-slate-500 mt-1">Log in op je account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 text-center">
            <AlertCircle className="w-5 h-5 mx-auto mb-1 inline-block" /> <br/>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" placeholder="naam@hacar.nl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm">
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
           <button type="button" onClick={() => onLoginSuccess({ email: 'demo@hacar.nl' }, 'DEMO')} className="w-full bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
             <BarChart3 className="w-4 h-4"/> Noodknop: Open Portaal (Offline)
           </button>
           <p className="text-xs text-center text-slate-400 mt-2">Start het systeem in offline modus indien inloggen niet werkt.</p>
        </div>
      </div>
    </div>
  );
}

function GroupLineChart() {
  const chartW = 800;
  const chartH = 200;
  const paddingX = 40;
  const paddingY = 20;

  const data = MODULES_DATA.map((m, i) => {
    const avg = Math.max(0, 90 - (i * 15));
    return { name: `M${i+1}`, avg };
  });

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <h3 className="text-lg font-bold text-[#1D252C] mb-4">Groepsgemiddelde per Module</h3>
      <div className="min-w-[600px]">
        <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} className="w-full h-auto">
          {[0, 25, 50, 75, 100].map(val => (
            <g key={val}>
              <line x1={paddingX} y1={paddingY + chartH - (val/100)*chartH} x2={chartW - paddingX} y2={paddingY + chartH - (val/100)*chartH} stroke="#E5E0D9" strokeWidth="1" />
              <text x={paddingX - 10} y={paddingY + chartH - (val/100)*chartH + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{val}%</text>
            </g>
          ))}
          <polyline points={data.map((d, i) => `${paddingX + (i * ((chartW - paddingX*2) / 3))},${paddingY + chartH - (d.avg / 100) * chartH}`).join(" ")} fill="none" stroke="#36563D" strokeWidth="4" />
          {data.map((d, i) => (
             <circle key={i} cx={paddingX + (i * ((chartW - paddingX*2) / 3))} cy={paddingY + chartH - (d.avg / 100) * chartH} r="5" fill="#F2C633" />
          ))}
        </svg>
      </div>
    </div>
  );
}

function StudentDashboard({ onSelectStudent, students, goAnalysis, onRefresh, mode }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Verzeker dat studentList een array is. Val terug op MOCK als leeg/undefined.
  let studentList = (Array.isArray(students) && students.length > 0) ? students : (mode === 'DEMO' ? MOCK_STUDENTS : []);
  // Als we online zijn, maar er is écht nog geen data opgeslagen, geef dan de mock data weer ter demonstratie.
  if (mode === 'ONLINE' && studentList.length === 0) studentList = MOCK_STUDENTS;
  
  const filteredStudents = studentList.filter(s => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">Leerlingenoverzicht</h2>
          <p className="text-sm text-slate-500">Beheer alle actieve leertrajecten ({mode}-modus).</p>
        </div>
        <div className="flex gap-2">
           <button onClick={goAnalysis} className="bg-white border border-[#36563D] text-[#36563D] font-bold px-4 py-2 rounded-lg flex items-center shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" /> Analyse
           </button>
           <button onClick={onRefresh} className="bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] font-bold px-4 py-2 rounded-lg flex items-center shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" /> Vernieuw / Nieuw
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="Zoek op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#36563D]" />
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
           Geen leerlingen gevonden. Probeer een andere zoekterm.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] transition-all hover:shadow-md cursor-pointer group p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img src={student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
              <div>
                <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D]">{student.name}</h3>
                <p className="text-xs text-slate-500">Start: {student.startDate || student.start_date || 'N.v.t.'}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between text-xs mb-4">
               <div><span className="text-slate-400 block mb-0.5">Status</span><span className="font-bold text-[#36563D]">{student.status || 'Actief'}</span></div>
               <div><span className="text-slate-400 block mb-0.5">Begeleider</span><span className="font-semibold text-[#1D252C]">{student.teacher || 'Niet toegewezen'}</span></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Opgeslagen</span>
              <span className="font-bold text-[#36563D] flex items-center">Open Profiel <ChevronRight className="w-3 h-3 ml-1"/></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentProfile({ studentId, onBack, students }) {
  // Zorg altijd voor een geldige student, val terug op MOCK
  const studentList = (Array.isArray(students) && students.length > 0) ? students : MOCK_STUDENTS;
  const student = studentList.find(s => s.id === studentId) || MOCK_STUDENTS[0];
  
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] font-bold text-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug naar overzicht
        </button>
        <button onClick={() => alert("Wijzigingen bewaard in huidige sessie!")} className="flex items-center bg-[#36563D] hover:bg-[#2a4330] text-white px-4 py-2 rounded-lg font-bold text-sm shadow">
           <Save className="w-4 h-4 mr-2" /> Opslaan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
        <img src={student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="" className="w-20 h-20 rounded-full border-4 border-slate-50 object-cover" />
        <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-4">
          <div><h2 className="text-2xl font-bold text-[#1D252C]">{student.name}</h2><p className="text-sm text-slate-500">Academy Basis</p></div>
          <div><p className="text-xs text-slate-400 uppercase font-bold mb-1">Docent</p><p className="font-semibold text-sm">{student.teacher || 'Toegewezen'}</p></div>
          <div><p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p><p className="font-semibold text-sm text-[#3EC55F]">{student.status || 'Actief'}</p></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-medium">
          <span className="text-[#1D252C] font-bold uppercase tracking-wide mr-2">Legenda:</span>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-slate-400 mr-1.5"></span> 0 = Nog niet</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#FE615A] mr-1.5"></span> 1 = Niet beheerst</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-orange-500 mr-1.5"></span> 2 = Begeleiding</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#F2C633] mr-1.5"></span> 3 = Grotendeels</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#3EC55F] mr-1.5"></span> 4 = Zelfstandig</div>
        </div>

        {MODULES_DATA.map(module => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)} className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-slate-50 border-b border-slate-100">
               <div className="flex items-center gap-4">
                 <h3 className="text-lg font-bold text-[#36563D]">{module.title}</h3>
                 <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:block">{module.items.length} items</span>
               </div>
               {expandedModule === module.id ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
            </button>
            {expandedModule === module.id && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <tbody className="divide-y divide-slate-50">
                    {module.items.map((item, idx) => {
                      const itemKey = `${module.id}-${idx}`;
                      return (
                        <tr key={itemKey} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-700 w-1/2">{item}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1.5 p-1 bg-slate-100/50 rounded-lg inline-flex">
                              {[0, 1, 2, 3, 4].map(num => {
                                 let colorClass = "bg-white text-slate-400 border-slate-200 hover:bg-slate-100";
                                 if (scores[itemKey] === num) {
                                     if(num === 0) colorClass = "bg-slate-400 text-white border-slate-400";
                                     if(num === 1) colorClass = "bg-[#FE615A] text-white border-[#FE615A]";
                                     if(num === 2) colorClass = "bg-orange-500 text-white border-orange-500";
                                     if(num === 3) colorClass = "bg-[#F2C633] text-white border-[#F2C633]";
                                     if(num === 4) colorClass = "bg-[#3EC55F] text-white border-[#3EC55F]";
                                 }
                                 return (
                                  <button key={num} onClick={() => setScores({...scores, [itemKey]: num})} className={`w-10 h-10 rounded border font-bold ${colorClass}`}>
                                    {num}
                                  </button>
                                 );
                              })}
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
       <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] font-bold text-sm mb-6">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug naar Dashboard
       </button>
       <h2 className="text-2xl font-bold text-[#1D252C] mb-6">Analyse & Trends</h2>
       <GroupLineChart />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null); 
  const [mode, setMode] = useState('OFFLINE'); 
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD'); 

  // Laad data na het inloggen
  useEffect(() => {
    if (user && mode === 'ONLINE' && supabase) {
       loadStudents();
    } else if (user && mode === 'DEMO') {
       setStudents(MOCK_STUDENTS);
    }
  }, [user, mode]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (data) setStudents(data);
    } catch(e) {
      console.log('Fout bij ophalen van data.');
    }
  };

  const handleRefresh = () => {
     if (mode === 'ONLINE') {
         loadStudents();
         alert("Data opnieuw geladen.");
     } else {
         alert("In Demo-modus.");
     }
  };

  // Laat login scherm zien zolang er geen user is
  if (!user) return <LoginView onLoginSuccess={(u, m) => { setUser(u); setMode(m); }} />;

  // De hoofdapplicatie na inloggen
  return (
    <div className="min-h-screen bg-[#E5E0D9] font-['Poppins',sans-serif] text-[#1D252C]">
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {setCurrentView('DASHBOARD'); setSelectedStudentId(null);}}>
            <div className="bg-white p-1 rounded shadow-sm flex"><HacarLogo className="h-8 w-auto" /></div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Hacar <span className="text-[#F2C633]">Academy</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${mode === 'ONLINE' ? 'bg-[#3EC55F]/20 border-[#3EC55F] text-[#3EC55F]' : 'bg-[#F2C633]/20 border-[#F2C633] text-[#F2C633]'}`}>
               {mode === 'ONLINE' ? 'VERBONDEN' : 'DEMO MODUS'}
            </span>
            <button onClick={() => setUser(null)} className="hover:text-[#F2C633] font-bold text-sm flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main>
        {currentView === 'DASHBOARD' && !selectedStudentId && (
           <StudentDashboard 
             onSelectStudent={(id) => { setSelectedStudentId(id); setCurrentView('PROFILE'); }} 
             goAnalysis={() => setCurrentView('ANALYSIS')}
             students={students}
             mode={mode}
             onRefresh={handleRefresh}
           />
        )}
        
        {currentView === 'PROFILE' && selectedStudentId && (
           <StudentProfile 
             studentId={selectedStudentId} 
             students={students}
             onBack={() => { setSelectedStudentId(null); setCurrentView('DASHBOARD'); }} 
           />
        )}

        {currentView === 'ANALYSIS' && <AnalysisView onBack={() => setCurrentView('DASHBOARD')} />}
      </main>
    </div>
  );
}
