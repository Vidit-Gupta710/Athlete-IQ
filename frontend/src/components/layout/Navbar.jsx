import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAthlete from '../../hooks/useAthlete';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Calendar, 
  Network, 
  UserCheck, 
  LogOut,
  Activity
} from 'lucide-react';

export default function Navbar() {
  const { profile, logoutAthlete } = useAthlete();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAthlete();
    navigate('/');
  };

  const navItems = [
    { to: '/', label: 'Onboarding', icon: UserCheck },
    { to: '/chat', label: 'Athlete Chat', icon: MessageSquare },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/timeline', label: 'Timeline', icon: Calendar },
    { to: '/graph', label: 'Injury Graph', icon: Network },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
            <span className="font-sans text-xl font-black tracking-wider text-white">
              ATHLETE<span className="text-emerald-400">IQ</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Status / Log out */}
          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden lg:block text-right">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{profile.sport || 'Athlete'}</p>
                <p className="text-sm font-bold text-slate-200">{profile.name}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-red-950/30 hover:border-red-900 text-slate-400 hover:text-red-400 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
              title="Reset Onboarding"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
