
import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, Grid, Sun, Moon, Search, Store, Settings, LogIn, User, LogOut, ShoppingBag, Calculator, LayoutDashboard, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode, toggleTheme, cartCount } = useStore();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.roles?.includes('administrator');
  const isInstructor = user?.roles?.includes('instructor') || isAdmin; // Simple check

  const isActive = (path: string) => location.pathname === path;

  // Don't show layout on admin panel or course viewer if it has its own sidebar
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/course/')) {
      return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Desktop/Tablet Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-tr from-primary-600 to-primary-500 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20">
                    <Store size={22} />
                </div>
                <span className="font-black text-lg sm:text-xl tracking-tight hidden sm:block text-gray-800 dark:text-white">کودکان <span className="text-primary-600">هوشمند</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
             
             {/* Desktop Navigation Links */}
             <nav className="hidden md:flex items-center gap-6 mx-4 text-sm font-bold">
                <Link to="/" className={`${isActive('/') ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 transition-colors`}>خانه</Link>
                {user && (
                  <Link to="/dashboard" className={`${isActive('/dashboard') ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 transition-colors flex items-center gap-1`}>
                    <GraduationCap className="w-4 h-4" />
                    مدرسه من
                  </Link>
                )}
                <Link to="/store" className={`${isActive('/store') ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 transition-colors`}>فروشگاه</Link>
                <Link to="/training" className={`${isActive('/training') ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 flex items-center gap-1 transition-colors`}>
                    <Calculator className="w-4 h-4" />
                    تمرین آزاد
                </Link>
             </nav>

             {/* Theme Toggle - Now visible on mobile */}
             <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
              aria-label="تغییر تم"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {isAdmin && (
                <Link to="/admin" className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 transition-colors" title="پنل مدیریت">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">پنل مدیریت</span>
                </Link>
            )}
            
            {isInstructor && (
                 <Link to="/instructor" className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs flex items-center gap-1 transition-colors" title="پنل مربی">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">مربی</span>
                 </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-0">
                 <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 sm:px-3 py-1.5 rounded-full transition-colors group">
                     <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shadow-inner group-hover:scale-105 transition-transform">
                         {user.username.slice(0, 1).toUpperCase()}
                     </div>
                     <span className="text-sm font-bold hidden lg:block max-w-[100px] truncate">{user.display_name}</span>
                 </Link>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-all">
                  <span className="hidden md:inline">ورود / عضویت</span>
                  <LogIn className="w-4 h-4 md:hidden" />
              </Link>
            )}

            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-sm ring-2 ring-white dark:ring-gray-900">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden pb-safe transition-all duration-300">
        <div className="flex justify-around items-center h-16 px-2">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Home className={`w-6 h-6 ${isActive('/') && 'fill-current'}`} />
            <span className="text-[10px] font-medium">خانه</span>
          </Link>

          
            <Link to="/store" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/store') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <Store className={`w-6 h-6 ${isActive('/store') && 'fill-current'}`} />
                <span className="text-[10px] font-medium">فروشگاه</span>
            </Link>
          

          {user &&(
            <div className="relative -top-5">
              <Link to="/dashboard" className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </Link>
          </div>

          )}
          
{ /*<div className="relative -top-5">
              <Link to="/store" className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </Link>
          </div> */}

          <Link to="/training" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/training') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Calculator className={`w-6 h-6 ${isActive('/training') && 'fill-current'}`} />
            <span className="text-[10px] font-medium">تمرین</span>
          </Link>

          {user ? (
             <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <User className={`w-6 h-6 ${isActive('/profile') && 'fill-current'}`} />
                <span className="text-[10px] font-medium">پروفایل</span>
             </Link>
          ) : (
             <Link to="/login" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/login') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <LogIn className="w-6 h-6" />
                <span className="text-[10px] font-medium">ورود</span>
             </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
