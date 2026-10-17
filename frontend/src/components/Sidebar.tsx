import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Search,
  Target,
  Repeat,
  User,
  MessageSquare,
  Settings,
  Sparkles,
  Camera
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Explore ISL', path: '/explore', icon: Search },
    { label: 'Practice', path: '/practice', icon: Target },
    { label: 'Revision', path: '/revision', icon: Repeat },
    { label: 'Conversation', path: '/conversation', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200/80 px-4 py-6 select-none z-30 flex-shrink-0">
      {/* Brand Logo & Wordmark */}
      <NavLink to="/" className="flex items-center gap-3 px-3 mb-8 group">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-brand via-berry-brand to-coral-brand flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <img src="/logo-mark.svg" alt="Signova Logo" className="w-9 h-9" />
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-navy-brand block leading-none">
            Sign<span className="text-berry-brand">ova</span>
          </span>
          <span className="text-[11px] font-medium text-navy-muted tracking-wide block mt-1">
            A New Way to Connect
          </span>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-brand shadow-sm font-bold border border-indigo-100'
                    : 'text-slate-600 hover:text-navy-brand hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-brand stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.path === '/revision' && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-berry-50 text-berry-700 border border-berry-100">
                      SRS
                    </span>
                  )}
                  {item.path === '/practice' && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ISL Heritage & Mission Callout */}
      <div className="mt-auto p-3.5 bg-softrose/70 border border-coral-200/70 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-berry-brand flex-shrink-0" />
          <span className="text-xs font-bold text-berry-brand uppercase tracking-wider">
            Authentic ISL
          </span>
        </div>
        <p className="text-[11px] text-navy-muted leading-relaxed">
          Teaching real Indian Sign Language with verified educators and Deaf community guidance.
        </p>
      </div>
    </aside>
  );
};
