import React from 'react';
import { MonitorPlay, CheckCircle } from 'lucide-react';

interface PracticePanelProps {
  currentAbacusValue: number;
  targetNumber: number | null;
  setTargetNumber: (val: number | null) => void;
}

const PracticePanel: React.FC<PracticePanelProps> = ({
  currentAbacusValue,
  targetNumber,
  setTargetNumber
}) => {
  return (
    <div className="flex flex-col h-full z-10 relative">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <MonitorPlay className="w-6 h-6 text-blue-500" />
        تمرین آزاد
      </h2>
      
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <label className="text-xs font-bold text-gray-500 mb-2 block">هدف شما (اختیاری):</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="مثلا: 125"
              value={targetNumber || ''}
              onChange={(e) => setTargetNumber(parseInt(e.target.value) || null)}
              className="w-full bg-white dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-center font-bold outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">عدد نمایش داده شده روی چرتکه</div>
          <div className={`text-6xl font-black tracking-widest transition-colors duration-300 ${targetNumber === currentAbacusValue ? 'text-green-500 scale-110' : 'text-gray-800 dark:text-white'}`}>
            {currentAbacusValue}
          </div>
        </div>

        {targetNumber !== null && (
          <div className={`mt-auto p-4 rounded-xl text-center font-bold transition-all duration-500 ${targetNumber === currentAbacusValue ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
            {targetNumber === currentAbacusValue ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                آفرین! به عدد هدف رسیدید
              </div>
            ) : (
              <span>تلاش کنید تا به عدد {targetNumber} برسید</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePanel;