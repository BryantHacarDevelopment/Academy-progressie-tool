import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, LogOut, ShieldCheck, UserPlus, 
  Search, Calendar, ArrowLeft, X, Mail, Lock,
  BarChart3, Filter, Award, Clock, ChevronRight,
  Save, CheckCircle2, BookOpen, FileText, ChevronUp, ChevronDown,
  TrendingUp, Minus, MessageSquare
} from 'lucide-react';

if (typeof document !== 'undefined' && !document.getElementById('tailwind-script')) {
  const script = document.createElement('script');
  script.id = 'tailwind-script';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

if (typeof document !== 'undefined' && !document.getElementById('poppins-font-link')) {
  const link = document.createElement('link');
  link.id = 'poppins-font-link';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  const style = document.createElement('style');
  style.innerHTML = `body { font-family: 'Poppins', sans-serif; background-color: #E5E0D9; color: #1D252C; }`;
  document.head.appendChild(style);
}

// Veilig Supabase inladen via CDN om bundler crashes te voorkomen
if (typeof window !== 'undefined' && !window.supabaseScriptLoaded) {
  window.supabaseScriptLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  document.head.appendChild(script);
}

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

function LoginView({ supabase, initError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (initError) return setErrorMsg(initError);
    if (!supabase) return setErrorMsg('Database is nog niet geladen...');
    
    setLoading(true);
    setErrorMsg('');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Wachtwoord of e-mailadres is onjuist.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Bevestig eerst je e-mailadres (of zet dit uit in Supabase).');
      } else {
        setErrorMsg(`Fout: ${error.message}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center mb-4">
            <HacarLogo className="h-20 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Hacar Academy</h1>
          <p className="text-sm text-slate-500 mt-1">Log in met je account</p>
        </div>

        {initError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-200 flex flex-col items-center">
            <AlertCircle className="w-6 h-6 mb-2" />
            {initError}
          </div>
        )}
        
        {errorMsg && !initError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] focus:outline-none"
                placeholder="naam@hacar.nl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={loading || !!initError}
            className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Inloggen...</span> : <><ShieldCheck className="w-5 h-5" /><span>Inloggen</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ supabase, session, onSelectStudent, goAnalysis, students, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    
    // Voeg direct toe aan de database
    const { error } = await supabase.from('students').insert([{ 
       name: newName, 
       start_date: newDate,
       teacher: session.user.email
    }]);

    if (error) {
      alert("Fout bij toevoegen: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewName('');
      setNewDate('');
      onRefresh(); 
    }
    setIsAdding(false);
  };

  const filteredStudents = (students || []).filter(s => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-[#36563D] text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Nieuwe Leerling Toevoegen</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 hover:text-red-300 transition" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Volledige Naam</label>
                <input type="text" required value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Bijv. Jan de Vries" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Startdatum Opleiding</label>
                <input type="date" required value={newDate} onChange={e=>setNewDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Annuleren</button>
                <button type="submit" disabled={isAdding} className="px-5 py-2.5 bg-[#36563D] hover:bg-[#2a4330] text-white rounded-lg font-bold shadow">
                  {isAdding ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">Leerlingenoverzicht</h2>
          <p className="text-slate-500">Beheer alle actieve trajecten in de database.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={goAnalysis} className="flex items-center space-x-2 bg-white border border-[#36563D] text-[#36563D] font-semibold px-4 py-2.5 rounded-lg shadow-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analyse Matrix</span>
           </button>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-[#F2C633] text-[#1D252C] font-bold px-5 py-2.5 rounded-lg shadow">
             <UserPlus className="w-5 h-5" /><span>Nieuwe Leerling</span>
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="Zoek op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 border border-[#E5E0D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
           <h3 className="text-xl font-bold text-[#1D252C] mb-2">Geen leerlingen gevonden</h3>
           <p className="text-slate-500 mb-6">Klik op "Nieuwe Leerling" om er één toe te voegen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] cursor-pointer p-6 group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-500">
                  {student.name ? student.name.charAt(0) : '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D]">{student.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold mt-1 bg-blue-100 text-blue-800 border border-blue-300">
                    {student.status || 'Op schema'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 flex items-center mt-1 border-t border-slate-100 pt-3">
                <Calendar className="w-4 h-4 mr-2"/> Startdatum: {student.start_date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentProfile({ studentId, students, onBack }) {
  const student = students.find(s => s.id === studentId);
  const [activeTab, setActiveTab] = useState('modules');
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  
  if (!student) return <div>Laden...</div>;

  const handleScore = (key, val) => setScores(prev => ({ ...prev, [key]: val }));

  const getScoreColorClass = (score, isSelected) => {
    if (!isSelected) return "bg-white border-slate-200 text-slate-400";
    switch (score) {
      case 0: return "bg-slate-400 border-slate-400 text-white shadow-inner";     
      case 1: return "bg-[#FE615A] border-[#FE615A] text-white shadow-inner";       
      case 2: return "bg-orange-500 border-orange-500 text-white shadow-inner";   
      case 3: return "bg-[#F2C633] border-[#F2C633] text-white shadow-inner";     
      case 4: return "bg-[#3EC55F] border-[#3EC55F] text-white shadow-inner"; 
      default: return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] font-medium text-sm">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug naar overzicht
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
           {student.name ? student.name.charAt(0) : '?'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1D252C]">{student.name}</h2>
          <p className="text-sm text-slate-500 mt-1">Startdatum: {student.start_date}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-medium">
        <span className="text-[#1D252C] font-bold uppercase tracking-wide mr-2">Legenda:</span>
        <div className="flex items-center"><span className="w-4 h-4 rounded bg-slate-400 mr-1.5"></span> 0 = Nog niet</div>
        <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#FE615A] mr-1.5"></span> 1 = Niet beheerst</div>
        <div className="flex items-center"><span className="w-4 h-4 rounded bg-orange-500 mr-1.5"></span> 2 = Begeleiding</div>
        <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#F2C633] mr-1.5"></span> 3 = Grotendeels</div>
        <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#3EC55F] mr-1.5"></span> 4 = Zelfstandig</div>
      </div>

      <div className="space-y-4">
        {MODULES_DATA.map(module => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="w-full px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}>
               <h3 className="text-lg font-bold text-[#36563D]">{module.title}</h3>
               {expandedModule === module.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
            </div>
            {expandedModule === module.id && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {module.items.map((item, idx) => {
                      const itemKey = `${module.id}-${idx}`;
                      const currentScore = scores[itemKey]; 
                      return (
                        <tr key={itemKey} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-[#1D252C]">{item}</td>
                          <td className="px-4 py-4 w-[280px]">
                            <div className="flex gap-1.5 p-1 bg-slate-100/50 rounded-lg inline-flex">
                              {[0, 1, 2, 3, 4].map(num => (
                                <button key={num} onClick={() => handleScore(itemKey, num)} className={`w-10 h-10 rounded-md border font-bold text-sm transition-all ${getScoreColorClass(num, currentScore === num)}`}>{num}</button>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input type="text" placeholder="Notitie..." value={notes[itemKey] || ''} onChange={(e) => setNotes(prev => ({ ...prev, [itemKey]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#36563D]" />
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

function AnalysisView({ onBack, students }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
       <div className="flex items-center space-x-4 mb-6">
          <button onClick={onBack} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#36563D] shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold text-[#1D252C]">Analyse & Draaitabellen</h2>
       </div>
       <div className="bg-white p-6 rounded-xl border border-[#E5E0D9] shadow-sm overflow-x-auto">
         <h3 className="text-lg font-bold text-[#1D252C] mb-4">Risico Matrix</h3>
         {!students || students.length === 0 ? <p className="text-slate-500">Nog geen leerlingen.</p> : (
           <table className="w-full text-xs text-left min-w-[1000px]">
             <thead>
               <tr className="border-b border-[#E5E0D9]">
                  <th className="py-2 px-3 font-semibold text-slate-500 w-48">Leerling</th>
                  {MODULES_DATA.map((m, i) => (
                    <th key={i} className="py-2 px-1 font-semibold text-slate-500 align-bottom h-36">
                      <div className="transform -rotate-45 origin-bottom-left whitespace-nowrap text-[10px] w-24 font-medium">M{i+1}</div>
                    </th>
                  ))}
               </tr>
             </thead>
             <tbody>
               {students.map((student, idx) => (
                 <tr key={student.id} className="border-b border-slate-50">
                    <td className="py-3 px-3 font-bold text-[#1D252C]">{student.name}</td>
                    {MODULES_DATA.map((_, i) => (
                      <td key={i} className="py-3 px-1 text-center">
                        <div className={`px-1.5 py-1 text-[10px] font-bold rounded mx-auto inline-block shadow-sm bg-[#E5E0D9] text-slate-500`}>-</div>
                      </td>
                    ))}
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>
    </div>
  );
}

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [initError, setInitError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    let attempts = 0;
    
    // Check om de 100ms of CDN script geladen is
    const checkSupabase = setInterval(() => {
      attempts++;
      if (window.supabase) {
        clearInterval(checkSupabase);
        
        // Haal sleutels veilig op
        let url = '';
        let key = '';
        try {
           url = import.meta.env.VITE_SUPABASE_URL || '';
           key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        } catch(e) {}

        if (!url || !key) {
           setInitError('Geen database verbinding gevonden. Werken de sleutels in Vercel?');
           setIsInitializing(false);
           return;
        }

        try {
           const client = window.supabase.createClient(url, key);
           setSupabase(client);
           
           client.auth.getSession().then(({ data: { session } }) => {
             setSession(session);
             setIsInitializing(false);
           });
           
           client.auth.onAuthStateChange((_event, session) => {
             setSession(session);
           });
        } catch (err) {
           setInitError('Fout bij maken connectie: ' + err.message);
           setIsInitializing(false);
        }
      } else if (attempts > 50) {
        clearInterval(checkSupabase);
        setInitError('Supabase bibliotheek kon niet laden.');
        setIsInitializing(false);
      }
    }, 100);
    
    return () => clearInterval(checkSupabase);
  }, []);

  const loadStudents = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setStudents(data);
    if (error) console.error("Fout bij ophalen leerlingen:", error);
  };

  useEffect(() => {
    if (session && supabase) loadStudents();
  }, [session, supabase]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentView('DASHBOARD');
    setSelectedStudentId(null);
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center font-bold">Laden...</div>;
  }

  if (!session) {
    return <LoginView supabase={supabase} initError={initError} />;
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9]">
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setSelectedStudentId(null); setCurrentView('DASHBOARD'); }}>
            <div className="bg-white p-1 rounded"><HacarLogo className="h-8 w-auto" /></div>
            <h1 className="text-xl font-bold">Hacar <span className="text-[#F2C633]">Academy</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:block opacity-80">{session.user.email}</span>
            <button onClick={handleLogout} className="text-sm font-semibold hover:text-[#F2C633] transition flex items-center bg-black/10 px-3 py-1.5 rounded">
              <LogOut className="w-4 h-4 mr-1.5" /> Uitloggen
            </button>
          </div>
        </div>
      </header>

      {currentView === 'DASHBOARD' && !selectedStudentId && (
         <StudentDashboard 
            supabase={supabase} session={session} students={students} onRefresh={loadStudents}
            onSelectStudent={(id) => { setSelectedStudentId(id); setCurrentView('PROFILE'); }} 
            goAnalysis={() => setCurrentView('ANALYSIS')}
         />
      )}

      {currentView === 'PROFILE' && selectedStudentId && (
         <StudentProfile 
           studentId={selectedStudentId} students={students}
           onBack={() => { setSelectedStudentId(null); setCurrentView('DASHBOARD'); }} 
         />
      )}

      {currentView === 'ANALYSIS' && (
         <AnalysisView onBack={() => setCurrentView('DASHBOARD')} students={students} />
      )}
    </div>
  );
}
