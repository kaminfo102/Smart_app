
import React, { useState } from 'react';
import { Trophy, Medal, Flame, Star, Lock, CheckCircle, Target } from 'lucide-react';
import { Badge, DailyChallenge, LeaderboardUser } from '../../types';

interface GamificationDashboardProps {
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  dailyChallenges: DailyChallenge[];
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ badges, leaderboard, dailyChallenges }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'daily'>('daily');

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex p-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'daily' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <Target className="w-3 h-3" />
          چالش روزانه
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'leaderboard' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <Trophy className="w-3 h-3" />
          برترین‌ها
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'badges' ? 'bg-white dark:bg-gray-800 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
        >
          <Medal className="w-3 h-3" />
          مدال‌ها
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        
        {/* Daily Challenges Tab */}
        {activeTab === 'daily' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
             <div className="text-center mb-4">
                 <h3 className="font-bold text-gray-800 dark:text-white">ماموریت‌های امروز</h3>
                 <p className="text-xs text-gray-500">برای کسب امتیاز بیشتر تکمیل کنید</p>
             </div>
             {dailyChallenges.map(challenge => (
                 <div key={challenge.id} className={`p-3 rounded-xl border transition-all ${challenge.isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                             {challenge.isCompleted ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Target className="w-4 h-4 text-primary-500" />}
                             <span className="font-bold text-sm">{challenge.description}</span>
                         </div>
                         <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 px-2 py-0.5 rounded-full">+{challenge.reward}</span>
                     </div>
                     
                     <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                         <div 
                            className="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-500"
                            style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                         ></div>
                     </div>
                     <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-bold">
                         <span>{challenge.progress}</span>
                         <span>{challenge.target}</span>
                     </div>
                 </div>
             ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
            {leaderboard.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-xl border ${user.isCurrentUser ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center font-black rounded-full text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
                    {user.rank}
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.avatar_bg || 'bg-gray-400'}`}>
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                      <div className="font-bold text-sm">{user.username}</div>
                      {user.isCurrentUser && <span className="text-[10px] text-primary-500 font-bold">شما</span>}
                  </div>
                </div>
                <div className="font-mono font-bold text-gray-600 dark:text-gray-300 text-sm">
                  {user.points} <span className="text-[10px]">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4">
            {badges.map(badge => (
              <div key={badge.id} className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 ${badge.unlocked ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 opacity-60 grayscale'}`}>
                <div className={`p-2 rounded-full ${badge.unlocked ? badge.color : 'bg-gray-200 text-gray-400'}`}>
                   {badge.icon === 'Rocket' && <Flame className="w-5 h-5" />}
                   {badge.icon === 'Flame' && <Flame className="w-5 h-5" />}
                   {badge.icon === 'Crown' && <Trophy className="w-5 h-5" />}
                   {badge.icon === 'Calendar' && <Star className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-xs">{badge.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{badge.description}</div>
                </div>
                {!badge.unlocked && <Lock className="w-3 h-3 text-gray-400" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationDashboard;
