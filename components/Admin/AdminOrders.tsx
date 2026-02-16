
import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { wooService } from '../../services/wooService';
import { Order } from '../../types';
import { formatPrice } from '../../constants';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await wooService.getOrders({ per_page: 50 });
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (id: number, status: string) => {
        try {
            await wooService.updateOrder(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if(!window.confirm('آیا مطمئن هستید؟')) return;
        try {
            await wooService.deleteOrder(id);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const filteredOrders = orders.filter(o => o.id.toString().includes(search) || o.billing.last_name.includes(search));

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">مدیریت سفارشات</h2>
                 <div className="relative w-full md:w-auto">
                    <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="جستجو سفارش..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pr-10 pl-4 outline-none focus:border-primary-500 text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">در حال دریافت سفارشات...</div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center font-bold text-gray-500 shrink-0">
                                    #{order.id}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
                                        {order.billing.first_name} {order.billing.last_name}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                                        <span>{new Date(order.date_created).toLocaleDateString('fa-IR')}</span>
                                        <span className="hidden md:inline">|</span>
                                        <span className="font-bold text-primary-600">{formatPrice(order.total)} تومان</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`flex-1 lg:flex-none appearance-none px-4 py-2 rounded-xl text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                >
                                    <option value="pending">در انتظار پرداخت</option>
                                    <option value="processing">در حال انجام</option>
                                    <option value="on-hold">در انتظار بررسی</option>
                                    <option value="completed">تکمیل شده</option>
                                    <option value="cancelled">لغو شده</option>
                                    <option value="failed">ناموفق</option>
                                </select>

                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                                    <button 
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
