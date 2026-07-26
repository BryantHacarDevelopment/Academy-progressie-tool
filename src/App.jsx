import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, LogOut, ShieldCheck, BarChart3, UserPlus, 
  Search, Filter, Calendar, Award, Clock, ChevronRight, 
  ArrowLeft, Save, CheckCircle2, BookOpen, FileText, 
  ChevronUp, ChevronDown, TrendingUp, Minus, MessageSquare, Lock, Mail, X
} from 'lucide-react';

if (typeof document !== 'undefined' && !document.getElementById('poppins-font-link')) {
  const link = document.createElement('link');
  link.id = 'poppins-font-link';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

if (typeof document !== 'undefined' && !document.getElementById('supabase-js-script')) {
  const script = document.createElement('script');
  script.id = 'supabase-js-script';
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  document.head.appendChild(script);
}

const getSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    const envUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : (window.VITE_SUPABASE_URL || '');
    const envKey = typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : (window.VITE_SUPABASE_ANON_KEY || '');
    if (envUrl && envKey) {
      return window.supabase.createClient(envUrl, envKey);
    }
  }
  return null;
};

const MODULES_DATA = [
  { id: 'm1', title: '1. Persoonlijke veiligheid', items: ['PBM’s correct gebruiken', 'Elektrische gevaren herkennen', 'Spanningsloos werken', 'Spanningsloosheid controleren', 'LMRA uitvoeren', 'Gereedschap vooraf controleren', 'Veilig samenwerken', 'Handelen bij noodsituaties'] },
  { id: 'm2', title: '2. Elektrotechniek basisvaardigheden', items: ['Multimeter gebruiken', 'Tweepolige spanningstester gebruiken', 'Ampèretang gebruiken', 'Installatietester gebruiken', 'Aardlektester gebruiken', 'Isolatieweerstand meten', 'Handgereedschap gebruiken', 'Elektrisch gereedschap gebruiken', 'Kabels, draden en materialen herkennen'] },
  { id: 'm3', title: '3. Monteren van leiding- en draadwerk', items: ['Inbouw en opbouw onderscheiden', 'Juiste buissoort kiezen', 'Buisdiameter en buisvulling bepalen', 'Leidingwerk monteren', 'Inbouwdozen plaatsen', 'Lasdozen en kabeldozen toepassen', 'Juiste draadkleuren gebruiken', 'Draad correct strippen', 'Installatiedraad trekken', 'Elektrische verbindingen maken', 'Leidingwerk controleren en netjes afwerken'] }
];

const COMPETENCIES = [
  'Veiligheidsbewustzijn', 'Leervermogen', 'Zelfredzaamheid', 'Zelfstandigheid',
  'Organisatorisch vermogen', 'Nauwkeurigheid en kwaliteitsbewustzijn',
  'Probleemoplossend vermogen', 'Communicatieve en sociale vaardigheden',
  'Samenwerken', 'Professionele houding en verantwoordelijkheid'
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

function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSupabaseLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const supabase = getSupabaseClient();

    if (!supabase) {
      setErrorMsg('Geen database verbinding gevonden. Werken de sleutels in Vercel?');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

      onLogin({
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'DOCENT',
        name: profile?.full_name || data.user.email.split('@')[0]
      });
    } catch (err) {
      setErrorMsg('Inloggen mislukt. Controleer je e-mail en wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center p-4 font-['Poppins',sans-serif]">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-6">
          <div className="mx-auto flex justify-center mb-4"><HacarLogo className="h-24 w-auto" /></div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Hacar Academy</h1>
          <p className="text-xs text-slate-500 mt-1">Log in met je account</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /><span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSupabaseLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm disabled:opacity-70">
            {loading ? <span>Laden...</span> : <><ShieldCheck className="w-5 h-5" /><span>Inloggen</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ onSelectStudent, students, onRefresh, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentDate, setNewStudentDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentDate) return;
    setIsAdding(true);
    
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('students').insert([{
          name: newStudentName,
          start_date: newStudentDate,
          teacher: currentUser.name
        }]);
        if (!error) {
          setIsModalOpen(false);
          setNewStudentName('');
          setNewStudentDate('');
          onRefresh(); // Haal nieuwe data op
        } else {
          alert('Fout bij toevoegen: ' + error.message);
        }
      } catch(err) {
        console.error(err);
      }
    }
    setIsAdding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-['Poppins',sans-serif] relative">
      
      {/* ADD STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center bg-[#36563D] text-white">
              <h3 className="font-bold">Nieuwe Leerling Toevoegen</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Volledige Naam</label>
                <input type="text" required value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Bijv. Jan de Vries" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Startdatum</label>
                <input type="date" required value={newStudentDate} onChange={e=>setNewStudentDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">Annuleren</button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 bg-[#36563D] text-white rounded-lg text-sm font-semibold">
                  {isAdding ? 'Bezig...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">Leerlingenoverzicht</h2>
          <p className="text-sm text-slate-500">Beheer de actuele ontwikkeling van deelnemers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm text-sm">
           <UserPlus className="w-4 h-4" />
           <span>Nieuwe Leerling</span>
        </button>
      </div>

      {/* ZOEKBALK */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Zoek op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-[#E5E0D9] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#36563D]" />
        </div>
      </div>

      {/* STUDENT CARDS */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
           <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-[#1D252C] mb-2">Nog geen leerlingen gevonden</h3>
           <p className="text-sm text-slate-500 mb-6">Voeg je eerste leerling toe om te starten met de voortgangsregistratie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] transition-all cursor-pointer p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img src={student.photo} alt={student.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#E5E0D9]" />
                  <div>
                    <h3 className="text-lg font-bold text-[#1D252C]">{student.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">Start: {student.start_date}</p>
                  </div>
                </div>
              </div>
              <hr className="my-4 border-[#E5E0D9]" />
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-[#E5E0D9] text-xs">
                <div><span className="text-slate-400 block mb-0.5">Begeleider</span><span className="font-semibold text-[#1D252C]">{student.teacher}</span></div>
                <div><span className="text-slate-400 block mb-0.5">Status</span><span className="font-semibold text-emerald-600">{student.status}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentProfile({ studentId, onBack, students }) {
  const student = students.find(s => s.id === studentId);
  const [activeTab, setActiveTab] = useState('modules');
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchScores() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data } = await supabase.from('scores').select('*').eq('student_id', studentId);
      if (data) {
        const loadedScores = {};
        data.forEach(item => { loadedScores[item.item_id] = item.score; });
        setScores(loadedScores);
      }
    }
    fetchScores();
  }, [studentId]);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const updates = Object.keys(scores).map(itemId => ({
          student_id: studentId,
          item_id: itemId,
          score: scores[itemId]
        }));
        if (updates.length > 0) {
          await supabase.from('scores').upsert(updates, { onConflict: 'student_id,item_id' });
        }
        alert('Score opgeslagen!');
      } catch (err) {}
    }
    setIsSaving(false);
  };

  if(!student) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-['Poppins',sans-serif]">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug
        </button>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2 bg-[#36563D] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm">
          <Save className="w-4 h-4" /> <span>{isSaving ? 'Opslaan...' : 'Opslaan'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex gap-6 items-start">
        <img src={student.photo} alt={student.name} className="w-24 h-24 rounded-full border-4 border-[#E5E0D9] shadow-sm" />
        <div>
          <h2 className="text-xl font-bold text-[#1D252C]">{student.name}</h2>
          <p className="text-sm text-slate-500 mb-2">Docent: {student.teacher}</p>
          <span className="px-2.5 py-1 bg-[#3EC55F]/20 text-[#36563D] rounded-full text-xs font-bold border border-[#3EC55F]">{student.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {MODULES_DATA.map((module) => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)} className="w-full px-6 py-4 flex justify-between bg-white hover:bg-slate-50">
              <h3 className="text-lg font-bold text-[#36563D]">{module.title}</h3>
              {expandedModule === module.id ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
            </button>

            {expandedModule === module.id && (
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {module.items.map((item, idx) => {
                      const itemKey = `${module.id}-${idx}`;
                      const score = scores[itemKey];
                      return (
                        <tr key={itemKey} className="hover:bg-slate-50">
                          <td className="px-6 py-4">{item}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {[0, 1, 2, 3, 4].map(num => (
                                <button key={num} onClick={() => setScores(p => ({...p, [itemKey]: num}))}
                                  className={`w-8 h-8 rounded border text-xs font-bold ${score === num ? 'bg-[#36563D] text-white' : 'bg-white text-slate-400'}`}>
                                  {num}
                                </button>
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

export default function App() {
  const [user, setUser] = useState(null); 
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const loadStudents = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  useEffect(() => {
    if (user) loadStudents();
  }, [user]);

  if (!user) return <LoginView onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#E5E0D9] text-[#1D252C]">
      <header className="bg-[#36563D] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedStudentId(null)}>
            <div className="bg-white p-1 rounded"><HacarLogo className="h-8 w-auto" /></div>
            <h1 className="text-xl font-bold">Hacar <span className="text-[#F2C633]">Academy</span></h1>
          </div>
          <button onClick={() => setUser(null)} className="hover:text-[#F2C633] text-sm font-medium"><LogOut className="w-4 h-4 inline mr-1" /> Uitloggen</button>
        </div>
      </header>

      {!selectedStudentId ? (
         <StudentDashboard onSelectStudent={setSelectedStudentId} students={students} onRefresh={loadStudents} currentUser={user} />
      ) : (
         <StudentProfile studentId={selectedStudentId} onBack={() => { setSelectedStudentId(null); loadStudents(); }} students={students} />
      )}
    </div>
  );
}
