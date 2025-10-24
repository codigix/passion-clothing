import React, { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { StoreProvider } from '../../contexts/StoreContext';

const drawerWidth = 256;
const collapsedDrawerWidth = 80;

const capitalize = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  const headerTitle = useMemo(() => {
    const path = location.pathname || '/';
    if (path === '/' || path === '') {
      return user?.department ? `${capitalize(user.department)} Dashboard` : 'Dashboard';
    }

    const segments = path.split('/').filter(Boolean);
    if (!segments.length) {
      return 'Dashboard';
    }

    return segments.map(capitalize).join(' / ');
  }, [location.pathname, user?.department]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <StoreProvider>
      <div className="flex min-h-screen  from-slate-50 via-gray-50 to-slate-100">
        <Sidebar open={sidebarOpen} onToggle={handleToggleSidebar} />

        <main
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden ${
            sidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-lg text-slate-600 hover:r hover:from-purple-50 hover:to-pink-50 hover:text-slate-900 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {headerTitle}
                  </h1>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-1"></div>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 r from-purple-500 via-pink-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white">
                      {user.name?.[0] || user.email?.[0] || '?'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <section className="flex-1 p-4 md:p-6">
            {children}
          </section>
        </main>
      </div>
    </StoreProvider>
  );
};

export default DashboardLayout;