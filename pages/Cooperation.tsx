
import React, { useState } from 'react';
import { Handshake, Users, GraduationCap, Briefcase, ChevronDown, ChevronUp, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { IRAN_LOCATIONS } from '../constants';
import { cooperationService } from '../services/cooperationService';
import { CooperationRequest } from '../types';

const Cooperation: React.FC = () => {
    // UI State
    const [selectedType, setSelectedType] = useState<'Representative' | 'Instructor' | 'Supervisor' | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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

    const renderTypeInfo = () => {
        switch (selectedType) {
            case 'Representative':
                return (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-2">شرایط اخذ نمایندگی</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>داشتن فضای آموزشی مناسب و مجهز.</li>
                            <li>توانایی مدیریت و جذب دانش‌آموز.</li>
                            <li>تعهد به رعایت استانداردهای آموزشی موسسه.</li>
                            <li>دارای سابقه فعالیت آموزشی یا مدیریتی مرتبط.</li>
                        </ul>
                    </div>
                );
            case 'Instructor':
                return (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-2">شرایط مربیگری</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>علاقمندی به آموزش کودکان و نوجوانان.</li>
                            <li>گذراندن دوره‌های تربیت مدرس چرتکه موسسه.</li>
                            <li>دارای روابط عمومی بالا و فن بیان قوی.</li>
                            <li>حداقل مدرک تحصیلی کاردانی.</li>
                        </ul>
                    </div>
                );
            case 'Supervisor':
                return (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg text-orange-700 dark:text-orange-300 mb-2">شرایط سوپروایزر آموزشی</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>تسلط کامل بر مباحث آموزشی چرتکه.</li>
                            <li>سابقه تدریس موفق حداقل ۲ سال.</li>
                            <li>توانایی ارزیابی و نظارت بر عملکرد مربیان.</li>
                            <li>ارائه راهکارهای بهبود کیفیت آموزشی.</li>
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">درخواست شما با موفقیت ثبت شد</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    کارشناسان ما به زودی درخواست شما را بررسی کرده و با شما تماس خواهند گرفت. از همکاری شما سپاسگزاریم.
                </p>
                <a href="/" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors">
                    بازگشت به خانه
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl text-primary-600 mb-4">
                    <Handshake className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">همکاری با ما</h1>
                <p className="text-gray-500">فرصتی برای رشد، یادگیری و کسب درآمد در کنار هم</p>
            </div>

            {/* Types Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setSelectedType(selectedType === 'Representative' ? null : 'Representative')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${selectedType === 'Representative' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200'}`}
                >
                    <Briefcase className={`w-8 h-8 ${selectedType === 'Representative' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-bold">همکاری به عنوان نماینده</span>
                    {selectedType === 'Representative' ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                <button
                    onClick={() => setSelectedType(selectedType === 'Instructor' ? null : 'Instructor')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${selectedType === 'Instructor' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-200'}`}
                >
                    <GraduationCap className={`w-8 h-8 ${selectedType === 'Instructor' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-bold">همکاری به عنوان مربی</span>
                    {selectedType === 'Instructor' ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                <button
                    onClick={() => setSelectedType(selectedType === 'Supervisor' ? null : 'Supervisor')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${selectedType === 'Supervisor' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200'}`}
                >
                    <Users className={`w-8 h-8 ${selectedType === 'Supervisor' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="font-bold">سوپروایزر آموزشی</span>
                    {selectedType === 'Supervisor' ? <ChevronUp className="w-4 h-4 text-orange-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
            </div>

            {/* Info Section Display */}
            <div className="mb-10">
                {renderTypeInfo()}
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-primary-500" />
                    فرم درخواست همکاری
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">مدرک تحصیلی <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.education}
                                onChange={e => setFormData({...formData, education: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">جنسیت</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl flex-1 cursor-pointer border border-transparent hover:border-gray-300">
                                    <input 
                                        type="radio" name="gender" value="Male" 
                                        checked={formData.gender === 'Male'}
                                        onChange={() => setFormData({...formData, gender: 'Male'})}
                                    />
                                    <span>آقا</span>
                                </label>
                                <label className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl flex-1 cursor-pointer border border-transparent hover:border-gray-300">
                                    <input 
                                        type="radio" name="gender" value="Female" 
                                        checked={formData.gender === 'Female'}
                                        onChange={() => setFormData({...formData, gender: 'Female'})}
                                    />
                                    <span>خانم</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">شماره موبایل <span className="text-red-500">*</span></label>
                            <input 
                                type="tel" 
                                value={formData.mobile}
                                onChange={e => setFormData({...formData, mobile: e.target.value})}
                                placeholder="09123456789"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dir-ltr text-right"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">استان <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select 
                                    value={formData.province}
                                    onChange={handleProvinceChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                                    required
                                >
                                    <option value="">انتخاب استان...</option>
                                    {Object.keys(IRAN_LOCATIONS).map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">شهرستان <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select 
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 appearance-none disabled:opacity-50"
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
                                <ChevronDown className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نوع همکاری</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Representative">اخذ نمایندگی</option>
                            <option value="Instructor">مربیگری</option>
                            <option value="Supervisor">سوپروایزر آموزشی</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">توضیحات تکمیلی</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            placeholder="سوابق، تجربیات یا هر نکته‌ای که لازم است بدانیم..."
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ثبت درخواست همکاری'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Cooperation;
