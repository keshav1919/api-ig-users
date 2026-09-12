import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, HelpCircle, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const navTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Plans', path: '/plans', icon: Search },
    { label: 'FAQ', path: '/faq', icon: HelpCircle },
    { label: 'Profile', path: '/support', icon: User },
  ];

  return (
    <nav
      aria-label="Instagram Mobile Navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40 bg-white border-t border-[#DBDBDB] h-12 px-3 flex items-center justify-around safe-area-pb"
    >
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.label}
            to={tab.path}
            aria-label={tab.label}
            className="flex items-center justify-center p-2 text-[#262626] active:scale-90 transition-transform"
          >
            <Icon
              className={`w-6 h-6 ${
                isActive ? 'stroke-[2.5] text-[#262626]' : 'stroke-[1.8] text-[#262626]'
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
