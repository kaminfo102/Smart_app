
import React, { useState, useEffect } from 'react';
import { getWooConfig, saveWooConfig } from '../../services/wooService';
import { Save, AlertCircle, Database, Globe, Key } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const config = getWooConfig();
    if (config) {
      setUrl(config.url);
      setKey(config.key);
      setSecret(config.secret);
    }
  }, []);

  const handleSave = () => {
    if (!url) {
      setStatus('وارد کردن آدرس سایت الزامی است.');
      return;
    }
    
    saveWooConfig(url, key, secret);
    setStatus('تنظیمات با موفقیت ذخیره شد. در حال بارگذاری مجدد...');
    
    setTimeout(() => {
        window.location.href = '/'; 
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
             <Database className="w-6 h-6 text-primary-500" />
             تنظیمات اتصال
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
                این تنظیمات به صورت پیش‌فرض روی مقادیر ثابت تنظیم شده‌اند. تغییر آن‌ها فقط برای اتصال به سرور دیگر کاربرد دارد.
            </p>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold border-b border-gray-100 dark:border-gray-700 pb-2">
                <Globe className="w-5 h-5 text-primary-500" />
                <h2>اطلاعات عمومی (لاگین و محصولات)</h2>
            </div>
            
            <div className="space-y-2">
            <label className="block text-sm font-medium">آدرس سایت (URL)</label>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-left"
            />
            <p className="text-xs text-gray-400">مثال: https://myshop.ir (بدون اسلش در انتها)</p>
            </div>
        </div>

        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold border-b border-gray-100 dark:border-gray-700 pb-2">
                <Key className="w-5 h-5 text-yellow-500" />
                <h2>تنظیمات ووکامرس (برای نمایش محصولات)</h2>
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium">کلید مشتری (Consumer Key)</label>
            <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-left"
            />
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium">رمز مشتری (Consumer Secret)</label>
            <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-left"
            />
            </div>
        </div>

        {status && (
            <p className={`text-sm font-medium ${status.includes('موفقیت') ? 'text-green-500' : 'text-red-500'}`}>
                {status}
            </p>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
        >
          <Save className="w-5 h-5" />
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
