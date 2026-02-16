import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wooService } from '../services/wooService';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Save, CheckCircle, AlertTriangle, LogOut, MapPin, Phone, Shield, Users, ShoppingBag, Trash2, Edit, RefreshCw, Eye, Package, TrendingUp, Calendar, Target } from 'lucide-react';
import { Order, User as UserType, TrainingSession } from '../types';
import { formatPrice } from '../constants';

const Profile: React.FC = () => {
  const { user, updateUserProfile, logout, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders' | 'progress' | 'security' | 'admin_users' | 'admin_orders'>('info');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Data State
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [history, setHistory] = useState<TrainingSession[]>([]);
  
  // Admin Data State
  const [adminUsers, setAdminUsers] = useState<UserType[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Check Admin Role
  const isAdmin = user?.roles?.includes('administrator');

  // Fetch My Orders
  useEffect(() => {
      if (activeTab === 'orders' && user) {
          setLoadingOrders(true);
          wooService.getOrders({ customer: user.id }).then(data => {
              setMyOrders(data);
              setLoadingOrders(false);
          }).catch(e => {
              console.error(e);
              setLoadingOrders(false);
          });
      }
      
      if (activeTab === 'progress') {
          const sessions = authService.getTrainingHistory();
          setHistory(sessions);
      }
  }, [activeTab, user]);

  // Fetch Admin Data
  useEffect(() => {
      if (!isAdmin) return;

      const fetchAdminData = async () => {
          setLoadingAdmin(true);
          try {
              if (activeTab === 'admin_users') {
                  const data = await authService.getAllUsers(user!);
                  setAdminUsers(data);
              } else if (activeTab === 'admin_orders') {
                  const data = await wooService.getOrders(); // No customer filter -> all orders
                  setAdminOrders(data);
              }
          } catch (e) {
              console.error(e);
          } finally {
              setLoadingAdmin(false);
          }
      };
      
      if (activeTab === 'admin_users' || activeTab === 'admin_orders') {
          fetchAdminData();
      }
  }, [activeTab, isAdmin, user]);


  // Info State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Address State
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('IR');

  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setEmail(user.email || '');
        
        if (user.billing) {
            setPhone(user.billing.phone || '');
            setAddress1(user.billing.address_1 || '');
            setCity(user.billing.city || '');
            setState(user.billing.state || '');
            setPostcode(user.billing.postcode || '');
        }
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    
    try {
        const payload: any = {};
        
        if (activeTab === 'info') {
            payload.firstName = firstName;
            payload.lastName = lastName;
            payload.email = email;
        } 
        else if (activeTab === 'address') {
            payload.billing = {
                ...user?.billing,
                phone,
                address_1: address1,
                city,
                state,
                postcode,
                country,
                first_name: firstName || user?.first_name,
                last_name: lastName || user?.last_name,
                email: email || user?.email
            };
            payload.shipping = {
                ...user?.shipping,
                address_1: address1,
                city,
                state,
                postcode,
                country,
                first_name: firstName || user?.first_name,
                last_name: lastName || user?.last_name
            };
        }
        else if (activeTab === 'security') {
             if (password !== confirmPassword) {
                alert('رمز عبور و تکرار آن مطابقت ندارند.');
                return;
            }
            if (password.length < 6) {
                alert('رمز عبور باید حداقل ۶ کاراکتر باشد.');
                return;
            }
            payload.password = password;
        }

        await updateUserProfile(payload);
        setSuccessMsg('تغییرات با موفقیت ذخیره شد.');
        
        if (activeTab === 'security') {
            setPassword('');
            setConfirmPassword('');
        }
    } catch (err) {
        // Error handled in context
    }
  };

  // Admin Actions
  const handleDeleteUser = async (id: number) => {
      if (!window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
      try {
          await authService.deleteUser(user!, id);
          setAdminUsers(prev => prev.filter(u => u.id !== id));
      } catch (e) {
          alert('خطا در حذف کاربر');
      }
  };

  const handleDeleteOrder = async (id: number) => {
      if (!window.confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;
      try {
          await wooService.deleteOrder(id);
          setAdminOrders(prev => prev.filter(o => o.id !== id));
      } catch (e) {
          alert('خطا در حذف سفارش');
      }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
      try {
          await wooService.updateOrder(id, status);
          setAdminOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      } catch (e) {
          alert('خطا در تغییر وضعیت');
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
          case 'processing': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
          case 'on-hold': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
          case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
          case 'failed': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
          default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      }
  };

  const getStatusText = (status: string) => {
    switch(status) {
        case 'completed': return 'تکمیل شده';
        case 'processing': return 'در حال انجام';
        case 'on-hold': return 'در انتظار بررسی';
        case 'pending': return 'در انتظار پرداخت';
        case 'cancelled': return 'لغو شده';
        case 'failed': return 'ناموفق';
        default: return status;
    }
};

  if (!user) return null;

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="relative mb-20 px-4 mt-6">
         <div className="h-40 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         </div>
         <div className="absolute -bottom-16 right-10 flex items-end gap-6">
             <div className="w-32 h-32 rounded-3xl bg-white dark:bg-gray-900 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                 {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                 ) : (
                    <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-4xl uppercase">
                        {user.username.slice(0, 2)}
                    </div>
                 )}
             </div>
             <div className="mb-2 space-y-1">
                 <div className="flex items-center gap-2">
                     <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.display_name}</h1>
                     {isAdmin && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">مدیر کل</span>}
                 </div>
                 <p className="text-sm font-medium text-gray-500">@{user.username}</p>
             </div>
         </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 px-4">
         {/* Sidebar Navigation */}
         <div className="md:col-span-4 lg:col-span-3 space-y-4">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-2">
                 {[
                     { id: 'info', label: 'اطلاعات شخصی', icon: User },
                     { id: 'progress', label: 'پیشرفت من', icon: TrendingUp },
                     { id: 'address', label: 'آدرس و تماس', icon: MapPin },
                     { id: 'orders', label: 'سفارش‌های من', icon: ShoppingBag },
                     { id: 'security', label: 'امنیت و رمز عبور', icon: Shield },
                 ].map((item) => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === item.id 
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                     >
                         <item.icon className="w-5 h-5" />
                         {item.label}
                     </button>
                 ))}

                {isAdmin && (
                    <>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-700">پنل مدیریت</div>
                         <button
                            onClick={() => setActiveTab('admin_users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'admin_users' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                         >
                             <Users className="w-5 h-5" />
                             مدیریت کاربران
                         </button>
                         <button
                            onClick={() => setActiveTab('admin_orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'admin_orders' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                         >
                             <Package className="w-5 h-5" />
                             مدیریت سفارشات
                         </button>
                    </>
                )}

             </div>
             
             <button 
                onClick={logout}
                className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 transition-colors text-sm"
            >
                <LogOut className="w-5 h-5" />
                خروج از حساب
            </button>
         </div>

         {/* Main Content Area */}
         <div className="md:col-span-8 lg:col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
                
                {activeTab === 'info' && (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Info Form Content (Same as before) */}
                         <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">اطلاعات هویتی</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام خانوادگی</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">ایمیل</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                        </div>
                        <button onClick={handleUpdate} disabled={isLoading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl mt-4">ذخیره</button>
                    </form>
                )}

                {activeTab === 'progress' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">پیشرفت من</h2>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                <div className="text-3xl font-black text-primary-600 mb-1">{user.points || 0}</div>
                                <div className="text-xs text-gray-500 font-bold">مجموع امتیازات</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                <div className="text-3xl font-black text-green-600 mb-1">{history.length}</div>
                                <div className="text-xs text-gray-500 font-bold">تعداد تمرینات</div>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            تاریخچه تمرینات اخیر
                        </h3>

                        {history.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>هنوز تمرینی ثبت نشده است.</p>
                                <Link to="/training" className="text-primary-600 font-bold text-sm hover:underline mt-2 inline-block">شروع تمرین</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${session.mode === 'challenge' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {session.mode === 'challenge' ? 'C' : 'P'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{session.mode === 'challenge' ? 'چالش ریاضی' : 'تمرین آزاد'}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 dir-ltr text-right">{new Date(session.date).toLocaleDateString('fa-IR')}</div>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">+{session.score}</div>
                                            <div className="text-[10px] text-gray-400">امتیاز</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'address' && (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         {/* Address Form Content */}
                         <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">آدرس و تماس</h2>
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700 dark:text-gray-300">شماره موبایل</label>
                             <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">استان</label>
                                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">شهر</label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">آدرس دقیق</label>
                            <textarea value={address1} onChange={(e) => setAddress1(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none resize-none" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">کد پستی</label>
                            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                        </div>
                        <button onClick={handleUpdate} disabled={isLoading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl mt-4">ذخیره</button>
                    </form>
                )}

                {activeTab === 'orders' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">سفارش‌های من</h2>
                        </div>

                        {loadingOrders ? (
                            <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                در حال دریافت سفارش‌ها...
                            </div>
                        ) : myOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myOrders.map(order => (
                                    <div key={order.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:border-primary-200 dark:hover:border-primary-800">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold">سفارش #{order.id}</h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <span className="dir-ltr">{new Date(order.date_created).toLocaleDateString('fa-IR')}</span> | {order.line_items.length} محصول
                                                </p>
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-primary-600">{formatPrice(order.total)}</div>
                                                <div className="text-[10px] text-gray-500">تومان</div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                            <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                                {/* Placeholder for product images if available, otherwise just count */}
                                                <span className="text-xs text-gray-500">{order.line_items.map(i => i.name).join('، ')}</span>
                                            </div>
                                            <Link 
                                                to={`/order-received/${order.id}`}
                                                className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
                                            >
                                                <Eye className="w-4 h-4" />
                                                مشاهده فاکتور
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'security' && (
                     <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">امنیت</h2>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رمز عبور جدید</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">تکرار رمز عبور</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                        </div>
                        <button onClick={handleUpdate} disabled={isLoading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl mt-4">ذخیره</button>
                     </form>
                )}

                {activeTab === 'admin_users' && isAdmin && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">مدیریت کاربران</h2>
                            </div>
                            <span className="text-sm text-gray-500">{adminUsers.length} کاربر</span>
                        </div>

                        {loadingAdmin ? (
                            <div className="text-center py-10 text-gray-500">در حال بارگذاری...</div>
                        ) : (
                            <div className="space-y-4">
                                {adminUsers.map(u => (
                                    <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{u.display_name}</div>
                                                <div className="text-xs text-gray-500">@{u.username} | {u.email}</div>
                                                <div className="text-[10px] mt-1 text-primary-500">{u.roles?.join(', ')}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center gap-2 justify-center"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'admin_orders' && isAdmin && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">مدیریت سفارشات</h2>
                            </div>
                            <button onClick={() => { setLoadingAdmin(true); setTimeout(() => setLoadingAdmin(false), 500); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingAdmin ? (
                            <div className="text-center py-10 text-gray-500">در حال بارگذاری...</div>
                        ) : (
                            <div className="space-y-4">
                                {adminOrders.map(order => (
                                    <div key={order.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold">سفارش #{order.id}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {order.billing.first_name} {order.billing.last_name} | {order.billing.phone}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(order.date_created).toLocaleDateString('fa-IR')}</p>
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-primary-600">{formatPrice(order.total)}</div>
                                                <div className="text-[10px] text-gray-500">تومان</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-2 py-1 outline-none"
                                            >
                                                <option value="pending">در انتظار پرداخت</option>
                                                <option value="processing">در حال انجام</option>
                                                <option value="on-hold">در انتظار بررسی</option>
                                                <option value="completed">تکمیل شده</option>
                                                <option value="cancelled">لغو شده</option>
                                                <option value="failed">ناموفق</option>
                                            </select>

                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="حذف سفارش"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


            </div>
         </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-xl shadow-lg border border-red-200 dark:border-red-800 flex items-start gap-3 z-50 animate-bounce">
           <AlertTriangle className="w-6 h-6 shrink-0" />
           <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-4 rounded-xl shadow-lg border border-green-200 dark:border-green-800 flex items-start gap-3 z-50 animate-bounce">
           <CheckCircle className="w-6 h-6 shrink-0" />
           <p>{successMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;