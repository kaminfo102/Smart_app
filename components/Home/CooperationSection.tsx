
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Handshake } from 'lucide-react';

const CooperationSection: React.FC = () => {
  return (
    <section className="px-3 md:px-4 mb-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                        <Handshake className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black mb-1">همکاری با ما</h2>
                        <p className="text-cyan-100 text-sm md:text-base opacity-90 max-w-md">
                            به تیم بزرگ ما بپیوندید! فرصت‌های شغلی در سراسر کشور به عنوان نماینده، مربی یا سوپروایزر.
                        </p>
                    </div>
                </div>

                <Link 
                    to="/cooperation" 
                    className="w-full md:w-auto bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                >
                    <Users className="w-5 h-5" />
                    ارسال درخواست
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>
        </div>
    </section>
  );
};

export default CooperationSection;
