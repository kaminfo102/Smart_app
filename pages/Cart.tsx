import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../constants';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold">سبد خرید شما خالی است</h2>
        <p className="text-gray-500">به نظر می‌رسد هنوز محصولی انتخاب نکرده‌اید.</p>
        <Link to="/" className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-colors">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-20">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-6">سبد خرید</h1>
        {cart.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex gap-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <img 
              src={item.images[0]?.src} 
              alt={item.name} 
              className="w-24 h-24 object-cover rounded-xl bg-gray-50 dark:bg-gray-700"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm md:text-base line-clamp-2">{item.name}</h3>
                <span className="text-xs text-gray-500 mt-1 block">{item.categories[0]?.name}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-md shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-md shadow-sm transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-left">
                   <p className="font-bold text-primary-600 dark:text-primary-400">
                     {formatPrice(Number(item.price) * item.quantity)} <span className="text-xs font-normal text-gray-500">تومان</span>
                   </p>
                </div>
              </div>
            </div>
            <button 
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500 self-start p-1"
            >
                <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        <button onClick={clearCart} className="text-red-500 text-sm flex items-center gap-1 hover:underline">
            <Trash2 className="w-4 h-4" />
            خالی کردن سبد خرید
        </button>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg">خلاصه سفارش</h3>
            
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between">
                    <span>مجموع اقلام</span>
                    <span>{cart.length} عدد</span>
                </div>
                <div className="flex justify-between">
                    <span>هزینه ارسال</span>
                    <span className="text-green-500">رایگان</span>
                </div>
            </div>

            <div className="flex justify-between items-center font-bold text-lg">
                <span>مبلغ قابل پرداخت</span>
                <div className="flex flex-col items-end">
                    <span>{formatPrice(cartTotal)}</span>
                    <span className="text-xs font-normal text-gray-500">تومان</span>
                </div>
            </div>

            <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <span>ادامه فرآیند خرید</span>
                <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                با کلیک بر روی دکمه، قوانین و مقررات فروشگاه دیجی‌نکست را می‌پذیرید.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;