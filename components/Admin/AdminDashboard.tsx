
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, ArrowUpRight, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { wooService } from '../../services/wooService';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { formatPrice } from '../../constants';

interface AdminDashboardProps {
    currentUser: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const ordersData = await wooService.getOrders({ per_page: 50 });
                const usersData = await authService.getAllUsers(currentUser);
                const totalSales = ordersData.reduce((acc, order) => acc + parseInt(order.total), 0);

                setStats({
                    totalSales,
                    totalOrders: ordersData.length,
                    totalCustomers: usersData.length,
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [currentUser]);

    if (loading) return <div className="p-8 text-center text-gray-500">در حال محاسبه آمار...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-500" />
                نمای کلی فروشگاه
            </h2>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Sales Card */}
                <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-green-500 text-xs font-bold gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-gray-500 text-xs md:text-sm font-bold">فروش کل</h3>
                        <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">{formatPrice(stats.totalSales)} <span className="text-xs font-normal text-gray-400">تومان</span></p>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-gray-500 text-xs md:text-sm font-bold">تعداد سفارشات</h3>
                        <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.totalOrders}</p>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-gray-500 text-xs md:text-sm font-bold">کاربران</h3>
                        <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.totalCustomers}</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">آمار فروش هفته</h3>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-end justify-between h-40 gap-2">
                    {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
                        <div key={i} className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-xl relative group overflow-hidden">
                            <div 
                                className="absolute bottom-0 w-full bg-primary-500 rounded-t-xl transition-all duration-1000 group-hover:bg-primary-400" 
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] md:text-xs text-gray-400 font-bold">
                    <span>ش</span><span>۱ش</span><span>۲ش</span><span>۳ش</span><span>۴ش</span><span>۵ش</span><span>ج</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
