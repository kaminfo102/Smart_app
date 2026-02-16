import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import { wooService } from '../services/wooService';
import { CreateOrderPayload, UserAddress } from '../types';
import { formatPrice } from '../constants';
import { MapPin, CreditCard, Wallet, Upload, CheckCircle, ArrowLeft, Loader2, AlertTriangle, FileText } from 'lucide-react';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();

  // Steps: 'billing' -> 'payment' -> 'bank_info' (optional) -> 'processing'
  const [step, setStep] = useState<'billing' | 'payment' | 'bank_info'>('billing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Billing State
  const [billing, setBilling] = useState<UserAddress>({
      first_name: '', last_name: '', address_1: '', city: '', state: '', postcode: '', country: 'IR', phone: '', email: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bacs' | 'online'>('online');
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Auth Redirect & Initial Data
  useEffect(() => {
    if (!user) {
        // Save cart intention? For now just redirect
        navigate('/login?redirect=/checkout');
        return;
    }

    // Prefill billing if available
    if (user.billing) {
        setBilling({
            ...user.billing,
            first_name: user.billing.first_name || user.first_name || '',
            last_name: user.billing.last_name || user.last_name || '',
            email: user.billing.email || user.email || ''
        });
    } else {
        setBilling(prev => ({
            ...prev,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || ''
        }));
    }
  }, [user, navigate]);

  if (!user || cart.length === 0) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setReceiptImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmitOrder = async () => {
      setLoading(true);
      setError(null);

      try {
          const payload: CreateOrderPayload = {
              payment_method: paymentMethod,
              payment_method_title: paymentMethod === 'bacs' ? 'کارت به کارت' : 'پرداخت آنلاین',
              set_paid: paymentMethod === 'online', // Mark as paid if online (simulated)
              billing: billing,
              shipping: billing, // Use same for shipping
              customer_id: user.id,
              line_items: cart.map(item => ({
                  product_id: item.id,
                  quantity: item.quantity
              })),
              meta_data: []
          };

          // Add metadata for Bank Transfer
          if (paymentMethod === 'bacs') {
              if (transactionId) payload.transaction_id = transactionId;
              if (receiptImage) {
                  payload.meta_data?.push({
                      key: '_receipt_image_base64',
                      value: receiptImage // Storing base64 directly (simplified for frontend-only demo)
                  });
              }
          }

          const order = await wooService.createOrder(payload);
          clearCart();
          navigate(`/order-received/${order.id}`);

      } catch (err: any) {
          setError(err.message || 'خطا در ثبت سفارش');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 px-4">
          <div className={`flex flex-col items-center ${step === 'billing' ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step === 'billing' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>1</div>
              <span className="text-xs">اطلاعات ارسال</span>
          </div>
          <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <div className={`flex flex-col items-center ${step === 'payment' || step === 'bank_info' ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step === 'payment' || step === 'bank_info' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>2</div>
              <span className="text-xs">پرداخت</span>
          </div>
          <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <div className="flex flex-col items-center text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-1">3</div>
              <span className="text-xs">اتمام</span>
          </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4">
          <div className="md:col-span-2">
            
            {/* Step 1: Billing Address */}
            {step === 'billing' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <MapPin className="text-primary-500" />
                        <h2 className="font-bold text-lg">آدرس تحویل سفارش</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="نام" value={billing.first_name} onChange={e => setBilling({...billing, first_name: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none" />
                        <input type="text" placeholder="نام خانوادگی" value={billing.last_name} onChange={e => setBilling({...billing, last_name: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="استان" value={billing.state} onChange={e => setBilling({...billing, state: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none" />
                         <input type="text" placeholder="شهر" value={billing.city} onChange={e => setBilling({...billing, city: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <textarea placeholder="آدرس دقیق پستی" rows={3} value={billing.address_1} onChange={e => setBilling({...billing, address_1: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none resize-none" />
                    <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="کد پستی" value={billing.postcode} onChange={e => setBilling({...billing, postcode: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                         <input type="tel" placeholder="شماره موبایل" value={billing.phone} onChange={e => setBilling({...billing, phone: e.target.value})} className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none dir-ltr text-right" />
                    </div>

                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={() => {
                                if(!billing.address_1 || !billing.phone || !billing.city) return alert('لطفا فیلدهای ضروری (آدرس، شهر، موبایل) را پر کنید');
                                setStep('payment');
                            }}
                            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                            ادامه به پرداخت
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 'payment' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <Wallet className="text-primary-500" />
                        <h2 className="font-bold text-lg">شیوه پرداخت</h2>
                    </div>

                    <div className="space-y-4">
                        <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-700'}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 text-primary-600" />
                            <div className="mr-4 flex-1">
                                <div className="font-bold">پرداخت آنلاین</div>
                                <div className="text-xs text-gray-500 mt-1">پرداخت امن با کلیه کارت‌های عضو شتاب</div>
                            </div>
                            <CreditCard className="w-6 h-6 text-gray-400" />
                        </label>

                        <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bacs' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-700'}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'bacs'} onChange={() => setPaymentMethod('bacs')} className="w-5 h-5 text-primary-600" />
                            <div className="mr-4 flex-1">
                                <div className="font-bold">کارت به کارت (واریز به حساب)</div>
                                <div className="text-xs text-gray-500 mt-1">ثبت فیش واریزی در مرحله بعد</div>
                            </div>
                            <FileText className="w-6 h-6 text-gray-400" />
                        </label>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep('billing')} className="text-gray-500 px-4 py-2 rounded-xl">بازگشت</button>
                        <button 
                            onClick={() => {
                                if (paymentMethod === 'bacs') setStep('bank_info');
                                else handleSubmitOrder();
                            }}
                            disabled={loading}
                            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (paymentMethod === 'online' ? 'پرداخت و تکمیل خرید' : 'ادامه مراحل')}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Bank Transfer Info */}
            {step === 'bank_info' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-right-4">
                     <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <CreditCard className="text-yellow-500" />
                        <h2 className="font-bold text-lg">اطلاعات واریز</h2>
                    </div>
                    
                    {/* Bank Account Guide */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm space-y-2">
                        <div className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            راهنمای پرداخت
                        </div>
                        <p>لطفا مبلغ سفارش را به شماره کارت زیر واریز نمایید و سپس اطلاعات تراکنش را وارد کنید.</p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-3 bg-white dark:bg-gray-900 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                             <div>
                                <span className="text-gray-500 text-xs block">شماره کارت:</span>
                                <span className="font-mono font-bold text-lg tracking-widest">6037-9971-0000-0000</span>
                             </div>
                             <div>
                                <span className="text-gray-500 text-xs block">نام صاحب حساب:</span>
                                <span className="font-bold">فروشگاه دیجی‌نکست</span>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">کد رهگیری تراکنش</label>
                            <input 
                                type="text" 
                                value={transactionId} 
                                onChange={e => setTransactionId(e.target.value)}
                                placeholder="مثلا: 14028899"
                                className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 outline-none font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold">تصویر رسید پرداخت</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer relative">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {receiptImage ? (
                                    <div className="relative w-full h-40">
                                        <img src={receiptImage} alt="receipt" className="w-full h-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold rounded-lg opacity-0 hover:opacity-100 transition-opacity">تغییر تصویر</div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="text-sm">برای آپلود تصویر کلیک کنید</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep('payment')} className="text-gray-500 px-4 py-2 rounded-xl">بازگشت</button>
                        <button 
                            onClick={handleSubmitOrder}
                            disabled={loading || !transactionId}
                            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ثبت نهایی سفارش'}
                        </button>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

          </div>

          {/* Sidebar Summary */}
          <div className="md:col-span-1">
               <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                   <h3 className="font-bold text-lg mb-4">خلاصه سفارش</h3>
                   <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                       {cart.map(item => (
                           <div key={item.id} className="flex gap-3">
                               <img src={item.images[0]?.src} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                               <div className="flex-1">
                                   <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                                   <div className="text-xs text-gray-500">{item.quantity} عدد</div>
                               </div>
                               <div className="text-sm font-bold">{formatPrice(Number(item.price) * item.quantity)}</div>
                           </div>
                       ))}
                   </div>
                   <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                       <span className="font-bold">مبلغ قابل پرداخت</span>
                       <div className="text-xl font-bold text-primary-600">{formatPrice(cartTotal)} <span className="text-xs text-gray-500">تومان</span></div>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default Checkout;