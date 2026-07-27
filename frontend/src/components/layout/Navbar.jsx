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
  Activity,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { profile, logoutAthlete, theme, toggleTheme } = useAthlete();
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
    <nav className="sticky top-0 z-50 w-full neu-flat border-b border-[var(--border-subtle)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-theme-primary animate-pulse" />
            <span className="font-sans text-xl font-black tracking-wider text-[var(--text-main)]">
              ATHLETE<span className="text-theme-primary">IQ</span>
            </span>
          </div>

          {/* Nav Links - Neumorphic Toggles */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'neu-button-active text-theme-primary border border-[var(--accent-primary)]/30'
                        : 'neu-button text-[var(--text-muted)] hover:text-theme-primary'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Status / Theme Toggle / Reset */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden lg:block text-right">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">{profile.sport || 'Athlete'}</p>
                <p className="text-xs font-bold text-theme-primary">{profile.name}</p>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="neu-button p-2.5 text-theme-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-rose-500" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="neu-button px-3.5 py-2 text-[var(--text-muted)] hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
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
