
import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, HelpCircle, Trophy, Calculator, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { gamificationService } from '../services/gamificationService';
import { Badge, DailyChallenge, LeaderboardUser } from '../types';

// Components
import AbacusHeader from '../components/Abacus/AbacusHeader';
import AbacusControls from '../components/Abacus/AbacusControls';
import AbacusCanvas, { AbacusRef } from '../components/Abacus/AbacusCanvas';
import TutorialPanel from '../components/Abacus/TutorialPanel';
import ChallengePanel from '../components/Abacus/ChallengePanel';
import PracticePanel from '../components/Abacus/PracticePanel';
import GamificationDashboard from '../components/Abacus/GamificationDashboard';

const AbacusTraining: React.FC = () => {
  const { user, updateUserPoints } = useAuth();
  
  // Settings
  const [numberOfRods, setNumberOfRods] = useState(() => window.innerWidth < 640 ? 7 : 10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mode, setMode] = useState<'challenge' | 'practice' | 'tutorial'>('challenge');
  const [showAbacus, setShowAbacus] = useState(false); // Default Hidden

  // Logic State
  const [currentAbacusValue, setCurrentAbacusValue] = useState(0);
  
  // Challenge State
  const [challenge, setChallenge] = useState<{ q: string; a: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);

  // Gamification State
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [newBadgeAlert, setNewBadgeAlert] = useState<Badge | null>(null);

  // Practice State
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialMessage, setTutorialMessage] = useState('');
  const [tutorialInput, setTutorialInput] = useState('');

  // Engine Ref
  const abacusRef = useRef<AbacusRef>(null);

  // --- Initial Data Load ---
  useEffect(() => {
    // Load badges
    const history = authService.getTrainingHistory();
    setBadges(gamificationService.getBadges(history));
    
    // Load Real Leaderboard
    const fetchLeaderboard = async () => {
        try {
            const realUsers = await authService.getLeaderboard();
            if (realUsers.length > 0) {
                 const formatted: LeaderboardUser[] = realUsers.map((u: any, index: number) => ({
                    id: u.id,
                    username: u.display_name || u.username,
                    points: u.points,
                    rank: index + 1,
                    isCurrentUser: user ? u.username === user.username : false,
                    avatar_bg: ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'][index % 4]
                 }));
                 setLeaderboard(formatted);
            } else {
                 // Fallback to mock if API fails or empty
                 setLeaderboard(gamificationService.getLeaderboard(user));
            }
        } catch (e) {
            console.error("Failed to load real leaderboard, using mock", e);
            setLeaderboard(gamificationService.getLeaderboard(user));
        }
    };
    fetchLeaderboard();

    // Load Daily Challenges
    setDailyChallenges(gamificationService.getDailyChallenges());
  }, [user]);

  // --- Effect: Mode Change ---
  useEffect(() => {
    if (mode === 'challenge') generateChallenge();
    else if (mode === 'practice') {
        setChallenge(null);
        setFeedback(null);
        setStreak(0);
    } else if (mode === 'tutorial') {
        setShowAbacus(true); // Auto show for tutorial
        setTutorialStep(1);
        setTutorialMessage('');
        setTutorialInput('');
        if (abacusRef.current) abacusRef.current.reset();
    }
  }, [mode]);

  // --- Logic: Tutorial Steps ---
  useEffect(() => {
    if (mode !== 'tutorial') return;

    let timeout: ReturnType<typeof setTimeout>;
    
    // Check milestones based on current value and step
    const checkStep = (targetVal: number, nextStep: number, msg: string) => {
        if (tutorialStep === nextStep - 1 && currentAbacusValue === targetVal) {
            setTutorialMessage(msg);
            timeout = setTimeout(() => {
                setTutorialStep(nextStep);
                if (nextStep < 6 && abacusRef.current) abacusRef.current.reset();
                setTutorialMessage("");
            }, 1500);
        }
    };

    checkStep(1, 3, "آفرین! درست بود."); // Step 2 -> 3
    checkStep(5, 4, "عالیه! مقدار ۵ ثبت شد."); // Step 3 -> 4
    checkStep(6, 5, "احسنت! ۵ به علاوه ۱ میشه ۶."); // Step 4 -> 5
    
    // Step 5 -> 6 (Final)
    if (tutorialStep === 5 && currentAbacusValue === 12) {
        setTutorialMessage("فوق‌العاده! مفهوم دهگان رو یاد گرفتی.");
        timeout = setTimeout(() => {
            setTutorialStep(6);
            setTutorialMessage("");
        }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [currentAbacusValue, tutorialStep, mode]);

  // --- Logic: Challenge ---
  const generateChallenge = () => {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let n1 = Math.floor(Math.random() * 50) + 10;
    let n2 = Math.floor(Math.random() * 9) + 1;
    
    if (op === '-' && n2 > n1) {
        const temp = n1;
        n1 = n2;
        n2 = temp;
    }

    const question = `${n1} ${op} ${n2}`;
    const answer = op === '+' ? n1 + n2 : n1 - n2;
    
    setChallenge({ q: question, a: answer });
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!challenge) return;
    if (parseInt(userAnswer) === challenge.a) {
        setFeedback('correct');
        const pointsEarned = 10;
        setStreak(s => s + 1);
        
        if (user) {
            updateUserPoints(pointsEarned);
            
            // Save Session
            authService.saveTrainingSession({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                score: pointsEarned,
                correct_answers: 1,
                total_questions: 1,
                mode: 'challenge'
            });

            // --- Gamification Checks ---
            
            // 1. Update Daily Challenges
            const { completed: scoreCompleted } = gamificationService.updateDailyProgress('score', pointsEarned);
            const { completed: questionsCompleted } = gamificationService.updateDailyProgress('questions', 1);
            const justCompleted = [...scoreCompleted, ...questionsCompleted];
            
            if (justCompleted.length > 0) {
                 // Award points for daily challenge
                 const bonus = justCompleted.reduce((acc, c) => acc + c.reward, 0);
                 updateUserPoints(bonus);
            }
            setDailyChallenges(gamificationService.getDailyChallenges());

            // 2. Check Badges
            const history = authService.getTrainingHistory();
            const updatedBadges = gamificationService.getBadges(history);
            
            // Find newly unlocked
            const newlyUnlocked = updatedBadges.find(b => b.unlocked && !badges.find(old => old.id === b.id)?.unlocked);
            if (newlyUnlocked) {
                setNewBadgeAlert(newlyUnlocked);
                setTimeout(() => setNewBadgeAlert(null), 3000);
            }
            setBadges(updatedBadges);
        }
        setTimeout(generateChallenge, 1500);
    } else {
        setFeedback('wrong');
        setStreak(0);
    }
  };

  // --- Helper: Tutorial Instruction Text ---
  const getTutorialInstruction = (step: number) => {
    switch(step) {
        case 1: return "به آموزش تعاملی خوش آمدید! در این بخش با نحوه کار چرتکه آشنا می‌شوید.";
        case 2: return "گام ۱: مهره‌های ردیف پایین ارزش ۱ دارند. با حرکت دادن یک مهره پایین به بالا، عدد ۱ را بسازید.";
        case 3: return "گام ۲: مهره‌های ردیف بالا ارزش ۵ دارند. با حرکت دادن یک مهره بالا به پایین، عدد ۵ را بسازید.";
        case 4: return "گام ۳: برای ساخت عدد ۶، هم مهره ۵ (بالا) و هم یک مهره ۱ (پایین) را همزمان فعال کنید.";
        case 5: return "گام ۴: ارزش مکانی. ستون دوم از راست دهگان است. عدد ۱۲ را بسازید (۱ در دهگان، ۲ در یکان).";
        case 6: return "تبریک! شما اصول پایه را یاد گرفتید.";
        default: return "";
    }
  };
  
  const handleVisualizeNumber = () => {
      const val = parseInt(tutorialInput);
      if (!isNaN(val) && val >= 0 && abacusRef.current) {
          abacusRef.current.setValue(val);
      }
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 max-w-6xl pb-24 relative min-h-screen">
      
      {/* Badge Toast Notification */}
      {newBadgeAlert && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-10">
              <div className="bg-yellow-400 p-2 rounded-full text-white">
                  <Trophy />
              </div>
              <div>
                  <div className="font-bold">مدال جدید آزاد شد!</div>
                  <div className="text-sm">{newBadgeAlert.name}</div>
              </div>
          </div>
      )}

      {/* Hero Score Section */}
      {user && (
          <div className="relative mb-6 rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl p-6 md:p-8 text-white flex flex-col items-center justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="relative z-10 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-indigo-200 text-sm font-bold uppercase tracking-wider">
                      <Medal className="w-4 h-4" />
                      مجموع امتیازات شما
                  </div>
                  <div className="text-6xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                      {user.points || 0}
                  </div>
                  <p className="text-xs md:text-sm text-indigo-200">به تلاش ادامه دهید تا به رتبه‌های بالاتر برسید!</p>
              </div>
          </div>
      )}

      <AbacusHeader 
        user={user} 
        mode={mode} 
        setMode={setMode} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* 1. Challenge/Question Panel */}
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 z-20 sticky top-16 lg:static">
             <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                {mode === 'challenge' && (
                    <ChallengePanel 
                        user={user}
                        challenge={challenge}
                        userAnswer={userAnswer}
                        setUserAnswer={setUserAnswer}
                        checkAnswer={checkAnswer}
                        feedback={feedback}
                        streak={streak}
                    />
                )}

                {mode === 'practice' && (
                     <PracticePanel 
                        currentAbacusValue={currentAbacusValue}
                        targetNumber={targetNumber}
                        setTargetNumber={setTargetNumber}
                     />
                )}
                
                {mode === 'tutorial' && (
                     <div className="flex flex-col h-full z-10 relative justify-center text-center space-y-4 opacity-50 pointer-events-none grayscale py-4 md:py-10">
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                             <HelpCircle className="w-6 h-6 md:w-8 md:h-8" />
                         </div>
                         <h2 className="text-lg md:text-xl font-bold">حالت آموزشی فعال</h2>
                         <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                             لطفاً از پنل پایین برای دنبال کردن مراحل آموزش استفاده کنید.
                         </p>
                     </div>
                )}
            </div>
        </div>

        {/* 2. Abacus Simulator & Controls */}
        <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:row-span-2 flex flex-col gap-4 min-w-0">
            
            {/* Toggle Abacus Visibility */}
            <button 
                onClick={() => setShowAbacus(!showAbacus)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${showAbacus ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${showAbacus ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-gray-800 dark:text-white">شبیه‌ساز چرتکه</div>
                        <div className="text-xs text-gray-500">{showAbacus ? 'برای بستن کلیک کنید' : 'برای تمرین با چرتکه کلیک کنید'}</div>
                    </div>
                </div>
                {showAbacus ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showAbacus && (
                <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
                    <AbacusControls 
                        numberOfRods={numberOfRods}
                        setNumberOfRods={setNumberOfRods}
                        soundEnabled={soundEnabled}
                        setSoundEnabled={setSoundEnabled}
                        onReset={() => abacusRef.current?.reset()}
                        mode={mode}
                        currentAbacusValue={currentAbacusValue}
                    />

                    {mode === 'tutorial' && (
                    <TutorialPanel 
                        step={tutorialStep}
                        setStep={setTutorialStep}
                        message={tutorialMessage}
                        instruction={getTutorialInstruction(tutorialStep)}
                        inputValue={tutorialInput}
                        setInputValue={setTutorialInput}
                        onVisualize={handleVisualizeNumber}
                        onSetMode={setMode}
                    />
                    )}

                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-2 md:p-6 rounded-3xl shadow-xl border border-amber-200 dark:border-gray-700 relative overflow-hidden flex flex-col justify-center min-h-[300px] md:min-h-[400px]">
                        <AbacusCanvas 
                            ref={abacusRef}
                            numberOfRods={numberOfRods}
                            soundEnabled={soundEnabled}
                            onUpdate={setCurrentAbacusValue}
                        />
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        <MousePointer2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                            <strong>راهنما:</strong> مهره‌های بالا (۵) و پایین (۱) را به سمت میله میانی حرکت دهید. 
                            <span className="block mt-1 text-xs opacity-80">نکته: برای اسکرول افقی روی موبایل، انگشت خود را روی ناحیه خالی پایین چرتکه بکشید.</span>
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* 3. Gamification Stats */}
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-full max-h-[500px] overflow-hidden">
                <GamificationDashboard 
                   badges={badges}
                   leaderboard={leaderboard}
                   dailyChallenges={dailyChallenges}
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default AbacusTraining;
