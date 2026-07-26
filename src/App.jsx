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

const MOCK_STUDENTS = [
  { id: '1', name: 'Demo Data (Database nog niet gekoppeld)', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', start_date: '01-09-2025', current_month: 1, status: 'Op schema', teacher: 'Systeem' }
];

const MODULES_DATA = [
  { id: 'm1', title: '1. Persoonlijke veiligheid', items: ['PBM’s correct gebruiken', 'Elektrische gevaren herkennen', 'Spanningsloos werken', 'Spanningsloosheid controleren', 'LMRA uitvoeren', 'Gereedschap vooraf controleren', 'Veilig samenwerken', 'Handelen bij noodsituaties'] },
  { id: 'm2', title: '2. Elektrotechniek basisvaardigheden', items: ['Multimeter gebruiken', 'Tweepolige spanningstester gebruiken', 'Ampèretang gebruiken', 'Installatietester gebruiken', 'Aardlektester gebruiken', 'Isolatieweerstand meten', 'Handgereedschap gebruiken', 'Elektrisch gereedschap gebruiken', 'Kabels, draden en materialen herkennen'] },
  { id: 'm3', title: '3. Monteren van leiding- en draadwerk', items: ['Inbouw en opbouw onderscheiden', 'Juiste buissoort kiezen', 'Buisdiameter en buisvulling bepalen', 'Leidingwerk monteren', 'Inbouwdozen plaatsen', 'Lasdozen en kabeldozen toepassen', 'Juiste draadkleuren gebruiken', 'Draad correct strippen', 'Installatiedraad trekken', 'Elektrische verbindingen maken', 'Leidingwerk controleren en netjes afwerken'] },
  { id: 'm4', title: '4. Wisselspanning en gelijkspanning', items: ['AC en DC onderscheiden', 'Toepassingen herkennen', 'Polariteit begrijpen', 'Juiste meetinstelling kiezen', 'AC meten', 'DC meten', 'Omvormers, gelijkrichters en voedingen herkennen'] },
  { id: 'm5', title: '5. Elektrische grootheden en formules', items: ['Spanning herkennen', 'Stroom herkennen', 'Weerstand herkennen', 'Vermogen herkennen', 'Eenheden toepassen', 'P = U × I gebruiken', 'Eenvoudige berekeningen uitvoeren', 'Meetwaarde met berekening vergelijken'] },
  { id: 'm6', title: '6. Schakelingen, schema’s en symbolen', items: ['Elektrische symbolen herkennen', 'Eenvoudige tekening lezen', 'Eenvoudig schema tekenen', 'Serieschakeling begrijpen', 'Parallelschakeling begrijpen', 'Enkelpolige schakeling maken', 'Wisselschakeling maken', 'Kruisschakeling maken', 'Schakeling testen', 'Eenvoudige fout opsporen'] },
  { id: 'm7', title: '7. Rookmelders', items: ['Rookmelder correct plaatsen', 'Rookmelder testen', 'Levensduur en vervangingsdatum controleren'] },
  { id: 'm8', title: '8. Verlichting', items: ['Type armatuur herkennen', 'Geschikt armatuur selecteren', 'Armatuur monteren', 'Armatuur elektrisch aansluiten', 'Aarde correct aansluiten', 'Verlichting testen', 'Eenvoudige storing herkennen', 'Werk netjes opleveren'] },
  { id: 'm9', title: '9. Noodverlichting', items: ['Functie van noodverlichting uitleggen', 'Type noodverlichting herkennen', 'Armatuur inspecteren', 'Noodfunctie testen', 'Accu of batterij controleren', 'Volledige test uitvoeren', 'Keurings- of afkeurstatus vastleggen', 'Armatuurnummer registreren', 'Logboek of looplijst invullen', 'Foto’s correct vastleggen'] },
  { id: 'm10', title: '10. Groepenkasten', items: ['Hoofdschakelaar herkennen', 'Aardlekschakelaar herkennen', 'Installatieautomaat herkennen', 'Aardlekautomaat herkennen', 'Functie van componenten uitleggen', 'Indeling van een groepenkast begrijpen', 'Componenten monteren', 'Bedrading aanbrengen', 'Juiste kleuren en doorsneden toepassen', 'Eenvoudige groep aansluiten', 'Visuele eindcontrole uitvoeren', 'Metingen onder begeleiding uitvoeren'] },
  { id: 'm11', title: '11. Aarding en aardlekschakelaars', items: ['Doel van aarding begrijpen', 'Aardverbinding maken', 'Vereffening herkennen', 'Centraal aardpunt herkennen', 'Badkamerzones herkennen', 'Aardlekschakelaar herkennen', 'Werking aardlekschakelaar uitleggen', 'Aardlektest uitvoeren'] },
  { id: 'm12', title: '12. Bel- en deuropenerinstallaties', items: ['Onderdelen herkennen', 'Transformator herkennen', 'Drukknop aansluiten', 'Bel aansluiten', 'Deuropener aansluiten', 'Eenvoudig schema lezen', 'Installatie testen', 'Eenvoudige storing herkennen'] },
  { id: 'm13', title: '13. UTP en data', items: ['UTP-kabel herkennen', 'Categorieën en toepassingen herkennen', 'Kleurcode toepassen', 'Kabel correct aanleggen', 'Kabel afwerken', 'Connector of wandcontactdoos aansluiten', 'Verbinding testen', 'Beschadiging en storingen herkennen'] },
  { id: 'm14', title: '14. Relais- en magneetschakelingen', items: ['Relais herkennen', 'Spoelaansluitingen herkennen', 'Maakcontact herkennen', 'Verbreekcontact herkennen', 'Wisselcontact herkennen', 'Eenvoudig relaisschema lezen', 'Relaisschakeling bouwen', 'Schakeling testen', 'Eenvoudige storing analyseren', 'Werking van de schakeling uitleggen'] }
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

function GroupLineChart() {
  const chartW = 800;
  const chartH = 250;
  const paddingX = 40;
  const paddingY = 20;

  const data = MODULES_DATA.map((m, i) => {
    const avg = Math.round(Math.max(0, 90 - (i * 5)));
    return { name: `M${i+1}`, avg };
  });

  const getPoints = (key) => data.map((d, i) => `${paddingX + (i * ((chartW - paddingX*2) / 13))},${paddingY + chartH - (d[key] / 100) * chartH}`).join(" ");

  return (
    <div className="overflow-x-auto w-full bg-white p-6 rounded-xl border border-slate-200 mb-6 shadow-sm font-['Poppins',sans-serif]">
      <h3 className="text-lg font-bold text-[#1D252C] mb-4">Groepstrend per Module</h3>
      <div className="flex gap-4 mb-4 text-xs font-semibold">
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#36563D] mr-1"></span> Klas Gemiddelde</span>
      </div>
      <div className="min-w-[700px]">
        <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} className="w-full h-auto text-[#1D252C]">
          {[0, 25, 50, 75, 100].map(val => (
            <g key={val}>
              <line x1={paddingX} y1={paddingY + chartH - (val/100)*chartH} x2={chartW - paddingX} y2={paddingY + chartH - (val/100)*chartH} stroke="#E5E0D9" strokeWidth="1" />
              <text x={paddingX - 10} y={paddingY + chartH - (val/100)*chartH + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{val}%</text>
            </g>
          ))}
          {data.map((d, i) => (
             <text key={i} x={paddingX + (i * ((chartW - paddingX*2) / 13))} y={chartH + paddingY + 20} fontSize="10" textAnchor="middle" fill="#94a3b8">{d.name}</text>
          ))}
          <polyline points={getPoints('avg')} fill="none" stroke="#36563D" strokeWidth="4" />
          {data.map((d, i) => (
            <circle key={i} cx={paddingX + (i * ((chartW - paddingX*2) / 13))} cy={paddingY + chartH - (d.avg / 100) * chartH} r="4" fill="#F2C633" />
          ))}
        </svg>
      </div>
    </div>
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
      setErrorMsg('Geen database verbinding gevonden. Controleer je Vercel instellingen.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Profiel ophalen
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
          <div className="mx-auto flex justify-center mb-4">
            <HacarLogo className="h-24 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Hacar Academy</h1>
          <p className="text-xs text-slate-500 mt-1">Log in met je account</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSupabaseLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                placeholder="naam@hacar.nl" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" 
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-70"
          >
            {loading ? <span>Bezig met inloggen...</span> : <><ShieldCheck className="w-5 h-5" /><span>Inloggen</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ onSelectStudent, userRole, goAnalysis, students, onRefresh, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentDate, setNewStudentDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Loopt voor': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#3EC55F]/20 text-[#36563D] border border-[#3EC55F]">Loopt voor</span>;
      case 'Op schema': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">Op schema</span>;
      case 'Aandacht nodig': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FE615A]/20 text-[#FE615A] border border-[#FE615A]">Aandacht nodig</span>;
      default: return null;
    }
  };

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
          teacher: currentUser.name || 'Docent'
        }]);
        if (!error) {
          setIsModalOpen(false);
          setNewStudentName('');
          setNewStudentDate('');
          onRefresh(); // Refresh the list
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
      
      {/* Modal Toevoegen Leerling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#36563D] text-white">
              <h3 className="font-bold">Nieuwe Leerling Toevoegen</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-slate-300 transition"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Volledige Naam</label>
                <input type="text" required value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} placeholder="Bijv. Jan de Vries" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Startdatum</label>
                <input type="date" required value={newStudentDate} onChange={e=>setNewStudentDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">Annuleren</button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 bg-[#36563D] hover:bg-[#2a4330] text-white rounded-lg text-sm font-semibold transition flex items-center">
                  {isAdding ? 'Bezig...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">Leerlingenoverzicht</h2>
          <p className="text-sm text-slate-500">Beheer en bekijk de actuele ontwikkeling van deelnemers.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={goAnalysis} className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-[#36563D] text-[#36563D] font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Analyse & Draaitabellen</span>
           </button>
           {userRole !== 'MANAGER' && (
             <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm text-sm">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nieuwe Leerling</span>
             </button>
           )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Zoek op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-[#E5E0D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-500 hidden sm:block">Status:</span>
          {['ALL', 'Loopt voor', 'Op schema', 'Aandacht nodig'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${ statusFilter === status ? 'bg-[#36563D] text-white' : 'bg-[#E5E0D9] text-[#1D252C] hover:bg-[#d6d0c7]' }`}>
              {status === 'ALL' ? 'Alles tonen' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
           <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-[#1D252C] mb-2">Nog geen leerlingen gevonden</h3>
           <p className="text-sm text-slate-500 mb-6">Voeg je eerste leerling toe om te starten met de voortgangsregistratie.</p>
           <button onClick={() => setIsModalOpen(true)} className="bg-[#36563D] hover:bg-[#2a4330] text-white px-6 py-2.5 rounded-lg font-bold shadow transition">
              + Leerling Toevoegen
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] transition-all hover:shadow-md cursor-pointer overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={student.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#E5E0D9]" />
                    <div>
                      <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D] transition-colors">{student.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Start: {student.start_date} • <span className="font-semibold text-slate-700 ml-1">Maand {student.current_month || 1}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
                <hr className="my-4 border-[#E5E0D9]" />
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">Voortgang (behandeld)</span>
                    <span className="font-bold text-[#36563D]">{student.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-[#E5E0D9] rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#36563D] h-2.5 rounded-full transition-all duration-500" style={{ width: `${student.progress_percentage || 0}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-[#E5E0D9] mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gem. Competentie</span>
                    <span className="font-bold text-[#1D252C] flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-[#F2C633]" /> {student.competency_score || '0.0'} / 3.0</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Begeleider</span>
                    <span className="font-semibold text-[#1D252C]">{student.teacher || 'Niet toegewezen'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#E5E0D9]">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Gewijzigd: {student.last_updated || 'Vandaag'}</span>
                  <span className="text-[#36563D] font-semibold flex items-center group-hover:translate-x-1 transition-transform">Profiel <ChevronRight className="w-4 h-4 ml-0.5" /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentProfile({ studentId, onBack, userRole, showNotification, students }) {
  const student = students.find(s => s.id === studentId) || students[0];

  const [activeTab, setActiveTab] = useState('modules');
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [competencyScores, setCompetencyScores] = useState({});
  const isReadOnly = userRole === 'MANAGER';
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchStudentScores() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from('scores')
          .select('*')
          .eq('student_id', studentId);

        if (data) {
          const loadedScores = {};
          const loadedNotes = {};
          data.forEach(item => {
            loadedScores[item.item_id] = item.score;
            if (item.note) loadedNotes[item.item_id] = item.note;
          });
          setScores(loadedScores);
          setNotes(loadedNotes);
        }
      } catch (err) {
        console.error("Fout bij laden scores:", err);
      }
    }
    fetchStudentScores();
  }, [studentId]);

  const getScoreColorClass = (score, isSelected) => {
    if (!isSelected) return "bg-white border-slate-200 text-slate-400 hover:bg-slate-50";
    switch (score) {
      case 0: return "bg-slate-400 border-slate-400 text-white shadow-inner";     
      case 1: return "bg-[#FE615A] border-[#FE615A] text-white shadow-inner";       
      case 2: return "bg-orange-500 border-orange-500 text-white shadow-inner";   
      case 3: return "bg-[#F2C633] border-[#F2C633] text-white shadow-inner";     
      case 4: return "bg-[#3EC55F] border-[#3EC55F] text-white shadow-inner"; 
      default: return "";
    }
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Collect all updates
        const updates = Object.keys(scores).map(itemId => ({
          student_id: studentId,
          item_id: itemId,
          score: scores[itemId],
          note: notes[itemId] || null
        }));

        if (updates.length > 0) {
          await supabase.from('scores').upsert(updates, { onConflict: 'student_id,item_id' });
        }
        
        // Update student progress globally (Simple mock calculation for now)
        const totalScored = Object.values(scores).filter(s => s > 0).length;
        const totalItems = MODULES_DATA.reduce((acc, mod) => acc + mod.items.length, 0);
        const progress = Math.round((totalScored / totalItems) * 100);
        
        await supabase.from('students').update({ progress_percentage: progress }).eq('id', studentId);
        
      } catch (err) {
        console.error("Opslaan mislukt:", err);
      }
    }

    setIsSaving(false);
    showNotification();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-['Poppins',sans-serif]">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] font-medium transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug naar overzicht
        </button>
        <div className="flex items-center space-x-3">
          {isReadOnly && <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Kijk-modus</span>}
          <button onClick={handleSave} disabled={isReadOnly || isSaving} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${!isReadOnly ? 'bg-[#36563D] text-white hover:bg-[#2a4330]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
            <Save className="w-4 h-4" /> <span>{isSaving ? 'Opslaan...' : 'Opslaan'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
        <img src={student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#E5E0D9] shadow-sm" />
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
           <div>
            <h2 className="text-xl font-bold text-[#1D252C]">{student.name}</h2>
            <p className="text-sm text-slate-500">Academy Basis Elektra</p>
            <div className="mt-2"><span className="px-2.5 py-1 bg-[#3EC55F]/20 text-[#36563D] rounded-full text-xs font-bold border border-[#3EC55F]">{student.status || 'Op schema'}</span></div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Begeleiding</p>
            <p className="text-sm text-[#1D252C] font-medium"><ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-slate-400"/> Docent: {student.teacher || 'Systeem'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tijdlijn</p>
            <p className="text-sm text-[#1D252C]"><Calendar className="inline w-3.5 h-3.5 mr-1 text-slate-400"/> Start: {student.start_date || 'N/A'}</p>
            <p className="text-sm text-[#1D252C] mt-1"><CheckCircle2 className="inline w-3.5 h-3.5 mr-1 text-slate-400"/> Laatst: {student.last_updated || 'Vandaag'}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-[#E5E0D9] p-1 rounded-xl w-full max-w-2xl">
        {['modules', 'competenties', 'pdf'].map(tab => (
           <button 
             key={tab} onClick={() => setActiveTab(tab)}
             className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center transition-all capitalize ${activeTab === tab ? 'bg-white text-[#36563D] shadow-sm' : 'text-slate-600 hover:text-[#1D252C]'}`}
           >
             {tab === 'modules' && <BookOpen className="w-4 h-4 mr-2" />}
             {tab === 'competenties' && <Award className="w-4 h-4 mr-2" />}
             {tab === 'pdf' && <FileText className="w-4 h-4 mr-2" />}
             {tab}
           </button>
        ))}
      </div>

      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-medium">
            <span className="text-[#1D252C] font-bold uppercase tracking-wide mr-2">Legenda:</span>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-slate-400 mr-1.5"></span> 0 = Nog niet</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#FE615A] mr-1.5"></span> 1 = Niet beheerst</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-orange-500 mr-1.5"></span> 2 = Begeleiding</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#F2C633] mr-1.5"></span> 3 = Grotendeels</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#3EC55F] mr-1.5"></span> 4 = Zelfstandig</div>
          </div>

          {MODULES_DATA.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div 
                className="w-full px-6 py-4 flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              >
                 <div className="flex-1 flex items-center justify-between md:justify-start gap-4">
                   <h3 className="text-lg font-bold text-[#36563D] whitespace-nowrap">{module.title}</h3>
                   <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:block">{module.items.length} items</span>
                 </div>
                 
                 <div className="mt-3 md:mt-0 flex items-center gap-3">
                   <div className="text-slate-400">
                     {expandedModule === module.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                   </div>
                 </div>
              </div>

              {expandedModule === module.id && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold w-1/3">Onderdeel</th>
                        <th className="px-4 py-3 font-semibold w-[280px]">Score beoordeling</th>
                        <th className="px-6 py-3 font-semibold">Notitie Docent per onderdeel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {module.items.map((item, idx) => {
                        const itemKey = `${module.id}-${idx}`;
                        const currentScore = scores[itemKey]; 

                        return (
                          <tr key={itemKey} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-[#1D252C]">
                              {item}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-1.5 p-1 bg-slate-100/50 rounded-lg inline-flex">
                                {[0, 1, 2, 3, 4].map(num => (
                                  <button
                                    key={num} onClick={() => !isReadOnly && setScores(prev => ({ ...prev, [itemKey]: num }))}
                                    disabled={isReadOnly}
                                    className={`w-10 h-10 rounded-md border font-bold text-sm transition-all flex items-center justify-center ${getScoreColorClass(num, currentScore === num)} ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <input type="text" placeholder="Optionele notitie..." value={notes[itemKey] || ''} onChange={(e) => setNotes(prev => ({ ...prev, [itemKey]: e.target.value }))} disabled={isReadOnly} className="w-full pl-9 pr-3 py-2 border border-transparent group-hover:border-slate-200 hover:border-slate-300 rounded-lg text-sm bg-transparent group-hover:bg-white focus:bg-white focus:border-[#36563D] focus:ring-1 focus:outline-none transition-all" />
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
      )}

      {activeTab === 'competenties' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-medium">
            <span className="text-[#1D252C] font-bold uppercase tracking-wide mr-2">Competentie Legenda:</span>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#FE615A] mr-1.5"></span> 1 = Aandacht nodig</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-blue-500 mr-1.5"></span> 2 = Voldoende</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#3EC55F] mr-1.5"></span> 3 = Sterk</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {COMPETENCIES.map((comp, idx) => {
                const compKey = `comp-${idx}`;
                const currentScore = competencyScores[compKey];
                return (
                  <div key={compKey} className="p-4 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                    <span className="font-medium text-[#1D252C] xl:w-1/3 text-sm">{comp}</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          disabled={isReadOnly}
                          onClick={() => setCompetencyScores(prev => ({ ...prev, [compKey]: num }))}
                          className={`w-12 h-10 rounded-md border font-bold text-sm transition-all flex items-center justify-center ${
                            currentScore === num 
                            ? (num === 1 ? 'bg-[#FE615A] border-[#FE615A] text-white' : num === 2 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-[#3EC55F] border-[#3EC55F] text-white')
                            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                          } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto mt-8">
           <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-[#36563D]">
             <div>
                <h1 className="text-3xl font-black text-[#36563D]">Maandoverzicht</h1>
                <p className="text-sm font-semibold text-slate-500">Academy Basis Elektra • Maand {student.current_month || 1}</p>
             </div>
             <HacarLogo className="h-12 w-auto" />
           </div>
           
           <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div><span className="text-slate-400 block">Naam Leerling</span><span className="font-bold text-[#1D252C] text-lg">{student.name}</span></div>
              <div><span className="text-slate-400 block">Docent/Begeleider</span><span className="font-bold text-[#1D252C] text-lg">{student.teacher || 'Systeem'}</span></div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={() => window.print()} className="bg-[#36563D] text-white px-6 py-2.5 rounded-lg font-bold shadow hover:bg-[#2a4330] transition flex items-center">
                 <FileText className="w-4 h-4 mr-2" /> Genereer PDF Document
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function AnalysisView({ onBack }) {
  const [activeTab, setActiveTab] = useState('group');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-['Poppins',sans-serif]">
       <div className="flex items-center space-x-4 mb-6">
          <button onClick={onBack} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#36563D] shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#1D252C]">Analyse & Draaitabellen</h2>
       </div>

       <div className="flex space-x-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
          <button onClick={() => setActiveTab('group')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'group' ? 'bg-[#36563D] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
            Groepsanalyse Matrix
          </button>
       </div>

       {activeTab === 'group' && (
         <div className="space-y-8">
           <GroupLineChart />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null); 
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD'); 
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  const loadStudentsFromSupabase = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStudents(MOCK_STUDENTS); // Fallback to mock only if no config
      return;
    }
    
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (!error) {
        setStudents(data || []);
        setDbConnected(true);
      } else {
        console.error("Fout bij ophalen leerlingen:", error);
      }
    } catch (err) {
      console.error("Geen verbinding mogelijk, terugvallen op mockdata.", err);
      setStudents(MOCK_STUDENTS);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudentsFromSupabase();
    }
  }, [user]);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setCurrentView('DASHBOARD');
  };

  const showNotification = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#E5E0D9] font-['Poppins',sans-serif] text-[#1D252C]">
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {setCurrentView('DASHBOARD'); setSelectedStudentId(null);}}>
            <div className="bg-white p-1 rounded shadow-sm flex items-center justify-center">
              <HacarLogo className="h-8 w-auto" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight leading-tight text-white">Hacar <span className="text-[#F2C633]">Academy</span></h1>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className="bg-[#1D252C]/30 px-3 py-1 rounded-full border border-white/10 shadow-inner">
               Rol: <span className="text-[#F2C633]">{user.role}</span> ({user.name})
            </span>
            <button onClick={() => setUser(null)} className="hover:text-[#F2C633] transition flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Uitloggen
            </button>
          </div>
        </div>
      </header>

      {currentView === 'DASHBOARD' && !selectedStudentId && (
         <StudentDashboard 
           onSelectStudent={(id) => { setSelectedStudentId(id); setCurrentView('PROFILE'); }} 
           userRole={user.role}
           goAnalysis={() => setCurrentView('ANALYSIS')}
           students={students}
           onRefresh={loadStudentsFromSupabase}
           currentUser={user}
         />
      )}
      
      {currentView === 'PROFILE' && selectedStudentId && (
         <StudentProfile 
           studentId={selectedStudentId} 
           onBack={() => { setSelectedStudentId(null); setCurrentView('DASHBOARD'); loadStudentsFromSupabase(); }} 
           userRole={user.role}
           showNotification={showNotification}
           students={students}
         />
      )}

      {currentView === 'ANALYSIS' && (
         <AnalysisView onBack={() => setCurrentView('DASHBOARD')} />
      )}

      {showSaveToast && (
        <div className="fixed bottom-6 right-6 bg-[#3EC55F] text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center animate-bounce z-50">
          <CheckCircle2 className="w-5 h-5 mr-2" /> Wijzigingen succesvol opgeslagen!
        </div>
      )}
    </div>
  );
}
