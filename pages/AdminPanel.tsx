
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminUsers from '../components/Admin/AdminUsers';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminLMS from '../components/Admin/AdminLMS';
import AdminHelp from '../components/Admin/AdminHelp';

const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'lms' | 'help'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.roles?.includes('administrator')) {
        navigate('/');
    }
  }, [user, navigate]);

  if (!user || !user.roles?.includes('administrator')) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Sidebar Component */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h1 className="font-bold text-gray-800 dark:text-white">پنل مدیریت</h1>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
          </div>

          {/* Content Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                  {activeTab === 'dashboard' && <AdminDashboard currentUser={user} />}
                  {activeTab === 'users' && <AdminUsers currentUser={user} />}
                  {activeTab === 'orders' && <AdminOrders />}
                  {activeTab === 'lms' && <AdminLMS />}
                  {activeTab === 'help' && <AdminHelp />}
              </div>
          </main>
      </div>
    </div>
  );
};

export default AdminPanel;
