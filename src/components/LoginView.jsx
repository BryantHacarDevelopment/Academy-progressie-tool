import React, { useState } from 'react';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import HacarLogo from './HacarLogo';
import { supabase, supabaseConfigError } from '../supabaseClient';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(supabaseConfigError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!supabase) {
      setErrorMessage(supabaseConfigError || 'Supabase is niet ingesteld.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(`Inloggen mislukt: ${error.message}`);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Onbekende inlogfout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HacarLogo className="h-24 sm:h-28 w-auto max-w-full" />
          </div>
          <h1 className="text-2xl font-bold text-[#1D252C]">Progressieportaal</h1>
          <p className="text-sm text-slate-500 mt-1">Log in met je Hacar Academy-account</p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#36563D] outline-none"
                placeholder="naam@hacar.nl"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
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
            className="w-full bg-[#36563D] hover:bg-[#2a4330] disabled:bg-slate-400 text-white py-3 px-4 rounded-lg font-bold text-sm transition-all"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
