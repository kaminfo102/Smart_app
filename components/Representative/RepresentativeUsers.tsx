import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, GraduationCap, BookOpen, User as UserIcon } from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types';

interface RepresentativeUsersProps {
    currentUser: User;
    targetRole: 'student' | 'instructor';
    title: string;
}

const RepresentativeUsers: React.FC<RepresentativeUsersProps> = ({ currentUser, targetRole, title }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });

    useEffect(() => {
        loadUsers();
    }, [currentUser, targetRole]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch customers (which includes students and instructors created via Woo API)
            // We use getCustomers because it returns meta_data like representative_id
            const allUsers = await authService.getCustomers();
            
            const filtered = allUsers.filter(u => {
                // Filter by role
                const hasRole = u.roles?.includes(targetRole);
                // Filter by representative ownership
                // We check if the user's representative_id matches the current logged-in representative's ID
                const isOwnedByRep = u.representative_id === currentUser.id;
                
                return hasRole && isOwnedByRep;
            });
            setUsers(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if(!newUser.username || !newUser.email || !newUser.password) return alert('نام کاربری، ایمیل و رمز عبور الزامی است');
        try {
            await authService.createUser(currentUser, {
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                roles: [targetRole]
            }, [
                // Add representative_id to meta_data
                { key: 'representative_id', value: String(currentUser.id) }
            ]);
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '', first_name: '', last_name: '' });
            loadUsers();
        } catch (e: any) {
            alert(e.message || 'خطا در ایجاد کاربر');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if(!window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
        try {
            await authService.deleteUser(currentUser, id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            console.error(e);
            alert('خطا در حذف کاربر');
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.first_name && u.first_name.includes(search)) ||
        (u.last_name && u.last_name.includes(search))
    );

    return (
        <div className="space-y-6 animate-in fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{title}</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="جستجو..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pr-10 pl-4 outline-none focus:border-primary-500 text-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary-500/20 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        افزودن
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">کاربر</th>
                                <th className="px-6 py-4">نام کامل</th>
                                <th className="px-6 py-4">ایمیل</th>
                                <th className="px-6 py-4">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-8">در حال بارگذاری...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">کاربری یافت نشد</td></tr>
                            ) : filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{u.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {u.first_name} {u.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-bold">
                                 {targetRole === 'student' ? 'دانش‌آموز جدید' : 'مربی جدید'}
                             </h3>
                             <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" placeholder="نام" 
                                    value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700"
                                />
                                <input 
                                    type="text" placeholder="نام خانوادگی" 
                                    value={newUser.last_name} onChange={e => setNewUser({...newUser, last_name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700"
                                />
                            </div>
                            <input 
                                type="text" placeholder="نام کاربری *" 
                                value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700"
                            />
                            <input 
                                type="email" placeholder="ایمیل *" 
                                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700"
                            />
                            <input 
                                type="password" placeholder="رمز عبور *" 
                                value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700"
                            />
                            
                            <button onClick={handleCreateUser} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg mt-4 hover:bg-primary-700 transition-colors">
                                ایجاد کاربر
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepresentativeUsers;
