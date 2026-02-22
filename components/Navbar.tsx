import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCart, 
  Sun, 
  Moon, 
  Store, 
  User, 
  LogIn, 
  LayoutDashboard, 
  Calculator,
  Menu,
  X,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme, cartCount } = useStore();
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.roles?.includes('administrator');

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: any }) => (
    <Link 
      to={to} 
      className={`
        relative px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group
        ${isActive(to) 
          ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
        }
      `}
    >
      {Icon && <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive(to) ? 'fill-current' : ''}`} />}
      {children}
      {isActive(to) && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full mb-1" />
      )}
    </Link>
  );

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b rounded-2xl mb-4
          ${scrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-sm py-2' 
            : 'bg-white dark:bg-gray-900 border-transparent py-3 md:py-4'
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 relative">
            
            {/* Right Side - Navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-1 justify-start">
              <NavLink to="/" icon={Store}>خانه</NavLink>
              <NavLink to="/store" icon={Store}>فروشگاه</NavLink>
              <NavLink to="/training" icon={Calculator}>تمرین</NavLink>
              {user && <NavLink to="/dashboard" icon={GraduationCap}>مدرسه من</NavLink>}
            </div>

            {/* Mobile Menu Button (Right) */}
            <div className="md:hidden flex items-center justify-start z-20">
               <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -mr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Link to="/" className="group flex flex-col items-center">
                <div className={`
                  relative flex items-center justify-center transition-all duration-500
                  ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}
                `}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-20 dark:opacity-40"></div>
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-600 to-primary-400 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform shadow-lg shadow-primary-500/30 flex items-center justify-center text-white">
                    <Store className={`${scrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  </div>
                </div>
                {!scrolled && (
                  <span className="mt-1 text-[10px] font-black tracking-wider text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full whitespace-nowrap hidden md:block">
                    کودکان هوشمند
                  </span>
                )}
              </Link>
            </div>

            {/* Left Side - Actions */}
            <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end z-20">
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 md:w-5 md:h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 md:right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-sm ring-2 ring-white dark:ring-gray-900">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Buttons (Desktop) */}
              <div className="hidden md:flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
                {isAdmin && (
                  <Link to="/admin" className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs" title="پنل مدیریت">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                
                {user ? (
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 pl-3 pr-1 py-1 rounded-full transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shadow-inner group-hover:scale-105 transition-transform">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold max-w-[100px] truncate">{user.display_name}</span>
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5">
                    <span>ورود</span>
                    <LogIn className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Mobile Auth Icon (if logged in) */}
              {user && (
                <Link to="/profile" className="md:hidden p-1 rounded-full ml-[-4px]">
                   <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shadow-inner">
                      {user.username.slice(0, 1).toUpperCase()}
                   </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[300px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-gray-800">
            
            {/* Menu Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <span className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-600">
                  <Store className="w-5 h-5" />
                </div>
                کودکان هوشمند
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* User Section */}
              {user ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{user.display_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.username}</div>
                    </div>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    مدیریت حساب کاربری
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="flex items-center justify-center gap-3 p-4 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/20 active:scale-95 transition-transform">
                  <LogIn className="w-5 h-5" />
                  <div className="font-bold">ورود / ثبت نام</div>
                </Link>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 px-4 mb-2 uppercase tracking-wider">دسترسی سریع</div>
                <Link to="/" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <Store className="w-5 h-5 text-gray-400" />
                  صفحه اصلی
                </Link>
                <Link to="/store" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <Store className="w-5 h-5 text-gray-400" />
                  فروشگاه محصولات
                </Link>
                <Link to="/training" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <Calculator className="w-5 h-5 text-gray-400" />
                  تمرین چرتکه
                </Link>
                <Link to="/cooperation" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  همکاری با ما
                </Link>
              </div>

              {isAdmin && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-bold text-gray-400 px-4 mb-2 uppercase tracking-wider">مدیریت</div>
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    پنل ادمین
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
              >
                <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                  {isDarkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                  {isDarkMode ? 'حالت شب' : 'حالت روز'}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-1' : 'right-1'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
};

export default Navbar;
