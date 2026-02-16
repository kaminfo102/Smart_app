import React from 'react';
import { HelpCircle, CheckCircle, ChevronLeft, Eye, Trophy } from 'lucide-react';

interface TutorialPanelProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  message: string;
  instruction: string;
  inputValue: string;
  setInputValue: (val: string) => void;
  onVisualize: () => void;
  onSetMode: (mode: 'challenge' | 'practice') => void;
}

const TutorialPanel: React.FC<TutorialPanelProps> = ({
  step,
  setStep,
  message,
  instruction,
  inputValue,
  setInputValue,
  onVisualize,
  onSetMode
}) => {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center shadow-sm animate-in fade-in slide-in-from-top-2">
      
      {step === 1 && (
        <div className="space-y-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">آموزش تعاملی چرتکه</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">در این بخش با نحوه کار مهره‌ها و محاسبات آشنا می‌شوید.</p>
          <button onClick={() => setStep(2)} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
            شروع آموزش
          </button>
        </div>
      )}
      
      {step > 1 && step < 6 && (
        <div className="space-y-4">
          <div className="min-h-[60px] flex items-center justify-center">
            <p className="text-sm font-medium leading-relaxed max-w-lg mx-auto">
              {message ? (
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2 justify-center">
                  <CheckCircle className="w-5 h-5" />
                  {message}
                </span>
              ) : instruction}
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button 
              onClick={() => setStep(prev => prev - 1)} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
            
            <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              گام {step - 1} از 4
            </span>

            <button 
              onClick={() => setStep(prev => prev + 1)} 
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
            >
              گام بعدی
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          {/* Manual Number Visualization Tool */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <p className="text-xs text-gray-500 mb-2">می‌خواهید نحوه نمایش یک عدد را ببینید؟</p>
            <div className="flex gap-2 max-w-[200px] mx-auto">
              <input 
                type="number" 
                placeholder="عدد..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-center text-sm font-bold outline-none"
              />
              <button 
                onClick={onVisualize}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                نمایش
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="font-bold text-green-600 dark:text-green-400">تبریک! دوره مقدماتی را تکمیل کردید.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => onSetMode('practice')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-colors">
              تمرین آزاد
            </button>
            <button onClick={() => onSetMode('challenge')} className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-sm font-bold transition-colors">
              ورود به چالش
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialPanel;