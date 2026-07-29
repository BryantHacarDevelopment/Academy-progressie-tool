import React from 'react';
import { BarChart3, LayoutDashboard, LogOut, UserCog } from 'lucide-react';
import HacarLogo from './HacarLogo';
import { ROLE_LABELS } from '../constants';

export default function AppShell({ profile, currentView, onNavigate, onLogout, children }) {
  const navItems = [
    { id: 'dashboard', label: 'Leerlingen', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
  ];

  if (profile.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Beheer', icon: UserCog });
  }

  return (
    <div className="min-h-screen bg-[#E5E0D9] text-[#1D252C]">
      <header className="bg-[#36563D] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 min-h-16 py-2 flex flex-wrap gap-3 justify-between items-center">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3"
          >
            <div className="bg-white px-2 py-1.5 rounded-xl shadow-sm">
              <HacarLogo className="h-9 sm:h-10 w-auto max-w-[220px]" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-[11px] text-white/75 font-semibold">Progressieportaal</div>
            </div>
          </button>

          <nav className="order-3 w-full sm:order-none sm:w-auto flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap ${
                    active ? 'bg-white text-[#36563D]' : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold">{profile.full_name}</div>
              <div className="text-[11px] text-white/70">
                {ROLE_LABELS[profile.role]}{profile.branch ? ` · ${profile.branch}` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-white/10"
              title="Uitloggen"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
