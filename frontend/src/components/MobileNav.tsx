import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Search, Target, Repeat, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Explore', path: '/explore', icon: Search },
    { label: 'Practice', path: '/practice', icon: Target },
    { label: 'Revision', path: '/revision', icon: Repeat },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-indigo-brand font-bold bg-indigo-50/70'
                  : 'text-slate-500 hover:text-navy-brand'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 mb-0.5 ${
                    isActive ? 'text-indigo-brand stroke-[2.5]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
