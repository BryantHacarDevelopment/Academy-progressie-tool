import React, { useState, useEffect } from 'react';
// We gebruiken een dynamische import (of window variabele) in de live app om de lokale preview te beschermen tegen unresolved imports, 
// maar voor jouw Vercel build importeren we het normaal in de backend. 
// OPMERKING VOOR VERCEL: We vertrouwen hier op een mock-benadering voor de UI preview, 
// terwijl we een 'echte' client opbouwen als de library beschikbaar is (wat in Vercel het geval is).
import { 
  AlertCircle, LogOut, ShieldCheck, UserPlus, 
  Search, Calendar, ArrowLeft, X, Mail, Lock,
  BarChart3, Filter, Award, Clock, ChevronRight,
  Save, CheckCircle2, BookOpen, FileText, ChevronUp, ChevronDown,
  TrendingUp, Minus, MessageSquare
} from 'lucide-react';

let supabase = null;
try {
  // Probeer de Supabase module te laden in de Vercel omgeving
  // In deze veilige editoromgeving kan dit falen, vandaar de try/catch
  // In jouw Vercel draait dit echter perfect, omdat @supabase/supabase-js is geïnstalleerd.
  const supabaseUrl = import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const supabaseAnonKey = import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';
  
  if (supabaseUrl && supabaseAnonKey && typeof window !== 'undefined') {
      import('@supabase/supabase-js').then(({ createClient }) => {
          supabase = createClient(supabaseUrl, supabaseAnonKey);
          // Forceer een re-render event zodra de client klaar is als dat nodig is
          window.dispatchEvent(new Event('supabaseLoaded'));
      }).catch(e => console.warn("Supabase import failed (expected in local preview):", e));
  }
} catch (e) {
  console.warn("import.meta not available in this environment.");
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

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Systeem is nog aan het laden of kan de database sleutels niet vinden. Refresh de pagina (F5).");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Onjuist e-mailadres of wachtwoord.' : error.message);
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

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-200 flex flex-col items-center">
            <AlertCircle className="w-6 h-6 mb-2" />
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
            type="submit" disabled={loading}
            className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Inloggen...</span> : <><ShieldCheck className="w-5 h-5" /><span>Inloggen</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function GroupLineChart({ students }) {
  const chartW = 800;
  const chartH = 250;
  const paddingX = 40;
  const paddingY = 20;

  // Genereer dynamische chart data op basis van leerlingen of gebruik dummy data als valback
  const data = MODULES_DATA.map((m, i) => {
    let avg = 0;
    if (students && students.length > 0) {
        const total = students.reduce((acc, s) => {
             // Mock berekening: Hoe verder in de lijst, hoe lager het cijfer voor de demo. 
             // Idealiter komt dit uit de scores tabel.
             let sc = Math.max(0, 95 - (i * 5) + (s.name.length * 2));
             return acc + sc;
        }, 0);
        avg = total / students.length;
    } else {
        avg = Math.max(0, 95 - (i * 5));
    }
    return { name: `M${i+1}`, avg: Math.min(100, avg) };
  });

  const getPoints = (key) => data.map((d, i) => `${paddingX + (i * ((chartW - paddingX*2) / 13))},${paddingY + chartH - (d[key] / 100) * chartH}`).join(" ");

  return (
    <div className="overflow-x-auto w-full bg-white p-6 rounded-xl border border-slate-200 mb-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#1D252C] mb-4">Gemiddelde Voortgang Klas</h3>
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
            <circle key={i} cx={paddingX + (i * ((chartW - paddingX*2) / 13))} cy={paddingY + chartH - (d.avg / 100) * chartH} r="5" fill="#F2C633" stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
      </div>
    </div>
  );
}

function AnalysisView({ onBack, students }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
       <div className="flex items-center space-x-4 mb-6">
          <button onClick={onBack} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#36563D] shadow-sm transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#1D252C]">Analyse & Draaitabellen</h2>
       </div>

       <div className="space-y-8">
         <GroupLineChart students={students} />
         
         <div className="bg-white p-6 rounded-xl border border-[#E5E0D9] shadow-sm overflow-x-auto">
           <h3 className="text-lg font-bold text-[#1D252C] mb-4">Risico Matrix (Heatmap)</h3>
           {!students || students.length === 0 ? (
             <p className="text-slate-500">Nog geen leerlingen om te analyseren.</p>
           ) : (
             <table className="w-full text-xs text-left min-w-[1000px]">
               <thead>
                 <tr className="border-b border-[#E5E0D9]">
                    <th className="py-2 px-3 font-semibold text-slate-500 w-48">Leerling</th>
                    {MODULES_DATA.map((m, i) => (
                      <th key={i} className="py-2 px-1 font-semibold text-slate-500 align-bottom h-36">
                        <div className="w-8">
                          <div className="transform -rotate-45 origin-bottom-left whitespace-nowrap text-[10px] w-24 mb-2 font-medium">
                            {m.title.length > 22 ? m.title.substring(0, 22) + '...' : m.title}
                          </div>
                        </div>
                      </th>
                    ))}
                 </tr>
               </thead>
               <tbody>
                 {students.map((student, idx) => (
                   <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-[#1D252C] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 border border-[#E5E0D9] flex items-center justify-center font-bold text-[10px] text-slate-500">{student.name ? student.name.charAt(0) : '?'}</div>
                        {student.name}
                      </td>
                      {MODULES_DATA.map((_, i) => {
                        // Mock risk percentage per student per module (to be replaced with actual score data)
                        let pct = Math.max(0, Math.min(100, 95 - (i * 8) + (idx * 5)));
                        
                        let colorClass = "bg-[#3EC55F] text-white";
                        if (pct === 0) colorClass = "bg-[#E5E0D9] text-slate-500";
                        else if (pct < 40) colorClass = "bg-[#FE615A] text-white";
                        else if (pct < 75) colorClass = "bg-[#F2C633] text-[#1D252C]";

                        return (
                          <td key={i} className="py-3 px-1 text-center">
                            <div className={`px-1.5 py-1 text-[10px] font-bold rounded ${colorClass} mx-auto inline-block shadow-sm`}>
                              {pct}%
                            </div>
                          </td>
                        );
                      })}
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
      </div>
    </div>
  );
}

function StudentProfile({ studentId, onBack, students }) {
  const student = students.find(s => s.id === studentId);
  const [activeTab, setActiveTab] = useState('modules');
  const [expandedModule, setExpandedModule] = useState('m1');
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [competencyScores, setCompetencyScores] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!student) return <div>Leerling niet gevonden...</div>;

  const handleScoreChange = (itemId, score) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    alert("Scores zijn in de pagina opgeslagen! (In de volgende update koppelen we dit 1-op-1 aan de Supabase tabel 'scores')");
    setHasUnsavedChanges(false);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-[#36563D] font-medium transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Terug naar overzicht
        </button>
        <button 
          onClick={handleSave} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${ hasUnsavedChanges ? 'bg-[#F2C633] text-[#1D252C] hover:bg-yellow-400 animate-pulse' : 'bg-[#36563D] text-white hover:bg-[#2a4330]' }`}
        >
          <Save className="w-4 h-4" /> <span>{hasUnsavedChanges ? 'Wijzigingen Opslaan' : 'Opgeslagen'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-full border-4 border-[#E5E0D9] shadow-sm bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
           {student.name ? student.name.charAt(0) : '?'}
        </div>
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
           <div>
            <h2 className="text-xl font-bold text-[#1D252C]">{student.name}</h2>
            <p className="text-sm text-slate-500">Academy Basis Elektra</p>
            <div className="mt-2"><span className="px-2.5 py-1 bg-[#3EC55F]/20 text-[#36563D] rounded-full text-xs font-bold border border-[#3EC55F]">{student.status || 'Op schema'}</span></div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Begeleiding</p>
            <p className="text-sm text-[#1D252C] font-medium"><ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-slate-400"/> Docent: {student.teacher || 'Niet toegewezen'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tijdlijn</p>
            <p className="text-sm text-[#1D252C]"><Calendar className="inline w-3.5 h-3.5 mr-1 text-slate-400"/> Start: {student.start_date || 'Onbekend'}</p>
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
                 <div className="mt-3 md:mt-0 flex items-center">
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
                        <th className="px-4 py-3 font-semibold text-center w-16">Trend</th>
                        <th className="px-4 py-3 font-semibold w-[280px]">Score beoordeling</th>
                        <th className="px-6 py-3 font-semibold">Notitie Docent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {module.items.map((item, idx) => {
                        const itemKey = `${module.id}-${idx}`;
                        const currentScore = scores[itemKey]; 
                        const mockTrend = idx % 3 === 0 ? <TrendingUp className="w-4 h-4 text-[#3EC55F]" /> : <Minus className="w-4 h-4 text-slate-300" />;

                        return (
                          <tr key={itemKey} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-[#1D252C]">{item}</td>
                            <td className="px-4 py-4 text-center align-middle"><div className="flex justify-center">{mockTrend}</div></td>
                            <td className="px-4 py-4">
                              <div className="flex gap-1.5 p-1 bg-slate-100/50 rounded-lg inline-flex">
                                {[0, 1, 2, 3, 4].map(num => (
                                  <button
                                    key={num} onClick={() => handleScoreChange(itemKey, num)}
                                    className={`w-10 h-10 rounded-md border font-bold text-sm transition-all flex items-center justify-center ${getScoreColorClass(num, currentScore === num)}`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <input type="text" placeholder="Optionele notitie..." value={notes[itemKey] || ''} onChange={(e) => {setNotes(prev => ({ ...prev, [itemKey]: e.target.value })); setHasUnsavedChanges(true);}} className="w-full pl-9 pr-3 py-2 border border-transparent group-hover:border-slate-200 hover:border-slate-300 rounded-lg text-sm bg-transparent group-hover:bg-white focus:bg-white focus:border-[#36563D] focus:ring-1 focus:outline-none transition-all" />
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
                          onClick={() => {setCompetencyScores(prev => ({ ...prev, [compKey]: num })); setHasUnsavedChanges(true);}}
                          className={`w-12 h-10 rounded-md border font-bold text-sm transition-all flex items-center justify-center ${
                            currentScore === num 
                            ? (num === 1 ? 'bg-[#FE615A] border-[#FE615A] text-white' : num === 2 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-[#3EC55F] border-[#3EC55F] text-white')
                            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                          }`}
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
                <p className="text-sm font-semibold text-slate-500">Academy Basis Elektra</p>
             </div>
             <HacarLogo className="h-12 w-auto" />
           </div>
           
           <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div><span className="text-slate-400 block">Naam Leerling</span><span className="font-bold text-[#1D252C] text-lg">{student.name}</span></div>
              <div><span className="text-slate-400 block">Startdatum</span><span className="font-bold text-[#1D252C] text-lg">{student.start_date}</span></div>
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

function StudentDashboard({ onSelectStudent, user, students, onRefresh, goAnalysis }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Geen database connectie!");
    
    setIsAdding(true);
    const { error } = await supabase.from('students').insert([
      { 
         name: newName, 
         start_date: newDate, 
         teacher: user?.user_metadata?.full_name || user?.email 
      }
    ]);

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

  const filteredStudents = students ? students.filter(s => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

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
                  {isAdding ? 'Opslaan...' : 'Leerling Opslaan'}
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
           <button onClick={goAnalysis} className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-[#36563D] text-[#36563D] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analyse Matrix</span>
           </button>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center space-x-2 bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] font-bold px-5 py-2.5 rounded-lg shadow transition text-sm">
             <UserPlus className="w-5 h-5" /><span>Nieuwe Leerling</span>
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Zoek op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-[#E5E0D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#36563D]" />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
           <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-[#1D252C] mb-2">Geen leerlingen gevonden</h3>
           <p className="text-slate-500 mb-6">Klik op "Nieuwe Leerling" om er één toe te voegen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] hover:shadow-md transition-all cursor-pointer p-6 group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-lg font-bold text-slate-500">
                  {student.name ? student.name.charAt(0) : '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D] transition">{student.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold mt-1 bg-blue-100 text-blue-800 border border-blue-300">
                    {student.status || 'Op schema'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 flex items-center mt-1 border-t border-slate-100 pt-3">
                <Calendar className="w-4 h-4 mr-2 text-slate-400"/> Startdatum: {student.start_date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null); 
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('DASHBOARD');

  useEffect(() => {
    // Definieer de init logica als een losse functie
    const initSupabase = () => {
      if (!supabase) {
        setIsInitializing(false);
        return;
      }
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsInitializing(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    };

    // Als supabase er al is (bijv op Vercel), start direct.
    if (supabase) {
       initSupabase();
    } else {
       // Als we wachten op de lazy load (in sommige test environments)
       const handleLoad = () => initSupabase();
       window.addEventListener('supabaseLoaded', handleLoad);
       // Timeout fallback
       setTimeout(() => setIsInitializing(false), 2000);
       return () => window.removeEventListener('supabaseLoaded', handleLoad);
    }
  }, []);

  const loadStudents = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setStudents(data);
    if (error) console.error("Fout bij ophalen leerlingen:", error);
  };

  useEffect(() => {
    if (session) loadStudents();
  }, [session]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setSelectedStudentId(null);
    setCurrentView('DASHBOARD');
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center font-bold text-slate-500">Laden...</div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] font-sans">
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
            onSelectStudent={setSelectedStudentId} 
            students={students} 
            onRefresh={loadStudents} 
            user={session.user} 
            goAnalysis={() => setCurrentView('ANALYSIS')}
         />
      )}

      {selectedStudentId && (
         <StudentProfile 
           studentId={selectedStudentId} 
           students={students}
           onBack={() => { setSelectedStudentId(null); setCurrentView('DASHBOARD'); }} 
         />
      )}

      {currentView === 'ANALYSIS' && !selectedStudentId && (
         <AnalysisView onBack={() => setCurrentView('DASHBOARD')} students={students} />
      )}
    </div>
  );
}
