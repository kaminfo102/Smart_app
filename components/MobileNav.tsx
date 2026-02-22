import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Calculator, User, LogIn, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, activeIconClass = '' }: { to: string; icon: any; label: string; activeIconClass?: string }) => (
    <Link 
      to={to} 
      className={`
        flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300
        ${isActive(to) 
          ? 'text-primary-600 dark:text-primary-400 -translate-y-1' 
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }
      `}
    >
      <Icon 
        className={`
          w-6 h-6 transition-all duration-300
          ${isActive(to) ? `fill-current ${activeIconClass}` : ''}
        `} 
      />
      <span className={`text-[10px] font-medium transition-all ${isActive(to) ? 'font-bold' : ''}`}>
        {label}
      </span>
      {isActive(to) && (
        <span className="absolute bottom-1 w-1 h-1 bg-primary-600 rounded-full" />
      )}
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden pb-safe transition-all duration-300 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 px-2 relative">
        
        <NavItem to="/" icon={Home} label="خانه" />
        <NavItem to="/store" icon={Store} label="فروشگاه" />

        {/* Center Floating Button */}
        <div className="relative -top-6">
          <Link 
            to={user ? "/dashboard" : "/training"} 
            className={`
              flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-primary-600/30 hover:scale-105 transition-transform border-4 border-gray-50 dark:border-gray-900
              ${isActive(user ? '/dashboard' : '/training') 
                ? 'bg-primary-700 text-white' 
                : 'bg-primary-600 text-white'
              }
            `}
          >
            {user ? <GraduationCap className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
          </Link>
        </div>

        <NavItem to="/training" icon={Calculator} label="تمرین" />
        
        {user ? (
          <NavItem to="/profile" icon={User} label="پروفایل" activeIconClass="fill-current" />
        ) : (
          <NavItem to="/login" icon={LogIn} label="ورود" />
        )}

      </div>
    </div>
  );
};

export default MobileNav;
