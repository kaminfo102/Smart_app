
import React, { useState, useEffect } from 'react';
import { Handshake, MapPin, Phone, User, GraduationCap, Wrench, RefreshCcw, Loader2 } from 'lucide-react';
import { cooperationService } from '../../services/cooperationService';
import { CooperationRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const AdminCooperation: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<CooperationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const data = await cooperationService.getRequests(user.token);
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFixDatabase = async () => {
        if(!user?.token) return;
        if(!window.confirm('آیا از ساخت جدول همکاری در دیتابیس اطمینان دارید؟')) return;
        try {
            await cooperationService.setupDatabase(user.token);
            alert('جدول دیتابیس ساخته شد.');
        } catch (e: any) {
            alert('خطا: ' + e.message);
        }
    };

    const getTypeLabel = (type: string) => {
        switch(type) {
            case 'Representative': return 'نمایندگی';
            case 'Instructor': return 'مربیگری';
            case 'Supervisor': return 'سوپروایزر';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'Representative': return 'bg-blue-100 text-blue-700';
            case 'Instructor': return 'bg-purple-100 text-purple-700';
            case 'Supervisor': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Handshake className="w-6 h-6 text-primary-500" />
                    درخواست‌های همکاری
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleFixDatabase}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors"
                    >
                        <Wrench className="w-4 h-4" />
                        ساخت جدول
                    </button>
                    <button 
                        onClick={loadRequests}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    در حال دریافت اطلاعات...
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">هیچ درخواست همکاری ثبت نشده است.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-400" />
                                            {req.fullName}
                                        </h3>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            {req.education} ({req.gender === 'Male' ? 'آقا' : 'خانم'})
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(req.type)}`}>
                                        {getTypeLabel(req.type)}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                        <MapPin className="w-4 h-4" />
                                        {req.province}، {req.city}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                        <Phone className="w-4 h-4" />
                                        <a href={`tel:${req.mobile}`} className="hover:text-primary-600">{req.mobile}</a>
                                    </div>
                                </div>

                                {req.description && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {req.description}
                                    </div>
                                )}
                                
                                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    تاریخ ثبت: {req.created_at}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCooperation;
