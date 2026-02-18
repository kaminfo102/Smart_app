
import React, { useState, useEffect } from 'react';
import { HeroSlide } from '../../types';
import { heroService } from '../../services/heroService';
import { Image, Edit, Trash2, Plus, X, Save, RefreshCcw, Loader2, Database, Wrench, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminHero: React.FC = () => {
    const { user } = useAuth();
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({});

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        setIsLoading(true);
        const data = await heroService.getSlides();
        setSlides(data);
        setIsLoading(false);
    };

    const handleEdit = (slide: HeroSlide) => {
        setCurrentSlide(slide);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentSlide({
            title: '',
            subtitle: '',
            desc: '',
            image: '',
            bg: 'from-blue-600 to-indigo-800',
            cta: 'مشاهده',
            link: '/'
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('آیا از حذف این اسلاید اطمینان دارید؟')) {
            setIsLoading(true);
            const newSlides = slides.filter(s => s.id !== id);
            try {
                if (user?.token) {
                    await heroService.saveSlides(newSlides, user.token);
                    setSlides(newSlides);
                } else {
                    alert('خطا در دسترسی: توکن یافت نشد');
                }
            } catch (e: any) {
                alert(e.message || 'خطا در ذخیره تغییرات');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (!user?.token) return alert('خطا در دسترسی');
        
        const newSlides = [...slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Boundary checks
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        // Swap
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

        // Optimistic update
        setSlides(newSlides);

        try {
            // Background save (don't show full loading spinner to keep UI snappy, but maybe disable buttons)
            await heroService.saveSlides(newSlides, user.token);
        } catch (e: any) {
            console.error(e);
            alert('خطا در ذخیره ترتیب جدید.');
            loadSlides(); // Revert on error
        }
    };

    const handleSave = async () => {
        if (!currentSlide.title || !currentSlide.image) {
            alert('عنوان و تصویر الزامی هستند.');
            return;
        }

        setIsLoading(true);
        let newSlides = [...slides];

        if (currentSlide.id) {
            newSlides = newSlides.map(s => s.id === currentSlide.id ? currentSlide as HeroSlide : s);
        } else {
            const newSlide = { ...currentSlide, id: Date.now() } as HeroSlide;
            newSlides.push(newSlide);
        }

        try {
            if (user?.token) {
                await heroService.saveSlides(newSlides, user.token);
                setSlides(newSlides);
                setIsEditing(false);
                alert('تغییرات با موفقیت در دیتابیس ذخیره شد.');
            } else {
                alert('خطا در دسترسی: لطفا مجدد وارد شوید.');
            }
        } catch (e: any) {
            console.error(e);
            alert('خطا در ذخیره: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFixDatabase = async () => {
        if(!user?.token) return;
        if(!window.confirm('این گزینه تلاش می‌کند جدول دیتابیس را مجددا بسازد. آیا ادامه می‌دهید؟')) return;
        
        setIsLoading(true);
        try {
            await heroService.setupDatabase(user.token);
            alert('جدول دیتابیس با موفقیت ساخته/بازسازی شد. حالا می‌توانید اسلایدها را ذخیره کنید.');
        } catch (e: any) {
            alert('خطا: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if(window.confirm('آیا می‌خواهید تغییرات محلی را پاک کرده و دوباره از سرور بارگذاری کنید؟')) {
            heroService.resetDefaults(); // Clears cache
            loadSlides(); // Re-fetch
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{currentSlide.id ? 'ویرایش اسلاید' : 'اسلاید جدید'}</h2>
                    <button onClick={() => setIsEditing(false)}><X className="w-6 h-6" /></button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">عنوان اصلی</label>
                            <input 
                                type="text" 
                                value={currentSlide.title} 
                                onChange={e => setCurrentSlide({...currentSlide, title: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">زیرعنوان (تگ بالای عنوان)</label>
                            <input 
                                type="text" 
                                value={currentSlide.subtitle} 
                                onChange={e => setCurrentSlide({...currentSlide, subtitle: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">توضیحات کوتاه</label>
                            <textarea 
                                value={currentSlide.desc} 
                                onChange={e => setCurrentSlide({...currentSlide, desc: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none h-24 resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">لینک تصویر (URL)</label>
                            <input 
                                type="text" 
                                value={currentSlide.image} 
                                onChange={e => setCurrentSlide({...currentSlide, image: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">متن دکمه</label>
                                <input 
                                    type="text" 
                                    value={currentSlide.cta} 
                                    onChange={e => setCurrentSlide({...currentSlide, cta: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">لینک دکمه</label>
                                <input 
                                    type="text" 
                                    value={currentSlide.link} 
                                    onChange={e => setCurrentSlide({...currentSlide, link: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">رنگ پس‌زمینه (کلاس گرادینت Tailwind)</label>
                            <input 
                                type="text" 
                                value={currentSlide.bg} 
                                onChange={e => setCurrentSlide({...currentSlide, bg: e.target.value})}
                                placeholder="from-blue-600 to-indigo-800"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left"
                            />
                            <p className="text-xs text-gray-500 mt-1 dir-ltr text-left">Example: from-purple-600 to-pink-600</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                     <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        لغو
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isLoading ? 'در حال ذخیره...' : 'ذخیره در دیتابیس'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-6 h-6 text-primary-500" />
                    مدیریت اسلایدر (SQL Table)
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleFixDatabase}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors"
                        title="اگر اسلایدها ذخیره نمی‌شوند کلیک کنید"
                    >
                        <Wrench className="w-4 h-4" />
                        تعمیر دیتابیس
                    </button>
                    <button 
                        onClick={handleReset}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="بارگذاری مجدد از سرور"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        اسلاید جدید
                    </button>
                </div>
            </div>

            {isLoading && !isEditing ? (
                <div className="text-center py-20 text-gray-500">در حال دریافت اطلاعات از سرور...</div>
            ) : (
                <div className="grid gap-4">
                    {slides.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 mb-2">هنوز اسلایدی ساخته نشده است.</p>
                            <p className="text-xs text-orange-500">اگر قبلا ساخته‌اید اما نمایش داده نمی‌شود، دکمه "تعمیر دیتابیس" را بزنید.</p>
                        </div>
                    )}
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center group hover:border-primary-200 transition-colors">
                            
                            {/* Reorder Controls */}
                            <div className="flex md:flex-col gap-2 p-1 md:pl-3 md:border-l border-gray-100 dark:border-gray-700 md:ml-2">
                                <button 
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                                    title="انتقال به بالا"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === slides.length - 1}
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                                    title="انتقال به پایین"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="w-full md:w-48 aspect-[2/1] rounded-2xl overflow-hidden relative shrink-0">
                                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-80 z-10`}></div>
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg z-20">
                                    #{index + 1}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-right min-w-0">
                                <div className="text-xs font-bold text-primary-600 mb-1 truncate">{slide.subtitle}</div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate">{slide.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{slide.desc}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-[200px] dir-ltr">link: {slide.link}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto shrink-0">
                                <button 
                                    onClick={() => handleEdit(slide)}
                                    className="flex-1 md:flex-none p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(slide.id)}
                                    className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminHero;
