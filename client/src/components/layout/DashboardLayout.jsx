import React, { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { StoreProvider } from '../../contexts/StoreContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onToggle={handleToggleSidebar} />

        <main
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden ${
            sidebarOpen ? 'ml-60' : 'ml-16'
          }`}
        >
          <header className="sticky top-0 z-50 bg-white border-gray-200 border-b shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center">
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Menu size={20} />
                </button>
                <h1 className="ml-4 text-xl font-semibold text-gray-900">
                  {headerTitle}
                </h1>
              </div>
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.[0] || user.email?.[0] || '?'}
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