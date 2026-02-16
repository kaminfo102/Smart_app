
import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const TrainingCTA: React.FC = () => {
  return (
    <section className="px-3 md:px-4 mb-2">
        <div className="relative rounded-2xl overflow-hidden h-40 md:h-56 bg-gray-900 shadow-md">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="absolute inset-0 flex items-center justify-between p-6 md:p-10">
                <div className="space-y-2 z-10 max-w-[60%]">
                    <div className="text-yellow-400 font-black text-lg md:text-3xl uppercase tracking-tighter">
                        چالش گلدن گلوب
                    </div>
                    <div className="text-white text-sm md:text-xl font-bold">
                        مسابقات آنلاین چرتکه
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                        رکورد بزنید و جایزه ببرید
                    </div>
                    
                    <Link to="/training" className="inline-flex items-center gap-1 bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white hover:text-black px-4 py-1.5 rounded-full text-xs font-bold transition-all mt-2">
                        تماشا کنید (شروع)
                        <ChevronLeft className="w-3 h-3" />
                    </Link>
                </div>

                {/* Decorative Icon similar to trophy in screenshot */}
                <div className="relative z-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse">
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

// Helper for icon
import { ChevronLeft } from 'lucide-react';

export default TrainingCTA;
