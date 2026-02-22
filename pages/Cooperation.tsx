
import React, { useState } from 'react';
import { Handshake, Users, GraduationCap, Briefcase, ChevronDown, ChevronUp, MapPin, Loader2, CheckCircle, Phone, User, FileText } from 'lucide-react';
import { IRAN_LOCATIONS } from '../constants';
import { cooperationService } from '../services/cooperationService';
import { CooperationRequest } from '../types';

const Cooperation: React.FC = () => {
    // UI State
    const [selectedType, setSelectedType] = useState<'Representative' | 'Instructor' | 'Supervisor' | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Data Configuration
    const COOPERATION_DATA = [
        {
            id: 'Representative' as const,
            icon: Briefcase,
            label: 'اخذ نمایندگی',
            title: 'شرایط اخذ نمایندگی',
            items: [
                'داشتن فضای آموزشی مناسب و مجهز',
                'توانایی مدیریت و جذب دانش‌آموز',
                'تعهد به رعایت استانداردهای آموزشی موسسه',
                'دارای سابقه فعالیت آموزشی یا مدیریتی مرتبط'
            ],
            styles: {
                active: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10',
                icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600',
                chevron: 'text-blue-500',
                card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            }
        },
        {
            id: 'Instructor' as const,
            icon: GraduationCap,
            label: 'مربیگری',
            title: 'شرایط مربیگری',
            items: [
                'علاقمندی به آموزش کودکان و نوجوانان',
                'گذراندن دوره‌های تربیت مدرس چرتکه موسسه',
                'دارای روابط عمومی بالا و فن بیان قوی',
                'حداقل مدرک تحصیلی کاردانی'
            ],
            styles: {
                active: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/10',
                icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600',
                chevron: 'text-purple-500',
                card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300'
            }
        },
        {
            id: 'Supervisor' as const,
            icon: Users,
            label: 'سوپروایزر',
            title: 'شرایط سوپروایزر آموزشی',
            items: [
                'تسلط کامل بر مباحث آموزشی چرتکه',
                'سابقه تدریس موفق حداقل ۲ سال',
                'توانایی ارزیابی و نظارت بر عملکرد مربیان',
                'ارائه راهکارهای بهبود کیفیت آموزشی'
            ],
            styles: {
                active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10',
                icon: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600',
                chevron: 'text-orange-500',
                card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300'
            }
        }
    ];

    // Form State
    const [formData, setFormData] = useState<CooperationRequest>({
        fullName: '',
        education: '',
        gender: 'Male',
        province: '',
        city: '',
        type: 'Representative', // Default
        mobile: '',
        description: ''
    });

    // Validation
    const isFormValid = () => {
        return (
            formData.fullName &&
            formData.education &&
            formData.province &&
            formData.city &&
            formData.mobile &&
            formData.mobile.length >= 10
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return alert('لطفا تمام فیلدهای الزامی را پر کنید.');

        setLoading(true);
        try {
            await cooperationService.submitRequest(formData);
            setSuccess(true);
            window.scrollTo(0, 0);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, province: e.target.value, city: '' });
    };

    const renderInfoCard = (data: typeof COOPERATION_DATA[0]) => (
        <div className={`${data.styles.card} p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 shadow-sm`}>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {data.title}
            </h3>
            <ul className="space-y-3">
                {data.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm opacity-90">
                        <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">درخواست شما ثبت شد</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                    کارشناسان ما به زودی درخواست شما را بررسی کرده و جهت هماهنگی‌های بعدی با شما تماس خواهند گرفت.
                </p>
                <a href="/" className="w-full max-w-xs bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                    بازگشت به خانه
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-900/20 pt-12 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-primary-500/10 text-primary-600 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Handshake className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">همکاری با ما</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-lg leading-relaxed">
                        به شبکه بزرگ آموزشی ما بپیوندید و در مسیر موفقیت و رشد، همراه ما باشید
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-4">
                {/* Types Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {COOPERATION_DATA.map((type) => (
                        <React.Fragment key={type.id}>
                            <button
                                onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                                className={`
                                    relative p-6 rounded-2xl border-2 transition-all duration-300 group
                                    flex flex-row md:flex-col items-center gap-4 text-right md:text-center
                                    ${selectedType === type.id 
                                        ? type.styles.active
                                        : 'border-white dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 shadow-sm'
                                    }
                                `}
                            >
                                <div className={`
                                    p-3 rounded-xl transition-colors
                                    ${selectedType === type.id ? type.styles.icon : 'bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-gray-600'}
                                `}>
                                    <type.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 md:w-full">
                                    <span className={`font-bold block ${selectedType === type.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {type.label}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1 hidden md:block">برای مشاهده شرایط کلیک کنید</span>
                                </div>
                                {selectedType === type.id 
                                    ? <ChevronUp className={`w-5 h-5 ${type.styles.chevron}`} /> 
                                    : <ChevronDown className="w-5 h-5 text-gray-300" />
                                }
                            </button>
                            
                            {/* Mobile Info Accordion */}
                            {selectedType === type.id && (
                                <div className="md:hidden animate-in fade-in slide-in-from-top-2">
                                    {renderInfoCard(type)}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Desktop Info Section */}
                <div className="hidden md:block mb-8">
                    {selectedType && renderInfoCard(COOPERATION_DATA.find(t => t.id === selectedType)!)}
                </div>

                {/* Form Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            فرم درخواست همکاری
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        {/* Personal Info Group */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" />
                                اطلاعات فردی
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="مثال: علی محمدی"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">مدرک تحصیلی <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.education}
                                        onChange={e => setFormData({...formData, education: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="مثال: کارشناسی روانشناسی"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">جنسیت</label>
                                    <div className="flex gap-3">
                                        {['Male', 'Female'].map((g) => (
                                            <label key={g} className={`
                                                flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer border transition-all
                                                ${formData.gender === g 
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300' 
                                                    : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200'
                                                }
                                            `}>
                                                <input 
                                                    type="radio" name="gender" value={g} 
                                                    checked={formData.gender === g}
                                                    onChange={() => setFormData({...formData, gender: g as any})}
                                                    className="hidden"
                                                />
                                                <span className="font-medium">{g === 'Male' ? 'آقا' : 'خانم'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">شماره موبایل <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            inputMode="numeric"
                                            value={formData.mobile}
                                            onChange={e => setFormData({...formData, mobile: e.target.value})}
                                            placeholder="09123456789"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pl-10 outline-none focus:ring-2 focus:ring-primary-500 transition-all dir-ltr text-right font-mono"
                                            required
                                        />
                                        <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700" />

                        {/* Location Group */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                اطلاعات مکانی
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">استان <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            value={formData.province}
                                            onChange={handleProvinceChange}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all cursor-pointer"
                                            required
                                        >
                                            <option value="">انتخاب استان...</option>
                                            {Object.keys(IRAN_LOCATIONS).map(prov => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute left-3 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">شهرستان <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            value={formData.city}
                                            onChange={e => setFormData({...formData, city: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            required
                                            disabled={!formData.province}
                                        >
                                            <option value="">
                                                {formData.province ? 'انتخاب شهرستان...' : 'ابتدا استان را انتخاب کنید'}
                                            </option>
                                            {formData.province && IRAN_LOCATIONS[formData.province]?.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute left-3 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700" />

                        {/* Additional Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع همکاری</label>
                                <div className="relative">
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                                    >
                                        <option value="Representative">اخذ نمایندگی</option>
                                        <option value="Instructor">مربیگری</option>
                                        <option value="Supervisor">سوپروایزر آموزشی</option>
                                    </select>
                                    <ChevronDown className="absolute left-3 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات تکمیلی</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                    placeholder="سوابق، تجربیات یا هر نکته‌ای که لازم است بدانیم..."
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ثبت درخواست همکاری'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Cooperation;
