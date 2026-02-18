
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lmsService } from '../services/lmsService';
import { Term } from '../types';
import { Lock, Play, ShoppingCart, CheckCircle, Clock, Trophy, Star, Shield, ArrowRight, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../constants';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const initTerms = async () => {
            // 1. Load from cache first
            const cached = lmsService.getCachedTerms();
            if (cached && cached.length > 0) {
                setTerms(cached);
                setLoading(false);
            }

            // 2. Fetch fresh
            try {
                const freshTerms = await lmsService.getTerms(true);
                setTerms(freshTerms);
                setLoading(false);
            } catch (e) {
                console.error("Failed to refresh terms");
                if(!cached) setLoading(false);
            }
        };

        initTerms();
    }, [user, navigate]);

    // Force refresh when needed
    const reloadTerms = () => {
        setLoading(true);
        lmsService.getTerms(true)
            .then(setTerms)
            .catch(err => console.error("Failed to load terms", err))
            .finally(() => setLoading(false));
    };

    if (!user) return null;

    const handleTermClick = async (term: Term) => {
        if (term.status === 'active') {
            navigate(`/course/${term.id}`);
        }
    };

    const handleRequestActivation = async (e: React.MouseEvent, term: Term) => {
        e.stopPropagation(); 
        
        const confirmMsg = term.status === 'rejected' 
            ? `درخواست قبلی شما برای "${term.title}" رد شده است. آیا می‌خواهید درخواست جدیدی ارسال کنید؟` 
            : `آیا مایل به ارسال درخواست فعالسازی برای "${term.title}" هستید؟\n\nپس از تایید، درخواست شما برای مربی ارسال شده و پس از بررسی فعال خواهد شد.`;

        if(window.confirm(confirmMsg)) {
             setActionLoading(term.id);
             try {
                 await lmsService.purchaseTerm(user, term.id);
                 alert('درخواست شما با موفقیت ثبت شد و در انتظار تایید مربی است.');
                 reloadTerms(); 
             } catch (err: any) {
                 console.error(err);
                 alert('خطا در ثبت درخواست: ' + (err.message || 'لطفا دوباره تلاش کنید.'));
             } finally {
                 setActionLoading(null);
             }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
            {/* Header / Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-6 md:p-10 text-white mb-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-lg">
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">سلام، {user.first_name || user.display_name} 👋</h1>
                            <p className="text-indigo-200 text-sm">به کلاس درس خوش اومدی! آماده یادگیری هستی؟</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                            <div className="flex items-center justify-center gap-1 text-yellow-300 font-bold mb-1">
                                <Trophy className="w-4 h-4" />
                                <span>سکه</span>
                            </div>
                            <div className="text-2xl font-black">{user.coins || 0}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                             <div className="flex items-center justify-center gap-1 text-green-300 font-bold mb-1">
                                <Star className="w-4 h-4" />
                                <span>امتیاز</span>
                            </div>
                            <div className="text-2xl font-black">{user.points || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Path */}
            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary-600" />
                        مسیر یادگیری شما
                    </h2>
                    
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-500">در حال دریافت ترم‌های آموزشی...</p>
                            </div>
                        ) : terms.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800 rounded-3xl">هیچ ترم آموزشی یافت نشد.</div>
                        ) : (
                            terms.map((term) => (
                                <div 
                                    key={term.id}
                                    onClick={() => !actionLoading && term.status === 'active' && handleTermClick(term)}
                                    className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 border-2 transition-all cursor-pointer overflow-hidden
                                        ${term.status === 'active' ? 'border-primary-500 shadow-lg hover:shadow-primary-500/20' : 
                                          term.status === 'purchased_pending' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 cursor-default' : 
                                          term.status === 'rejected' ? 'border-red-400 bg-red-50 dark:bg-red-900/10' :
                                          'border-gray-100 dark:border-gray-700 opacity-90 hover:border-gray-300'}`}
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-200 relative">
                                            <img src={term.image || 'https://via.placeholder.com/150'} alt={term.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            {term.status === 'locked' && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Lock className="text-white w-8 h-8" /></div>}
                                        </div>
                                        
                                        <div className="flex-1 text-center md:text-right">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                <h3 className="text-lg font-bold">{term.title}</h3>
                                                {term.status === 'active' && <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">فعال</span>}
                                                {term.status === 'purchased_pending' && <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-bold animate-pulse">در انتظار بررسی</span>}
                                                {term.status === 'rejected' && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">درخواست رد شد</span>}
                                                {term.status === 'locked' && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">قفل</span>}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{term.description}</p>
                                            
                                            <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-gray-400">
                                                <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {term.lessons_count} درس</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ۳۰ روز مهلت</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {actionLoading === term.id ? (
                                                <button className="bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-wait" disabled>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    لطفا صبر کنید
                                                </button>
                                            ) : term.status === 'active' ? (
                                                <button onClick={() => navigate(`/course/${term.id}`)} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/30">
                                                    ورود به کلاس
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : term.status === 'purchased_pending' ? (
                                                <div className="text-yellow-600 px-4 py-2 rounded-xl font-bold text-sm bg-yellow-100/50 flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>در انتظار تایید مربی</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-80">لطفا شکیبا باشید</span>
                                                </div>
                                            ) : term.status === 'rejected' ? (
                                                <button 
                                                    onClick={(e) => handleRequestActivation(e, term)}
                                                    className="bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-200 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    درخواست مجدد
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={(e) => handleRequestActivation(e, term)}
                                                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-xl font-bold flex items-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-colors"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    درخواست فعالسازی
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold mb-4">آمار عملکرد</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">دقت پاسخگویی</span>
                                <span className="font-bold text-green-600">۸۵٪</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">ترم‌های تکمیل شده</span>
                                <span className="font-bold text-blue-600">۰ / ۴</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white text-center shadow-lg">
                        <Trophy className="w-12 h-12 mx-auto mb-2 text-white/90" />
                        <h3 className="font-bold text-lg mb-1">لیگ قهرمانان</h3>
                        <p className="text-sm text-white/80 mb-4">در مسابقات استانی شرکت کن و جایزه بگیر!</p>
                        <button className="bg-white text-orange-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors w-full">
                            مشاهده جدول رده‌بندی
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
