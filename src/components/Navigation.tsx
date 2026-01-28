import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart3 } from 'lucide-react';
import { classNames } from '../utils/helpers';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/progress', icon: BarChart3, label: 'Progress' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  // Hide nav on active workout pages
  if (location.pathname.includes('/workout/')) {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/50 tab-bar">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-2 px-6"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-primary-500/10 rounded-xl"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <Icon
                className={classNames(
                  'w-6 h-6 transition-colors relative z-10',
                  isActive ? 'text-primary-500' : 'text-dark-400'
                )}
              />
              <span
                className={classNames(
                  'text-xs font-medium transition-colors relative z-10',
                  isActive ? 'text-primary-500' : 'text-dark-400'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

