import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader';
import BottomTabBar from '@/components/BottomTabBar';
import FloatingOrbs from '@/components/FloatingOrbs';
import { useIsMobile } from '@/hooks/use-mobile';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full relative bg-background">
      <FloatingOrbs />

      {/* Desktop sidebar only */}
      {!isMobile && (
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <AppHeader
          onToggleSidebar={() => setCollapsed(!collapsed)}
          isMobile={isMobile}
        />
        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && <BottomTabBar />}
    </div>
  );
};

export default MainLayout;
