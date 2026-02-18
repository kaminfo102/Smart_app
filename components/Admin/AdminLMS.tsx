
import React, { useState, useEffect } from 'react';
import { lmsService } from '../../services/lmsService';
import { Term } from '../../types';
import { Plus, Edit, Trash2, BookOpen, Layers } from 'lucide-react';
import TermEditor from './TermEditor';
import { formatPrice } from '../../constants';

const AdminLMS: React.FC = () => {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTerm, setEditingTerm] = useState<Term | undefined | null>(null);

    useEffect(() => {
        loadTerms();
    }, []);

    const loadTerms = async () => {
        setLoading(true);
        try {
            // true = skip cache for admin
            const data = await lmsService.getTerms(true);
            setTerms(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(window.confirm('آیا مطمئن هستید؟ با حذف ترم، تمام درس‌های آن نیز حذف می‌شوند.')) {
            try {
                await lmsService.deleteTerm(id);
                loadTerms();
            } catch (e) {
                alert('خطا در حذف');
            }
        }
    };

    if (editingTerm !== null) {
        return (
            <div className="h-[calc(100vh-100px)]">
                <TermEditor 
                    term={editingTerm} 
                    onClose={() => setEditingTerm(null)} 
                    onSave={loadTerms}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary-500" />
                    مدیریت ترم‌های آموزشی
                </h2>
                <button 
                    onClick={() => setEditingTerm(undefined)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-5 h-5" />
                    ترم جدید
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">در حال بارگذاری ترم‌ها...</div>
            ) : terms.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Layers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">هیچ ترم آموزشی یافت نشد.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {terms.map(term => (
                        <div key={term.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm group hover:shadow-md transition-all">
                            <div className="h-40 bg-gray-200 relative">
                                {term.image && <img src={term.image} alt={term.title} className="w-full h-full object-cover" />}
                                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                                    {term.lessons_count} درس
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-2">{term.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{term.description}</p>
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="font-bold text-primary-600">{formatPrice(term.price)} تومان</div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingTerm(term)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(term.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminLMS;
