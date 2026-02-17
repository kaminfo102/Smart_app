
import React, { useState, useEffect } from 'react';
import { Term, Lesson, Question } from '../../types';
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Video, FileText, Calculator, GraduationCap, X } from 'lucide-react';
import { lmsService } from '../../services/lmsService';

interface TermEditorProps {
    term?: Term; // If null, creating new
    onClose: () => void;
    onSave: () => void;
}

const TermEditor: React.FC<TermEditorProps> = ({ term, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Term>>({
        title: '',
        description: '',
        price: 0,
        image: '',
    });
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Lesson Edit State
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (term) {
            setFormData({
                id: term.id,
                title: term.title,
                description: term.description,
                price: term.price,
                image: term.image
            });
            // Fetch lessons for this term
            lmsService.getTermLessons(term.id).then(setLessons);
        }
    }, [term]);

    const handleSaveTerm = async () => {
        setLoading(true);
        try {
            await lmsService.saveTerm(formData, lessons);
            onSave();
            onClose();
        } catch (e: any) {
            alert('خطا در ذخیره ترم: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const addLesson = (type: Lesson['type']) => {
        const newLesson: Lesson = {
            id: Date.now(),
            term_id: term?.id || 0,
            title: 'درس جدید',
            type: type,
            is_completed: false,
            questions: []
        };
        setLessons([...lessons, newLesson]);
        setEditingLesson(newLesson);
    };

    const updateLesson = (updated: Lesson) => {
        setLessons(lessons.map(l => l.id === updated.id ? updated : l));
        setEditingLesson(null);
    };

    const removeLesson = (id: number) => {
        if(window.confirm('آیا از حذف این درس اطمینان دارید؟')) {
            setLessons(lessons.filter(l => l.id !== id));
        }
    };

    if (editingLesson) {
        return (
            <LessonEditor 
                lesson={editingLesson} 
                onSave={updateLesson} 
                onCancel={() => setEditingLesson(null)} 
            />
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{term ? 'ویرایش ترم' : 'ایجاد ترم جدید'}</h2>
                <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-1">
                <div className="space-y-4">
                    <input 
                        type="text" placeholder="عنوان ترم" value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none font-bold"
                    />
                    <textarea 
                        placeholder="توضیحات کوتاه" value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number" placeholder="قیمت (تومان)" value={formData.price} 
                            onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                        />
                        <input 
                            type="text" placeholder="لینک تصویر" value={formData.image} 
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">محتوای آموزشی ({lessons.length} درس)</h3>
                        <div className="flex gap-2">
                            <button onClick={() => addLesson('video')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="ویدیو"><Video className="w-5 h-5"/></button>
                            <button onClick={() => addLesson('theory')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="جزوه"><FileText className="w-5 h-5"/></button>
                            <button onClick={() => addLesson('practice')} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" title="تمرین"><Calculator className="w-5 h-5"/></button>
                            <button onClick={() => addLesson('exam')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="آزمون"><GraduationCap className="w-5 h-5"/></button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</span>
                                    {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                                    {lesson.type === 'theory' && <FileText className="w-4 h-4 text-green-500" />}
                                    {lesson.type === 'practice' && <Calculator className="w-4 h-4 text-purple-500" />}
                                    {lesson.type === 'exam' && <GraduationCap className="w-4 h-4 text-red-500" />}
                                    <span className="font-medium text-sm">{lesson.title}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingLesson(lesson)} className="px-3 py-1 bg-white dark:bg-gray-700 text-xs rounded-lg shadow-sm">ویرایش</button>
                                    <button onClick={() => removeLesson(lesson.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {lessons.length === 0 && <p className="text-center text-gray-400 text-sm py-4">هنوز درسی اضافه نشده است.</p>}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSaveTerm} 
                disabled={loading}
                className="w-full mt-6 bg-primary-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
                {loading ? 'در حال ذخیره...' : <><Save className="w-5 h-5" /> ذخیره تغییرات</>}
            </button>
        </div>
    );
};

const LessonEditor: React.FC<{ lesson: Lesson, onSave: (l: Lesson) => void, onCancel: () => void }> = ({ lesson, onSave, onCancel }) => {
    const [data, setData] = useState<Lesson>(lesson);

    // Simple Question Editor for Exams
    const addQuestion = () => {
        const q: Question = { id: Date.now(), text: '', options: ['', '', '', ''], correct_index: 0 };
        setData({ ...data, questions: [...(data.questions || []), q] });
    };

    const updateQuestion = (idx: number, field: keyof Question, value: any) => {
        const newQs = [...(data.questions || [])];
        newQs[idx] = { ...newQs[idx], [field]: value };
        setData({ ...data, questions: newQs });
    };

    const updateOption = (qIdx: number, oIdx: number, val: string) => {
        const newQs = [...(data.questions || [])];
        const newOpts = [...newQs[qIdx].options];
        newOpts[oIdx] = val;
        newQs[qIdx].options = newOpts;
        setData({ ...data, questions: newQs });
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                ویرایش درس: 
                <span className="text-primary-600">{data.type === 'video' ? 'ویدیو' : data.type === 'theory' ? 'متن/جزوه' : data.type === 'practice' ? 'تمرین' : 'آزمون'}</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <input 
                    type="text" placeholder="عنوان درس" value={data.title}
                    onChange={e => setData({...data, title: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none"
                />

                {data.type === 'video' && (
                    <input 
                        type="text" placeholder="لینک ویدیو (MP4)" value={data.video_url}
                        onChange={e => setData({...data, video_url: e.target.value})}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dir-ltr text-left"
                    />
                )}

                {data.type === 'theory' && (
                    <textarea 
                        placeholder="محتوای متنی (HTML پشتیبانی می‌شود)" rows={10} value={data.content}
                        onChange={e => setData({...data, content: e.target.value})}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none font-mono text-sm"
                    />
                )}
                
                {data.type === 'practice' && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl text-center text-gray-500">
                        تنظیمات تمرین چرتکه به صورت خودکار اعمال می‌شود.
                    </div>
                )}

                {data.type === 'exam' && (
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                             <h4 className="font-bold">سوالات آزمون</h4>
                             <button onClick={addQuestion} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">+ سوال جدید</button>
                         </div>
                         {data.questions?.map((q, idx) => (
                             <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                 <input 
                                     type="text" placeholder="متن سوال" value={q.text}
                                     onChange={e => updateQuestion(idx, 'text', e.target.value)}
                                     className="w-full border-b border-gray-100 dark:border-gray-700 pb-2 bg-transparent outline-none font-bold"
                                 />
                                 <div className="grid grid-cols-2 gap-2">
                                     {q.options.map((opt, oIdx) => (
                                         <div key={oIdx} className="flex items-center gap-2">
                                             <input 
                                                type="radio" name={`q-${idx}`} checked={q.correct_index === oIdx}
                                                onChange={() => updateQuestion(idx, 'correct_index', oIdx)}
                                             />
                                             <input 
                                                type="text" value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)}
                                                className="flex-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded text-sm outline-none"
                                                placeholder={`گزینه ${oIdx + 1}`}
                                             />
                                         </div>
                                     ))}
                                 </div>
                                 <button 
                                    onClick={() => setData({...data, questions: data.questions?.filter((_, i) => i !== idx)})}
                                    className="text-red-500 text-xs mt-2"
                                 >
                                    حذف سوال
                                 </button>
                             </div>
                         ))}
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-6">
                <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">لغو</button>
                <button onClick={() => onSave(data)} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold">تایید</button>
            </div>
        </div>
    );
};

export default TermEditor;
