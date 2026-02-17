
import React, { useState, useEffect } from 'react';
import { lmsService } from '../services/lmsService';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, Users, BookOpen, Loader2, XCircle, AlertCircle, Plus, X, Search, UserPlus } from 'lucide-react';
import { User } from '../types';

const InstructorPanel: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'students'>('pending');
    
    // Pending Requests State
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // My Students State
    const [myStudents, setMyStudents] = useState<User[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');
    
    // Create Student Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', email: '', username: '', password: '' });
    const [creatingStudent, setCreatingStudent] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        // Always load my students first to know who belongs to me and filter accordingly
        loadMyStudents().then((students) => {
            if (activeTab === 'pending') {
                loadPendingRequests(students);
            }
        });
    }, [user, activeTab]);

    const loadMyStudents = async () => {
        setLoadingStudents(true);
        try {
            const allCustomers = await authService.getCustomers();
            // Strictly filter users who are assigned to this instructor AND have the 'student' role
            const myKids = allCustomers.filter(c => 
                c.instructor_id === user?.id && c.roles?.includes('student')
            );
            setMyStudents(myKids);
            return myKids; // Return for chaining
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadPendingRequests = async (currentStudents: User[]) => {
        setLoadingPending(true);
        try {
            const allPending = await lmsService.getStudentsPendingActivation();
            
            // Filter pending requests to show ONLY my students who have the 'student' role
            // We use the ID set from the strictly filtered 'myStudents' list
            const myStudentIds = new Set(currentStudents.map(s => s.id));
            
            const filtered = allPending.filter(req => myStudentIds.has(req.customer_id));
            setPendingStudents(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPending(false);
        }
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingStudent(true);
        try {
            // Create user with metadata linking to this instructor AND specific student role
            // By default assign 'student' role in backend
            await authService.createUser(user!, {
                username: newStudent.username,
                email: newStudent.email || `${newStudent.username}@example.com`, // Fallback email
                password: newStudent.password,
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                role: 'student', // Explicitly set role to student
                roles: ['student']
            }, [
                { key: 'instructor_id', value: String(user!.id) }
            ]);
            
            alert('دانش‌آموز با موفقیت ایجاد شد و نقش دانش‌آموز به او اختصاص یافت.');
            setShowCreateModal(false);
            setNewStudent({ firstName: '', lastName: '', email: '', username: '', password: '' });
            // Refresh lists
            const students = await loadMyStudents();
            if (activeTab === 'pending') {
                loadPendingRequests(students);
            }
        } catch (err: any) {
            alert('خطا: ' + err.message);
        } finally {
            setCreatingStudent(false);
        }
    };

    if (!user) return null;

    const handleActivate = async (orderId: number) => {
        if (window.confirm('آیا از فعالسازی ترم برای این دانش‌آموز اطمینان دارید؟')) {
            setActionLoading(orderId);
            try {
                // Pass instructor name for logging in WP Order Notes
                await lmsService.activateStudentTerm(orderId, user.display_name);
                // Refresh list
                const students = await loadMyStudents();
                loadPendingRequests(students);
            } catch (e) {
                alert('خطا در فعالسازی ترم.');
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleReject = async (orderId: number) => {
        if (window.confirm('آیا از رد درخواست این دانش‌آموز اطمینان دارید؟')) {
            setActionLoading(orderId);
            try {
                // Pass instructor name for logging in WP Order Notes
                await lmsService.rejectStudentTerm(orderId, user.display_name);
                // Refresh list
                const students = await loadMyStudents();
                loadPendingRequests(students);
            } catch (e) {
                alert('خطا در رد درخواست.');
            } finally {
                setActionLoading(null);
            }
        }
    };

    const filteredStudents = myStudents.filter(s => 
        s.display_name.includes(searchStudent) || s.username.includes(searchStudent)
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-black mb-8 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-primary-600" />
                پنل مدیریت مربی
            </h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
                 <div className="bg-blue-500 text-white p-6 rounded-3xl shadow-lg">
                     <div className="text-sm opacity-80 mb-1">دانش‌آموزان من</div>
                     <div className="text-3xl font-black">{myStudents.length || '...'}</div>
                 </div>
                 <div className="bg-yellow-500 text-white p-6 rounded-3xl shadow-lg">
                     <div className="text-sm opacity-80 mb-1">در انتظار تایید</div>
                     <div className="text-3xl font-black">{pendingStudents.length}</div>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'pending' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-gray-500'}`}
                    >
                        درخواست‌های فعالسازی
                    </button>
                    <button 
                         onClick={() => setActiveTab('students')}
                         className={`px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'students' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-gray-500'}`}
                    >
                        دانش‌آموزان من
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {loadingPending ? (
                                <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                    <span>در حال دریافت درخواست‌ها...</span>
                                </div>
                            ) : pendingStudents.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-500">
                                    <CheckCircle className="w-12 h-12 text-gray-300" />
                                    <p>هیچ درخواست فعالی از سمت دانش‌آموزان وجود ندارد.</p>
                                </div>
                            ) : (
                                pendingStudents.map(student => (
                                    <div key={student.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl gap-4 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={student.image} alt="" className="w-14 h-14 rounded-2xl" />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${student.status === 'on-hold' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}`} title={student.status}>
                                                    {student.status === 'on-hold' ? '!' : 'P'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{student.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-2">
                                                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded text-xs font-bold">
                                                        {student.term_title}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">{student.student_id}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {student.date}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {actionLoading === student.id ? (
                                                <div className="px-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleReject(student.id)}
                                                        className="px-4 py-2 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                                                        title="رد درخواست"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="hidden md:inline">رد کردن</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleActivate(student.id)}
                                                        className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:scale-105 transition-transform flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        تایید و فعالسازی
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="جستجو در دانش‌آموزان..."
                                        value={searchStudent}
                                        onChange={(e) => setSearchStudent(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    افزودن دانش‌آموز
                                </button>
                            </div>

                            {loadingStudents ? (
                                <div className="text-center py-10 text-gray-500">در حال بارگذاری لیست دانش‌آموزان...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-500">
                                    <Users className="w-12 h-12 text-gray-300" />
                                    <p>هیچ دانش‌آموزی با نقش "دانش‌آموز" یافت نشد.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStudents.map(student => (
                                        <div key={student.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-bold text-primary-700 text-lg">
                                                {student.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold">{student.display_name}</div>
                                                <div className="text-xs text-gray-500 font-mono">@{student.username}</div>
                                                <div className="flex gap-1 mt-1">
                                                    <span className="text-[10px] text-green-600 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full w-fit">
                                                        امتیاز: {student.points || 0}
                                                    </span>
                                                    {student.roles?.includes('student') && (
                                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded-full w-fit">
                                                            دانش‌آموز
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Student Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-primary-600" />
                                ثبت نام دانش‌آموز جدید
                             </h3>
                             <button onClick={() => setShowCreateModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" placeholder="نام" 
                                    value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                                    required
                                />
                                <input 
                                    type="text" placeholder="نام خانوادگی" 
                                    value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                                    required
                                />
                            </div>
                            <input 
                                type="text" placeholder="کد ملی (نام کاربری)" 
                                value={newStudent.username} onChange={e => setNewStudent({...newStudent, username: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right"
                                required
                            />
                            <input 
                                type="password" placeholder="رمز عبور" 
                                value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right"
                                required
                            />
                            <input 
                                type="email" placeholder="ایمیل (اختیاری)" 
                                value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-right"
                            />
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs p-3 rounded-xl">
                                این کاربر به طور خودکار به عنوان "دانش‌آموز" در سیستم ثبت می‌شود و به پنل شما متصل می‌گردد.
                            </div>

                            <button 
                                type="submit" 
                                disabled={creatingStudent}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 flex justify-center gap-2 items-center"
                            >
                                {creatingStudent && <Loader2 className="w-5 h-5 animate-spin" />}
                                ایجاد حساب کاربری
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorPanel;
