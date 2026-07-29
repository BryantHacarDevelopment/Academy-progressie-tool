import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import AppShell from './components/AppShell';
import HacarLogo from './components/HacarLogo';
import LoginView from './components/LoginView';
import DashboardView from './views/DashboardView';
import StudentDetailView from './views/StudentDetailView';
import AnalyticsView from './views/AnalyticsView';
import AdminView from './views/AdminView';
import { getCurrentProfile } from './lib/api';
import { supabase } from './supabaseClient';

function FullScreenMessage({ title, text, error = false }) {
  return (
    <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4"><HacarLogo className="h-20 w-auto max-w-full" /></div>
        {error && <AlertCircle className="w-7 h-7 text-red-500 mx-auto mb-3" />}
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{text}</p>
        {error && supabase && <button type="button" onClick={() => supabase.auth.signOut()} className="mt-5 bg-[#36563D] text-white rounded-lg px-4 py-2 font-bold text-sm">Uitloggen</button>}
      </div>
    </div>
  );
}

export default function App() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setSessionLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setSessionLoading(false);
      if (!nextSession) {
        setProfile(null);
        setSelectedStudentId(null);
        setCurrentView('dashboard');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    let active = true;
    setProfileError('');

    getCurrentProfile(session.user.id)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setProfileError('Voor dit account ontbreekt een profiel in de tabel profiles. Laat een beheerder het account opnieuw aanmaken of voer de backfill uit het SQL-bestand uit.');
          return;
        }
        if (!data.active) {
          setProfileError('Dit gebruikersaccount is gedeactiveerd.');
          return;
        }
        setProfile(data);
      })
      .catch((error) => {
        if (!active) return;
        setProfileError(error instanceof Error ? error.message : 'Profiel kon niet worden geladen.');
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  if (sessionLoading) {
    return <FullScreenMessage title="Hacar Academy" text="Inlogsessie wordt gecontroleerd..." />;
  }

  if (!session) {
    return <LoginView />;
  }

  if (profileError) {
    return <FullScreenMessage error title="Profiel niet beschikbaar" text={profileError} />;
  }

  if (!profile) {
    return <FullScreenMessage title="Hacar Academy" text="Gebruikersprofiel wordt geladen..." />;
  }

  function navigate(view) {
    setSelectedStudentId(null);
    setCurrentView(view);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AppShell profile={profile} currentView={currentView} onNavigate={navigate} onLogout={logout}>
      {currentView === 'dashboard' && !selectedStudentId && (
        <DashboardView
          profile={profile}
          onSelectStudent={(studentId) => setSelectedStudentId(studentId)}
          onOpenAnalytics={() => navigate('analytics')}
        />
      )}

      {selectedStudentId && (
        <StudentDetailView
          studentId={selectedStudentId}
          profile={profile}
          onBack={() => setSelectedStudentId(null)}
        />
      )}

      {currentView === 'analytics' && !selectedStudentId && (
        <AnalyticsView onSelectStudent={(studentId) => setSelectedStudentId(studentId)} />
      )}

      {currentView === 'admin' && !selectedStudentId && profile.role === 'admin' && (
        <AdminView profile={profile} />
      )}
    </AppShell>
  );
}
