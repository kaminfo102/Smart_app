
import React from 'react';
import { Brain, Zap, Target, Users, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesGrid: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-4 mb-2 rounded-2xl md:rounded-3xl">
        <div className="container mx-auto px-4">
            {/* App-like Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white">خدمات ما</h2>
                <Link to="/training" className="text-xs text-primary-600 flex items-center gap-1 font-bold">
                    مشاهده همه
                    <ChevronLeft className="w-3 h-3" />
                </Link>
            </div>
            
            {/* Grid Layout */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {[
                    { icon: Brain, title: "هوش", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                    { icon: Zap, title: "سرعت", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
                    { icon: Target, title: "تمرکز", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
                    { icon: Users, title: "اعتماد", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 md:w-20 md:h-20 ${item.bg} ${item.color} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-sm active:scale-95 transition-transform`}>
                            <item.icon className="w-6 h-6 md:w-9 md:h-9" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300">{item.title}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default FeaturesGrid;
