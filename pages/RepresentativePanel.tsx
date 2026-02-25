import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ShoppingBag, GraduationCap, BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Store from './Store';
import RepresentativeUsers from '../components/Representative/RepresentativeUsers';

const RepresentativePanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'store' | 'students' | 'instructors'>('dashboard');

  console.log('RepresentativePanel rendering, user:', user);

  if (!user || !user.roles?.some(r => r.toLowerCase() === 'representative')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">دسترسی غیرمجاز</h1>
          <p className="mb-4">نقش شما: {user?.roles?.join(', ')}</p>
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">بازگشت به خانه</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        activeTab === id 
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm sticky top-24 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/30">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">{user.display_name}</h2>
                  <p className="text-xs text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg w-fit mt-1">پنل نمایندگی</p>
                </div>
              </div>

              <div className="space-y-2">
                <SidebarItem id="dashboard" icon={LayoutDashboard} label="داشبورد" />
                <SidebarItem id="store" icon={ShoppingBag} label="فروشگاه و سفارش" />
                <SidebarItem id="students" icon={GraduationCap} label="مدیریت دانش‌آموزان" />
                <SidebarItem id="instructors" icon={BookOpen} label="مدیریت مربیان" />
                
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">خروج</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-4">خوش آمدید</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    به پنل نمایندگی خوش آمدید. از منوی سمت راست برای مدیریت کاربران و ثبت سفارش استفاده کنید.
                  </p>
                </div>
                {/* Add stats here later */}
              </div>
            )}

            {activeTab === 'store' && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px]">
                 <Store />
              </div>
            )}

            {activeTab === 'students' && (
              <RepresentativeUsers 
                currentUser={user} 
                targetRole="student" 
                title="مدیریت دانش‌آموزان" 
              />
            )}

            {activeTab === 'instructors' && (
              <RepresentativeUsers 
                currentUser={user} 
                targetRole="instructor" 
                title="مدیریت مربیان" 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RepresentativePanel;
