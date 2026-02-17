
import React from 'react';
import { Phone, ArrowLeft } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-4 mb-2 m-3 rounded-2xl md:rounded-3xl">
        <div className="container mx-auto px-4">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white">پشتیبانی</h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">نیاز به راهنمایی دارید؟</div>
                        <div className="text-xs text-gray-500 mt-0.5">تماس با پشتیبانی ۲۴ ساعته</div>
                    </div>
                </div>
                
                <a href="tel:08791002848" className="flex items-center gap-2 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200">
                    تماس
                    <ArrowLeft className="w-3 h-3" />
                </a>
            </div>
        </div>
    </section>
  );
};

export default ContactSection;
