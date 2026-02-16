import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock, LogIn, CheckCircle, XCircle } from 'lucide-react';
import { User } from '../../types';

interface ChallengePanelProps {
  user: User | null;
  challenge: { q: string; a: number } | null;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  checkAnswer: () => void;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({
  user,
  challenge,
  userAnswer,
  setUserAnswer,
  checkAnswer,
  feedback,
  streak
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          چالش ریاضی
        </h2>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          امتیاز: {streak * 10}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
        {!user && (
          <div className="absolute inset-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full text-red-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">نیاز به ورود</h3>
            <p className="text-sm text-gray-500">برای شرکت در چالش و ثبت امتیاز باید وارد حساب کاربری خود شوید.</p>
            <Link to="/login" className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              ورود به حساب
            </Link>
          </div>
        )}

        {challenge ? (
          <>
            <div className="text-center space-y-1">
              <div className="text-gray-500 text-xs">پاسخ عبارت زیر را وارد کنید</div>
              <div className="text-5xl font-black text-primary-600 dark:text-primary-400 tracking-wider dir-ltr py-2">
                {challenge.q} = ?
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="پاسخ..."
                className="w-full bg-gray-100 dark:bg-gray-900 border-2 border-transparent focus:border-primary-500 rounded-xl px-4 py-3 text-center text-xl font-bold outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                disabled={!user}
              />
              <button 
                onClick={checkAnswer}
                disabled={!user}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                بررسی پاسخ
              </button>
            </div>

            {feedback && (
              <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl w-full justify-center animate-in zoom-in duration-300 ${feedback === 'correct' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>عالی! درسته (+۱۰ امتیاز)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>اشتباه بود</span>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        )}
      </div>
    </>
  );
};

export default ChallengePanel;