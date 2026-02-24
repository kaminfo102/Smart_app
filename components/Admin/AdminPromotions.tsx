import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { promotionService } from '../../services/promotionService';
import { Promotion } from '../../types';
import { Plus, Edit, Trash2, Check, X, Image as ImageIcon, Link as LinkIcon, Clock, Calendar } from 'lucide-react';

const AdminPromotions: React.FC = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Partial<Promotion>>({
    title: '',
    message: '',
    image_url: '',
    link_url: '',
    delay_seconds: 5,
    duration_seconds: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const data = await promotionService.getAllPromotions(user.token);
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.token) return;
    try {
      if (currentPromotion.id) {
        await promotionService.updatePromotion(user.token, currentPromotion.id, currentPromotion as Promotion);
      } else {
        await promotionService.createPromotion(user.token, currentPromotion as Promotion);
      }
      fetchPromotions();
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save promotion', error);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user?.token || !window.confirm('آیا از حذف این مورد اطمینان دارید؟')) return;
    try {
      await promotionService.deletePromotion(user.token, id);
      fetchPromotions();
    } catch (error) {
      console.error('Failed to delete promotion', error);
      alert('خطا در حذف اطلاعات');
    }
  };

  const resetForm = () => {
    setCurrentPromotion({
      title: '',
      message: '',
      image_url: '',
      link_url: '',
      delay_seconds: 5,
      duration_seconds: 0,
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const handleEdit = (promo: Promotion) => {
    setCurrentPromotion(promo);
    setIsEditing(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">مدیریت دیالوگ‌های تبلیغاتی</h2>
        {!isEditing && (
          <button
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus size={20} />
            <span>افزودن دیالوگ جدید</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">{currentPromotion.id ? 'ویرایش دیالوگ' : 'افزودن دیالوگ جدید'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان</label>
                <input
                  type="text"
                  value={currentPromotion.title}
                  onChange={(e) => setCurrentPromotion({ ...currentPromotion, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="عنوان دیالوگ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">متن پیام</label>
                <textarea
                  value={currentPromotion.message}
                  onChange={(e) => setCurrentPromotion({ ...currentPromotion, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
                  placeholder="متن پیام تبلیغاتی..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <ImageIcon size={16} /> آدرس تصویر (اختیاری)
                </label>
                <input
                  type="text"
                  value={currentPromotion.image_url}
                  onChange={(e) => setCurrentPromotion({ ...currentPromotion, image_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <LinkIcon size={16} /> لینک کلیک (اختیاری)
                </label>
                <input
                  type="text"
                  value={currentPromotion.link_url}
                  onChange={(e) => setCurrentPromotion({ ...currentPromotion, link_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="https://example.com/offer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Clock size={16} /> تاخیر نمایش (ثانیه)
                  </label>
                  <input
                    type="number"
                    value={currentPromotion.delay_seconds}
                    onChange={(e) => setCurrentPromotion({ ...currentPromotion, delay_seconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">زمان پس از لود صفحه</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Clock size={16} /> مدت نمایش (ثانیه)
                  </label>
                  <input
                    type="number"
                    value={currentPromotion.duration_seconds}
                    onChange={(e) => setCurrentPromotion({ ...currentPromotion, duration_seconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = تا زمان بستن توسط کاربر</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Calendar size={16} /> تاریخ شروع (اختیاری)
                  </label>
                  <input
                    type="datetime-local"
                    value={currentPromotion.start_date || ''}
                    onChange={(e) => setCurrentPromotion({ ...currentPromotion, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Calendar size={16} /> تاریخ پایان (اختیاری)
                  </label>
                  <input
                    type="datetime-local"
                    value={currentPromotion.end_date || ''}
                    onChange={(e) => setCurrentPromotion({ ...currentPromotion, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={currentPromotion.is_active}
                    onChange={(e) => setCurrentPromotion({ ...currentPromotion, is_active: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">فعال</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              disabled={!currentPromotion.title || !currentPromotion.message}
              className="px-6 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={20} />
              ذخیره
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border ${promo.is_active ? 'border-primary-200 dark:border-primary-900/50' : 'border-gray-100 dark:border-gray-700'} relative overflow-hidden group`}>
              {promo.is_active && (
                <div className="absolute top-0 right-0 w-2 h-full bg-primary-500"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-3">{promo.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(promo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => promo.id && handleDelete(promo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {promo.message}
              </p>

              {promo.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden h-32 bg-gray-100 dark:bg-gray-900">
                  <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <Clock size={12} />
                  تاخیر: {promo.delay_seconds}s
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  <Clock size={12} />
                  مدت: {promo.duration_seconds > 0 ? `${promo.duration_seconds}s` : 'نامحدود'}
                </span>
                {!promo.is_active && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                    <X size={12} />
                    غیرفعال
                  </span>
                )}
              </div>
            </div>
          ))}

          {promotions.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">هیچ دیالوگ تبلیغاتی یافت نشد.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 text-primary-600 font-bold hover:underline"
              >
                ایجاد اولین دیالوگ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;