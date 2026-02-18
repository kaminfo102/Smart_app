
import React, { useState, useEffect } from 'react';
import { AppEvent } from '../../types';
import { eventService } from '../../services/eventService';
import { Edit, Trash2, Plus, X, Save, RefreshCcw, Loader2, Calendar, Wrench, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminEvents: React.FC = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<AppEvent>>({});

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        // Force refresh from server on admin load to ensure sync
        const data = await eventService.getEvents(true);
        setEvents(data);
        setIsLoading(false);
    };

    const handleCreate = () => {
        setCurrentEvent({
            title: '',
            description: '',
            date: '',
            image: '',
            link: '/',
            isActive: true
        });
        setIsEditing(true);
    };

    const handleEdit = (event: AppEvent) => {
        setCurrentEvent(event);
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
            const newEvents = events.filter(e => e.id !== id);
            await saveChanges(newEvents);
        }
    };

    const handleToggleActive = async (index: number) => {
        const newEvents = [...events];
        newEvents[index].isActive = !newEvents[index].isActive;
        setEvents(newEvents); // Optimistic
        if(user?.token) await eventService.saveEvents(newEvents, user.token);
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newEvents = [...events];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newEvents.length) return;
        
        [newEvents[index], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[index]];
        await saveChanges(newEvents);
    };

    const saveChanges = async (newEvents: AppEvent[]) => {
        if (!user?.token) return alert('خطا در دسترسی');
        setEvents(newEvents); // Optimistic UI update
        try {
            // saveEvents now returns the fresh list from server
            const freshEvents = await eventService.saveEvents(newEvents, user.token);
            setEvents(freshEvents); 
        } catch (e: any) {
            alert('خطا در ذخیره: ' + e.message);
            loadEvents(); // Revert on error
        }
    };

    const handleSaveForm = async () => {
        if (!currentEvent.title || !currentEvent.image) return alert('عنوان و تصویر الزامی هستند.');
        
        setIsLoading(true);
        let newEvents = [...events];
        if (currentEvent.id) {
            newEvents = newEvents.map(e => e.id === currentEvent.id ? currentEvent as AppEvent : e);
        } else {
            // Use temp ID for optimisitc update, will be replaced by server
            newEvents.push({ ...currentEvent, id: Date.now() } as AppEvent);
        }

        try {
            if (user?.token) {
                const freshEvents = await eventService.saveEvents(newEvents, user.token);
                setEvents(freshEvents);
                setIsEditing(false);
            }
        } catch (e: any) {
            alert('خطا: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFixDatabase = async () => {
        if(!user?.token) return;
        if(!window.confirm('تعمیر جدول دیتابیس؟')) return;
        try {
            await eventService.setupDatabase(user.token);
            alert('جدول رویدادها ساخته شد.');
        } catch (e: any) {
            alert('خطا: ' + e.message);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{currentEvent.id ? 'ویرایش رویداد' : 'رویداد جدید'}</h2>
                    <button onClick={() => setIsEditing(false)}><X className="w-6 h-6" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input type="text" placeholder="عنوان رویداد" value={currentEvent.title} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                        <textarea placeholder="توضیحات کوتاه" value={currentEvent.description} onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none h-24 resize-none" />
                        <input type="text" placeholder="تاریخ (مثلا: ۱۲ اردیبهشت)" value={currentEvent.date} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="space-y-4">
                        <input type="text" placeholder="لینک تصویر" value={currentEvent.image} onChange={e => setCurrentEvent({...currentEvent, image: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left" />
                        <input type="text" placeholder="لینک صفحه" value={currentEvent.link} onChange={e => setCurrentEvent({...currentEvent, link: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left" />
                        <div className="flex items-center gap-2 mt-4">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={currentEvent.isActive} onChange={e => setCurrentEvent({...currentEvent, isActive: e.target.checked})} />
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${currentEvent.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${currentEvent.isActive ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                                <div className="mr-3 font-bold text-gray-700 dark:text-gray-300">نمایش رویداد</div>
                            </label>
                        </div>
                    </div>
                </div>
                <button onClick={handleSaveForm} disabled={isLoading} className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} ذخیره
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary-500" />
                    مدیریت رویدادها
                </h2>
                <div className="flex gap-2">
                    <button onClick={handleFixDatabase} className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> تعمیر دیتابیس
                    </button>
                    <button onClick={handleCreate} className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg">
                        <Plus className="w-5 h-5" /> رویداد جدید
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">در حال بارگذاری...</div>
            ) : (
                <div className="grid gap-4">
                    {events.length === 0 && <p className="text-center text-gray-500 py-10">رویدادی یافت نشد.</p>}
                    {events.map((event, index) => (
                        <div key={event.id} className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors ${event.isActive ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-gray-100 dark:bg-gray-900 border-gray-200 opacity-75'}`}>
                            {/* Controls */}
                            <div className="flex md:flex-col gap-2 p-1 md:pl-3 md:border-l border-gray-200 dark:border-gray-700 md:ml-2">
                                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                <button onClick={() => handleMove(index, 'down')} disabled={index === events.length - 1} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                            </div>

                            {/* Image */}
                            <div className="w-full md:w-32 aspect-video rounded-xl overflow-hidden relative shrink-0">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                {!event.isActive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">مخفی</div>}
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-right min-w-0">
                                <h3 className="font-bold text-lg truncate">{event.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                                <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-xs">
                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{event.date}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button onClick={() => handleToggleActive(index)} className={`p-3 rounded-xl transition-colors ${event.isActive ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`} title={event.isActive ? 'مخفی کردن' : 'نمایش دادن'}>
                                    {event.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <button onClick={() => handleEdit(event)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(event.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
