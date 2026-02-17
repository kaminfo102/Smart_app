
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertTriangle, ArrowLeft, Mail, UserPlus, MapPin, Briefcase, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [representative, setRepresentative] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false); // Toggle for main password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password

  const { login, register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await login(username, password);
        
        // Post-login redirect logic
        const currentUser = authService.getCurrentUser();
        if (currentUser?.roles?.includes('instructor')) {
            navigate('/instructor');
        } else if (currentUser?.roles?.includes('administrator')) {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }

      } else {
        // Validation for Registration
        if (password !== confirmPassword) {
            alert('رمز عبور و تکرار آن مطابقت ندارند.');
            return;
        }

        // Register with extra fields (mocked in authService usually)
        await register({ username, password, email, firstName, lastName });
        alert('ثبت نام با موفقیت انجام شد. لطفا وارد شوید.');
        setIsLoginMode(true);
        // Reset fields
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
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

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-start gap-2 animate-pulse">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

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
