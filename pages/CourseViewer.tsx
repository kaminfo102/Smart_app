
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lmsService } from '../services/lmsService';
import { Lesson, Question } from '../types';
import { PlayCircle, FileText, CheckCircle, Calculator, GraduationCap, ChevronLeft, ChevronRight, Menu, X, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import AbacusCanvas, { AbacusRef } from '../components/Abacus/AbacusCanvas';
import { useAuth } from '../contexts/AuthContext';

const CourseViewer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateUserPoints } = useAuth();
    
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default on mobile load

    // Practice State
    const abacusRef = useRef<AbacusRef>(null);
    const [currentAbacusValue, setCurrentAbacusValue] = useState(0);
    const [targetNumber, setTargetNumber] = useState(0);
    const [practiceScore, setPracticeScore] = useState(0);
    
    // Exam State
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examAnswers, setExamAnswers] = useState<number[]>([]);
    const [examFinished, setExamFinished] = useState(false);

    // Initial Load
    useEffect(() => {
        if (id) {
            lmsService.getTermLessons(parseInt(id)).then(data => {
                setLessons(data);
                if (data.length > 0) setActiveLesson(data[0]);
            });
        }
        // Check screen size for sidebar
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, [id]);

    useEffect(() => {
        // Reset states when lesson changes
        setExamFinished(false);
        setPracticeScore(0);
        setCurrentQuestionIndex(0);
        setExamAnswers([]);
        
        // Auto close sidebar on mobile when lesson changes
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
        
        if (activeLesson?.type === 'practice') {
            generateNewPractice();
        }
        if (activeLesson?.type === 'exam' && id) {
            if (activeLesson.questions) {
                setExamQuestions(activeLesson.questions);
            }
        }
    }, [activeLesson, id]);

    const generateNewPractice = () => {
        setTargetNumber(Math.floor(Math.random() * 20) + 1);
        if (abacusRef.current) abacusRef.current.reset();
    };

    const checkPractice = () => {
        if (currentAbacusValue === targetNumber) {
            const newScore = practiceScore + 1;
            setPracticeScore(newScore);
            updateUserPoints(5);
            if (newScore >= 5) {
                lmsService.completeLesson(activeLesson!.id);
                alert('تمرین با موفقیت تکمیل شد! درس بعدی باز شد.');
                if (id) {
                    lmsService.getTermLessons(parseInt(id)).then(setLessons);
                }
            } else {
                generateNewPractice();
            }
        } else {
            alert('اشتباه! دوباره تلاش کن.');
        }
    };

    const handleAnswerExam = (optionIndex: number) => {
        const newAnswers = [...examAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setExamAnswers(newAnswers);
    };

    const submitExam = () => {
        let correctCount = 0;
        examQuestions.forEach((q, idx) => {
            if (examAnswers[idx] === q.correct_index) correctCount++;
        });
        
        const score = (correctCount / examQuestions.length) * 100;
        setExamFinished(true);
        lmsService.completeLesson(activeLesson!.id, score);
        updateUserPoints(score);
        
        if (score >= 75) {
            alert(`تبریک! شما با نمره ${score} قبول شدید.`);
        } else {
            alert(`نمره شما: ${score}. متاسفانه قبول نشدید. تلاش مجدد.`);
        }
         if (id) {
            lmsService.getTermLessons(parseInt(id)).then(setLessons);
         }
    };

    // Navigation Helpers
    const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    const progressPercent = (lessons.filter(l => l.is_completed).length / lessons.length) * 100;

    if (!activeLesson) return <div className="flex items-center justify-center h-screen">در حال بارگذاری...</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (Drawer on Mobile, Fixed on Desktop) */}
            <aside 
                className={`
                    fixed lg:static inset-y-0 right-0 z-40 w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 
                    transform transition-transform duration-300 ease-in-out h-full flex flex-col shadow-2xl lg:shadow-none
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none'}
                `}
            >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-primary-600 text-white">
                    <h2 className="font-bold text-sm">سرفصل‌های دوره</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {lessons.map((lesson, idx) => (
                        <button 
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${activeLesson.id === lesson.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-r-4 border-primary-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-r-4 border-transparent'}`}
                        >
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${lesson.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                {lesson.is_completed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate">{lesson.title}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                    {lesson.type === 'video' && <PlayCircle className="w-3 h-3" />}
                                    {lesson.type === 'theory' && <FileText className="w-3 h-3" />}
                                    {lesson.type === 'practice' && <Calculator className="w-3 h-3" />}
                                    {lesson.type === 'exam' && <GraduationCap className="w-3 h-3" />}
                                    <span className="truncate">{lesson.type === 'video' ? 'ویدیو' : lesson.type === 'theory' ? 'جزوه' : lesson.type === 'practice' ? 'تمرین' : 'آزمون'}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-bold w-full py-2">
                        <ArrowRight className="w-4 h-4" />
                        بازگشت به داشبورد
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900 h-full">
                
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 shrink-0 flex items-center justify-between px-4 z-10 sticky top-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shrink-0">
                             <Menu className="w-5 h-5" />
                         </button>
                         <div className="flex flex-col">
                             <h1 className="font-bold text-sm md:text-lg truncate">{activeLesson.title}</h1>
                             <span className="text-[10px] text-gray-500 md:hidden">درس {currentIndex + 1} از {lessons.length}</span>
                         </div>
                    </div>
                    
                    {/* Progress Bar (Desktop & Mobile) */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-500">پیشرفت دوره</span>
                            <span className="text-xs font-bold text-primary-600">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-24 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[400px] flex flex-col">
                        
                        {/* 1. Video Player */}
                        {activeLesson.type === 'video' && (
                            <div className="flex-1 flex flex-col">
                                <div className="aspect-video bg-black w-full sticky top-0 z-10">
                                    <video controls className="w-full h-full" src={activeLesson.video_url} poster="https://via.placeholder.com/800x450.png?text=Video+Player" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                                        {activeLesson.is_completed && <CheckCircle className="text-green-500 w-6 h-6" />}
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6">برای تکمیل این درس، ویدیو را تا انتها مشاهده کنید و سپس دکمه تکمیل را بزنید.</p>
                                    
                                    {!activeLesson.is_completed && (
                                        <button 
                                            onClick={() => { 
                                                lmsService.completeLesson(activeLesson.id); 
                                                if (id) lmsService.getTermLessons(parseInt(id)).then(setLessons);
                                            }}
                                            className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-transform"
                                        >
                                            تکمیل و ادامه
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Text/Theory */}
                        {activeLesson.type === 'theory' && (
                            <div className="p-6 md:p-8">
                                <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }} />
                                {!activeLesson.is_completed && (
                                    <button 
                                        onClick={() => { 
                                            lmsService.completeLesson(activeLesson.id); 
                                            if (id) lmsService.getTermLessons(parseInt(id)).then(setLessons);
                                        }}
                                        className="mt-8 w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-transform"
                                    >
                                        تکمیل مطالعه
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 3. Interactive Practice */}
                        {activeLesson.type === 'practice' && (
                            <div className="p-4 md:p-6 flex flex-col items-center flex-1">
                                <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center mb-6 border border-blue-100 dark:border-blue-800">
                                    <h3 className="font-bold text-lg mb-1">تمرین تعاملی</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">عدد <span className="text-2xl font-black text-primary-600 mx-1 align-middle">{targetNumber}</span> را نشان دهید.</p>
                                    <div className="flex justify-center gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= practiceScore ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex-1 w-full flex flex-col justify-center overflow-hidden">
                                     <AbacusCanvas 
                                        ref={abacusRef}
                                        numberOfRods={window.innerWidth < 640 ? 7 : 10}
                                        soundEnabled={true}
                                        onUpdate={setCurrentAbacusValue}
                                     />
                                </div>

                                <div className="mt-6 flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                                     <div className="text-lg font-bold bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-xl w-full md:w-auto text-center">عدد شما: {currentAbacusValue}</div>
                                     <button 
                                        onClick={checkPractice}
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 active:scale-95 transition-transform"
                                     >
                                         بررسی پاسخ
                                     </button>
                                </div>
                            </div>
                        )}

                        {/* 4. Exam */}
                        {activeLesson.type === 'exam' && (
                            <div className="p-4 md:p-10 flex-1 flex flex-col">
                                {!examFinished ? (
                                    <>
                                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                            <div>
                                                <h2 className="text-lg font-bold">آزمون پایان ترم</h2>
                                                <span className="text-xs text-gray-500">سوال {currentQuestionIndex + 1} از {examQuestions.length}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-xl text-xs">
                                                <Clock className="w-4 h-4" />
                                                ۲۰:۰۰
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="mb-6">
                                                <h3 className="text-base md:text-lg font-bold leading-relaxed">{examQuestions[currentQuestionIndex]?.text}</h3>
                                            </div>

                                            <div className="space-y-3">
                                                {examQuestions[currentQuestionIndex]?.options.map((opt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAnswerExam(idx)}
                                                        className={`w-full text-right p-4 rounded-xl border-2 transition-all text-sm font-medium ${examAnswers[currentQuestionIndex] === idx ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button 
                                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                                disabled={currentQuestionIndex === 0}
                                                className="px-6 py-3 rounded-xl text-gray-500 font-bold disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                قبلی
                                            </button>
                                            {currentQuestionIndex < examQuestions.length - 1 ? (
                                                <button 
                                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                                    className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-transform"
                                                >
                                                    بعدی
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={submitExam}
                                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/30 active:scale-95 transition-transform"
                                                >
                                                    پایان و ثبت
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
                                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                                            <GraduationCap className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black mb-2">آزمون به پایان رسید</h2>
                                            <p className="text-gray-500">نمره شما ثبت شد و در کارنامه قابل مشاهده است.</p>
                                        </div>
                                        <button onClick={() => navigate('/dashboard')} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                                            بازگشت به داشبورد
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Bottom Navigation Controls (Lesson Switcher) */}
                    <div className="max-w-4xl mx-auto mt-6 flex gap-4">
                        <button 
                            onClick={() => prevLesson && setActiveLesson(prevLesson)}
                            disabled={!prevLesson}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all ${!prevLesson ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md active:scale-95'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                            درس قبلی
                        </button>
                        <button 
                            onClick={() => nextLesson && setActiveLesson(nextLesson)}
                            disabled={!nextLesson}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all ${!nextLesson ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm hover:shadow-md active:scale-95'}`}
                        >
                            درس بعدی
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseViewer;
