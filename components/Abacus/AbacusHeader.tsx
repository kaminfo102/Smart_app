
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, MonitorPlay, HelpCircle } from 'lucide-react';
import { User } from '../../types';

interface AbacusHeaderProps {
  user: User | null;
  mode: 'challenge' | 'practice' | 'tutorial';
  setMode: (mode: 'challenge' | 'practice' | 'tutorial') => void;
}

const AbacusHeader: React.FC<AbacusHeaderProps> = ({ user, mode, setMode }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-4 gap-3 md:gap-4">
      
      {/* Top Row: Title + Mobile Back Button */}
      <div className="w-full md:w-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-3xl font-black text-gray-900 dark:text-white sm:block">باشگاه چرتکه</h1>
            <p className="text-xs text-gray-500 font-medium">تمرین محاسبات ذهنی</p>
          </div>
        </div>

        {/* Mobile Back Button (Icon Only) */}
        <Link to="/" className="md:hidden bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
           <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Mode Selection */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full md:w-auto justify-center">
        <button
          onClick={() => setMode('challenge')}
          className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${mode === 'challenge' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <Trophy className="w-3 h-3" />
          چالش
        </button>
        <button
          onClick={() => setMode('practice')}
          className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${mode === 'practice' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <MonitorPlay className="w-3 h-3" />
          تمرین آزاد
        </button>
        <button
          onClick={() => setMode('tutorial')}
          className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${mode === 'tutorial' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <HelpCircle className="w-3 h-3" />
          آموزش
        </button>
      </div>

      {/* Desktop Back Button */}
      <Link to="/" className="hidden md:flex text-gray-500 hover:text-gray-900 dark:hover:text-white items-center gap-1 transition-colors text-sm font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        بازگشت
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default AbacusHeader;
