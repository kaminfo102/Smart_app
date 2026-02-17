
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertTriangle, ArrowLeft, Mail, UserPlus, MapPin, Briefcase, Eye, EyeOff, Phone, CheckCircle, XCircle, X } from 'lucide-react';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [representative, setRepresentative] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { login, register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  // Helper to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Auto hide after 4 seconds
    setTimeout(() => {
        setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync Auth Context Error with Notification
  useEffect(() => {
      if (authError) {
          showNotification(authError, 'error');
      }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await login(username, password);
        
        showNotification('ورود با موفقیت انجام شد! در حال انتقال...', 'success');
        
        // Short delay to show success message before redirect
        setTimeout(() => {
            const currentUser = authService.getCurrentUser();
            if (currentUser?.roles?.includes('instructor')) {
                navigate('/instructor');
            } else if (currentUser?.roles?.includes('administrator')) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }, 1000);

      } else {
        // Validation for Registration
        if (password !== confirmPassword) {
            showNotification('رمز عبور و تکرار آن مطابقت ندارند.', 'error');
            return;
        }

        // Mobile Validation (Iran Format)
        const mobileRegex = /^0?9\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            showNotification('لطفا شماره موبایل معتبر وارد کنید (مثال: 09185227309).', 'error');
            return;
        }

        await register({ username, password, email, firstName, lastName, mobile: mobile });
        showNotification('ثبت نام با موفقیت انجام شد. لطفا وارد شوید.', 'success');
        
        setIsLoginMode(true);
        // Reset fields
        setPassword('');
        setConfirmPassword('');
        setMobile('');
      }
    } catch (err) {
      // Error is handled in context and useEffect above, 
      // but if register throws directly we might catch it here if not handled in context
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10 relative">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-top-5 fade-in ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="font-bold text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        
        {/* Toggle Header */}
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-8">
            <button
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${isLoginMode ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
                ورود
            </button>
            <button
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${!isLoginMode ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
                ثبت نام
            </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl mb-4 text-primary-600 dark:text-primary-400">
            {isLoginMode ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoginMode ? 'ورود به مدرسه' : 'ثبت نام دانش‌آموز'}
          </h1>
        </div>

        {/* Removed static error div in favor of toast notification */}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLoginMode && (
            <>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">نام</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">نام خانوادگی</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                 </div>
             </div>

             {/* Mobile Number Field */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">شماره موبایل <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-primary-500 outline-none transition-all dir-ltr text-right"
                    placeholder="09123456789"
                    required
                  />
                  <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
             </div>

             {/* Location & Representative */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">استان</label>
                    <select 
                        value={province} onChange={e => setProvince(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">انتخاب...</option>
                        <option value="Tehran">تهران</option>
                        <option value="Kurdistan">کردستان</option>
                        <option value="Isfahan">اصفهان</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">نمایندگی</label>
                    <div className="relative">
                         <select 
                            value={representative} onChange={e => setRepresentative(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="">انتخاب...</option>
                            <option value="1">نمایندگی مرکزی</option>
                            <option value="2">شعبه غرب</option>
                        </select>
                        <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                 </div>
             </div>
             </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">کد ملی (نام کاربری)</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-primary-500 outline-none transition-all dir-ltr text-right"
                placeholder="0012345678"
                required
              />
              <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {!isLoginMode && (
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">ایمیل (اختیاری)</label>
                <div className="relative">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-primary-500 outline-none transition-all dir-ltr text-right"
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 pr-10 focus:ring-2 focus:ring-primary-500 outline-none transition-all dir-ltr text-right"
                placeholder="••••••••"
                required
              />
              {/* Lock moved to Right */}
              <Lock className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
              {/* Eye moved to Left */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password - Only in Registration Mode */}
          {!isLoginMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">تکرار رمز عبور</label>
                <div className="relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 pr-10 focus:ring-2 focus:ring-primary-500 outline-none transition-all dir-ltr text-right"
                    placeholder="••••••••"
                    required
                />
                {/* Lock moved to Right */}
                <Lock className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
                {/* Eye moved to Left */}
                <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? (
               <>
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 <span>لطفا صبر کنید...</span>
               </>
            ) : (
                <>
                    <span>{isLoginMode ? 'ورود' : 'ثبت نام و شروع'}</span>
                    <ArrowLeft className="w-5 h-5" />
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
