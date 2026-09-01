import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { tabs } from './navTabs';

/**
 * Barra de navegação do celular.
 *
 * Antes usava `backdrop-filter: blur(24px)` sobre um filete de 1px, e o roxo
 * do estado ativo era `hsl(262, 83%, 58%)` cravado no arquivo — um roxo que
 * não é o da marca (`--primary` é 248 72% 58%). Na prática a barra ficava
 * levemente de outra cor que o resto do app, e ninguém percebia porque as
 * duas eram "roxo".
 *
 * Agora: superfície chapada, traço de 2px e a aba ativa como pílula com
 * contorno — o mesmo "você está aqui" da sidebar e do menu mobile.
 */
const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="surface-chrome fixed bottom-0 left-0 right-0 z-50 border-t-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around h-[62px] max-w-lg mx-auto px-2 py-1.5 gap-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 rounded-button border-2 transition-colors duration-press ease-press ${
                isActive
                  ? 'border-primary/35 bg-accent text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              <tab.icon
                className="w-[22px] h-[22px]"
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 1.5 : 1.8}
                aria-hidden="true"
              />
              <span className="font-fredoka text-[11px] leading-tight font-bold">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
