
import { Badge, DailyChallenge, LeaderboardUser, TrainingSession, User } from '../types';

const DAILY_CHALLENGE_KEY = 'abacus_daily_challenges';
const BADGES_KEY = 'abacus_badges';

export const gamificationService = {
  
  // --- Badges ---
  getBadges: (history: TrainingSession[]): Badge[] => {
    const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
    const totalQuestions = history.reduce((acc, curr) => acc + curr.total_questions, 0);
    const maxStreak = history.length > 0 ? history.length : 0; // Simplified streak for now

    const definitions = [
      {
        id: 'beginner',
        name: 'شروع قدرتمند',
        description: 'کسب اولین ۱۰ امتیاز',
        icon: 'Rocket',
        color: 'text-blue-500 bg-blue-100',
        condition: () => totalScore >= 10
      },
      {
        id: 'streak_5',
        name: 'آتشین',
        description: 'پاسخ صحیح به ۵ سوال',
        icon: 'Flame',
        color: 'text-orange-500 bg-orange-100',
        condition: () => totalQuestions >= 5
      },
      {
        id: 'master_1000',
        name: 'استاد چرتکه',
        description: 'کسب ۱۰۰۰ امتیاز کل',
        icon: 'Crown',
        color: 'text-purple-500 bg-purple-100',
        condition: () => totalScore >= 1000
      },
      {
        id: 'dedication',
        name: 'متعهد',
        description: 'انجام ۱۰ جلسه تمرینی',
        icon: 'Calendar',
        color: 'text-green-500 bg-green-100',
        condition: () => history.length >= 10
      }
    ];

    // Load unlocked status from local storage to persist timestamps
    const storedBadges = JSON.parse(localStorage.getItem(BADGES_KEY) || '{}');

    return definitions.map(def => {
      const isUnlocked = def.condition();
      const stored = storedBadges[def.id];
      
      // If just unlocked, save it
      if (isUnlocked && !stored) {
        storedBadges[def.id] = { unlockedAt: new Date().toISOString() };
        localStorage.setItem(BADGES_KEY, JSON.stringify(storedBadges));
      }

      return {
        ...def,
        unlocked: isUnlocked,
        unlockedAt: stored?.unlockedAt || (isUnlocked ? new Date().toISOString() : undefined)
      };
    });
  },

  // --- Daily Challenges ---
  getDailyChallenges: (): DailyChallenge[] => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(DAILY_CHALLENGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed.challenges;
      }
    }

    // Generate new challenges for today
    const newChallenges: DailyChallenge[] = [
      {
        id: 'daily_score',
        description: 'کسب ۵۰ امتیاز در چالش',
        target: 50,
        progress: 0,
        reward: 20,
        isCompleted: false,
        type: 'score'
      },
      {
        id: 'daily_questions',
        description: 'پاسخ صحیح به ۱۰ سوال',
        target: 10,
        progress: 0,
        reward: 15,
        isCompleted: false,
        type: 'questions'
      },
    ];

    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify({ date: today, challenges: newChallenges }));
    return newChallenges;
  },

  updateDailyProgress: (type: 'score' | 'questions' | 'streak', amount: number): { completed: DailyChallenge[] } => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(DAILY_CHALLENGE_KEY);
    if (!stored) return { completed: [] };

    const parsed = JSON.parse(stored);
    if (parsed.date !== today) return { completed: [] };

    const completedNow: DailyChallenge[] = [];
    const updatedChallenges = parsed.challenges.map((ch: DailyChallenge) => {
      if (ch.type === type && !ch.isCompleted) {
        const newProgress = Math.min(ch.progress + amount, ch.target);
        const isFinished = newProgress >= ch.target;
        if (isFinished) completedNow.push(ch);
        return { ...ch, progress: newProgress, isCompleted: isFinished };
      }
      return ch;
    });

    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify({ date: today, challenges: updatedChallenges }));
    return { completed: completedNow };
  },

  // --- Leaderboard (Mock) ---
  getLeaderboard: (currentUser: User | null): LeaderboardUser[] => {
    const mockUsers: LeaderboardUser[] = [
      { id: 101, username: 'ali_reza', points: 2540, rank: 1, avatar_bg: 'bg-yellow-500' },
      { id: 102, username: 'sara_math', points: 2100, rank: 2, avatar_bg: 'bg-gray-400' },
      { id: 103, username: 'kids_smart', points: 1850, rank: 3, avatar_bg: 'bg-orange-600' },
      { id: 104, username: 'mohammad_88', points: 1200, rank: 4, avatar_bg: 'bg-blue-500' },
      { id: 105, username: 'zahra_tehrani', points: 950, rank: 5, avatar_bg: 'bg-pink-500' },
    ];

    if (currentUser) {
      // Check if user is in top 5, if not add them
      const userInTop = mockUsers.find(u => u.username === currentUser.username);
      if (!userInTop) {
        // Calculate a random rank based on points for demo
        const userRank = currentUser.points && currentUser.points > 0 ? 6 : 12;
        mockUsers.push({
          id: currentUser.id,
          username: currentUser.username,
          points: currentUser.points || 0,
          rank: userRank,
          isCurrentUser: true,
          avatar_bg: 'bg-primary-600'
        });
      } else {
          userInTop.isCurrentUser = true;
          userInTop.points = currentUser.points || userInTop.points; // Update real points
      }
    }

    return mockUsers.sort((a, b) => b.points - a.points);
  }
};
