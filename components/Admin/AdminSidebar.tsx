
import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, LogOut, X, Menu, BookOpen, HelpCircle, Image, Calendar, ArrowRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: 'dashboard' | 'users' | 'orders' | 'lms' | 'hero' | 'events' | 'help' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'users' | 'orders' | 'lms' | 'hero' | 'events' | 'help' | 'settings') => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'lms', label: 'مدیریت ترم‌ها', icon: BookOpen },
    { id: 'hero', label: 'مدیریت اسلایدر', icon: Image },
    { id: 'events', label: 'مدیریت رویدادها', icon: Calendar },
    { id: 'orders', label: 'سفارشات', icon: ShoppingBag },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
    { id: 'help', label: 'راهنمای نصب', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none md:static md:transform-none
        flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
         <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
             <h1 className="font-black text-xl text-gray-800 dark:text-white flex items-center gap-2">
                <span className="bg-primary-600 text-white p-1 rounded-lg text-xs">Admin</span>
                پنل مدیریت
             </h1>
             <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                 <X className="w-5 h-5" />
             </button>
         </div>

         <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
             {menuItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id as any);
                        if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                        activeTab === item.id 
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                 >
                     <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'fill-current opacity-20' : ''}`} />
                     <span>{item.label}</span>
                 </button>
             ))}
         </nav>

         <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
         <button 
            onClick={() => {
                navigate('/');
                onLogout();
            }} 
            className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-xl transition-colors"
         >
             <LogOut className="w-5 h-5" />
             <span className="font-bold">خروج</span>
         </button>
         <button 
            onClick={() => {
                navigate('/');
                
            }} 
            className="w-full flex items-center gap-3 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 px-4 py-3 rounded-xl transition-colors"
         >
             <LogOut className="w-5 h-5" />
             <span className="font-bold">صفحه اصلی</span>
         </button>
         </div>
         
      </aside>
    </>
  );
};

export default AdminSidebar;
