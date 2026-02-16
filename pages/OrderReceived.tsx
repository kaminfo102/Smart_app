import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wooService } from '../services/wooService';
import { Order } from '../types';
import { formatPrice } from '../constants';
import { CheckCircle, Printer, Home, ShoppingBag, CreditCard, Calendar, User } from 'lucide-react';

const OrderReceived: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        wooService.getOrder(parseInt(id)).then(data => {
            setOrder(data);
            setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="text-center py-20">در حال دریافت اطلاعات فاکتور...</div>;
  if (!order) return <div className="text-center py-20 text-red-500">سفارش یافت نشد.</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4">
        {/* Success Header */}
        <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">سفارش شما با موفقیت ثبت شد!</h1>
            <p className="text-gray-500">کد پیگیری سفارش: <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-lg">#{order.id}</span></p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:shadow-none print:border">
            {/* Invoice Header */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="font-bold text-lg">فاکتور فروش</h2>
                    <span className="text-xs text-gray-500">تاریخ: {new Date(order.date_created).toLocaleDateString('fa-IR')}</span>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors print:hidden">
                    <Printer className="w-4 h-4" />
                    چاپ فاکتور
                </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs"><User className="w-3 h-3"/> مشتری</div>
                    <div className="font-bold text-sm">{order.billing.first_name} {order.billing.last_name}</div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs"><ShoppingBag className="w-3 h-3"/> وضعیت</div>
                    <div className="font-bold text-sm text-blue-600">
                        {order.status === 'processing' ? 'در حال پردازش' : order.status === 'on-hold' ? 'در انتظار بررسی' : order.status}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs"><CreditCard className="w-3 h-3"/> روش پرداخت</div>
                    <div className="font-bold text-sm">{order.payment_method_title}</div>
                </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500 text-xs"><Calendar className="w-3 h-3"/> تراکنش</div>
                    <div className="font-bold text-sm font-mono">{order.transaction_id || '---'}</div>
                </div>
            </div>

            {/* Items Table */}
            <div className="p-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-100 dark:border-gray-700">
                            <th className="text-right pb-3 font-normal">شرح محصول</th>
                            <th className="text-center pb-3 font-normal w-16">تعداد</th>
                            <th className="text-left pb-3 font-normal">قیمت کل</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {order.line_items.map(item => (
                            <tr key={item.id}>
                                <td className="py-4">{item.name}</td>
                                <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                                <td className="py-4 text-left font-bold">{formatPrice(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="bg-primary-50 dark:bg-primary-900/10 p-6 flex justify-between items-center">
                <span className="font-bold text-lg">مبلغ کل پرداخت شده</span>
                <div className="flex items-baseline gap-1 text-primary-700 dark:text-primary-400">
                    <span className="text-2xl font-black">{formatPrice(order.total)}</span>
                    <span className="text-sm">تومان</span>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-center gap-4 print:hidden">
            <Link to="/" className="flex items-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
                بازگشت به خانه
            </Link>
        </div>
    </div>
  );
};

export default OrderReceived;