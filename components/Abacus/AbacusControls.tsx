import React from 'react';
import { Settings2, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface AbacusControlsProps {
  numberOfRods: number;
  setNumberOfRods: (num: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onReset: () => void;
  mode: string;
  currentAbacusValue: number;
}

const AbacusControls: React.FC<AbacusControlsProps> = ({
  numberOfRods,
  setNumberOfRods,
  soundEnabled,
  setSoundEnabled,
  onReset,
  mode,
  currentAbacusValue
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      
      {/* Left Side: Settings */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Rods Setting */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
          <Settings2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 hidden sm:inline">ستون‌ها:</span>
          <select
            value={numberOfRods}
            onChange={(e) => setNumberOfRods(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-gray-800 dark:text-white outline-none cursor-pointer p-0"
          >
            <option value={7}>۷</option>
            <option value={9}>۹</option>
            <option value={10}>۱۰</option>
            <option value={13}>۱۳</option>
            <option value={15}>۱۵</option>
          </select>
        </div>

        {/* Sound Setting */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${soundEnabled ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-700/50 dark:border-gray-600'}`}
          title={soundEnabled ? 'صدا فعال' : 'صدا غیرفعال'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-xs font-bold hidden sm:inline">{soundEnabled ? 'صدا روشن' : 'صدا خاموش'}</span>
        </button>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
        {/* Value Display (Practice/Tutorial) */}
        {(mode === 'practice' || mode === 'tutorial') && (
          <div className="flex items-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-2 rounded-xl text-sm font-black shadow-sm">
            <span className="text-[10px] font-normal opacity-70 hidden sm:inline">عدد:</span>
            {currentAbacusValue}
          </div>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border border-red-100 dark:border-red-900/30"
          title="پاک کردن صفحه"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">پاک کردن</span>
        </button>
      </div>
    </div>
  );
};

export default AbacusControls;