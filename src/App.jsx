import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, LogOut, ShieldCheck, UserPlus, 
  Search, Calendar, ArrowLeft, X, Mail, Lock
} from 'lucide-react';

// Veilige check voor de Supabase import (zodat de editor niet crasht)
let createClient;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (e) {
  // Fallback voor de preview editor als module ontbreekt
  createClient = (url, key) => {
     console.warn("Supabase module not found, using dummy client");
     return {
         auth: {
             getSession: async () => ({ data: { session: null } }),
             signInWithPassword: async () => ({ data: { user: { email: 'demo@hacar.nl' } }, error: null }),
             signOut: async () => {}
         },
         from: () => ({
             select: () => ({ order: async () => ({ data: [], error: null }) }),
             insert: async () => ({ data: null, error: null })
         })
     }
  };
}

// Haal variabelen veilig op
const getEnvVar = (name) => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env[name] || '';
        }
    } catch (e) {}
    
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name] || '';
        }
    } catch (e) {}
    
    return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!supabase) {
      setErrorMsg('Geen database verbinding gevonden. Werken de sleutels in Vercel?');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      onLogin(data.user);
    } catch (error) {
      setErrorMsg('Inloggen mislukt. Verkeerd e-mailadres of wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center p-4 font-['Poppins',sans-serif]">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center mb-4"><HacarLogo className="h-20 w-auto" /></div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Hacar Academy</h1>
          <p className="text-sm text-slate-500 mt-1">Beveiligde toegang</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /><span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" required 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" 
                placeholder="naam@hacar.nl" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" required 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none" 
                placeholder="••••••••" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#36563D] hover:bg-[#2a4330] text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center shadow mt-4"
          >
            {loading ? 'Bezig met inloggen...' : <><ShieldCheck className="w-5 h-5 mr-2" /> Veilig Inloggen</>}
          </button>

          {}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center">
             <p className="font-bold mb-2 text-slate-800">Vercel Systeem Check:</p>
             <p>URL geladen: {supabaseUrl ? '✅ Ja' : '❌ Nee'}</p>
             <p>Sleutel geladen: {supabaseKey ? '✅ Ja' : '❌ Nee'}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ onSelectStudent, user, students, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Geen database connectie!");
    
    setIsAdding(true);
    const { data, error } = await supabase.from('students').insert([
      { 
        name: newName, 
        start_date: newDate, 
        teacher: user.email 
      }
    ]);

    if (error) {
      alert("Fout bij toevoegen: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewName('');
      setNewDate('');
      onRefresh(); // Haal nieuwe lijst direct op uit database
    }
    setIsAdding(false);
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {}
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

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D252C]">Jouw Leerlingen</h2>
          <p className="text-slate-500">Beheer alle actieve trajecten direct uit de database.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center space-x-2 bg-[#F2C633] hover:bg-yellow-400 text-[#1D252C] font-bold px-5 py-2.5 rounded-lg shadow transition">
           <UserPlus className="w-5 h-5" /><span>Nieuwe Leerling</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" placeholder="Zoek leerling op naam..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#36563D] outline-none transition" />
      </div>

      {}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
           <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-[#1D252C] mb-2">Geen leerlingen gevonden</h3>
           <p className="text-slate-500 mb-6">Er staan nog geen leerlingen in jouw database. Klik op toevoegen om te starten.</p>
           <button onClick={() => setIsModalOpen(true)} className="bg-[#36563D] hover:bg-[#2a4330] text-white font-bold px-6 py-2.5 rounded-lg shadow transition">Nu toevoegen</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} onClick={() => onSelectStudent(student.id)} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#36563D] hover:shadow-md transition-all cursor-pointer p-6 group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-lg font-bold text-slate-500">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#36563D] transition">{student.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold mt-1">{student.status || 'Op schema'}</span>
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
  const [user, setUser] = useState(null); 
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsInitializing(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      setIsInitializing(false);
    };
    checkSession();
  }, []);

  const loadStudents = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) {
      setStudents(data);
    } else if (error) {
      console.error("Fout bij ophalen leerlingen:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSelectedStudentId(null);
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center font-bold text-slate-500">Controleren beveiliging...</div>;
  }

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] font-['Poppins',sans-serif]">
      {}
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedStudentId(null)}>
            <div className="bg-white p-1 rounded"><HacarLogo className="h-8 w-auto" /></div>
            <h1 className="text-xl font-bold">Hacar <span className="text-[#F2C633]">Academy</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:block opacity-80">{user.email}</span>
            <button onClick={handleLogout} className="text-sm font-semibold hover:text-[#F2C633] transition flex items-center bg-black/10 px-3 py-1.5 rounded">
              <LogOut className="w-4 h-4 mr-1.5" /> Uitloggen
            </button>
          </div>
        </div>
      </header>

      {}
      {!selectedStudentId ? (
         <StudentDashboard 
            onSelectStudent={setSelectedStudentId} 
            students={students} 
            onRefresh={loadStudents} 
            user={user} 
         />
      ) : (
         <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => setSelectedStudentId(null)} className="flex items-center text-slate-500 hover:text-[#36563D] font-bold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" /> Terug naar overzicht
            </button>
            <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-200">
               <h2 className="text-2xl font-bold text-[#1D252C] mb-4">
                  {students.find(s => s.id === selectedStudentId)?.name}
               </h2>
               <p className="text-slate-500">
                 Dit leerlingprofiel is succesvol geladen uit de database!<br/><br/>
                 Zodra dit goed doorkomt, gaan we in de volgende stap de uitklapbare tabellen van de module-scores inbouwen (uit dat andere bestand).
               </p>
            </div>
         </div>
      )}
    </div>
  );
}
