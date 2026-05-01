import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Heart, CircleUser } from 'lucide-react';
import tecaIcon from '@/assets/teca-icon.png';
const tabs = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/catalog', label: 'Catálogo', icon: BookOpen },
  { path: '/ai-plan', label: 'Teca', icon: null, isCenter: true },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/profile', label: 'Perfil', icon: CircleUser },
];

const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Background bar */}
      <div
        className="absolute inset-0 border-t border-border/30"
        style={{
          background: 'hsla(var(--background), 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      />

      <div className="relative flex items-end justify-around h-[56px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          if (tab.isCenter) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center flex-1"
                style={{ marginTop: '-12px' }}
              >
                <div className="w-14 h-14 flex items-center justify-center transition-transform duration-200 active:scale-90">
                  <img src={tecaIcon} alt="Teca" className="w-14 h-14 object-contain drop-shadow-lg" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-all duration-200"
            >
              <div className="relative">
                <tab.icon
                  className="w-6 h-6 transition-all duration-200"
                  style={{ color: isActive ? 'hsl(262, 83%, 58%)' : '#9CA3AF' }}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 1.5 : 1.8}
                />
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'hsl(262, 83%, 58%)' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] leading-tight font-medium transition-colors duration-200"
                style={{ color: isActive ? 'hsl(262, 83%, 58%)' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
