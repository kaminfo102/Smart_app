
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wooService } from '../services/wooService';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { formatPrice } from '../constants';
import { ShoppingCart, Star, ChevronLeft, Truck, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
        setLoading(true);
        window.scrollTo(0, 0);
        try {
            const data = await wooService.getProduct(parseInt(id));
            setProduct(data);
            setSelectedImage(0);
            setQuantity(1);

            // Fetch related if available
            if (data.related_ids && data.related_ids.length > 0) {
                 // Fetch first 4 related products. 
                 // Note: wooService.getProducts doesn't support 'include' param in current impl, 
                 // so we might just fetch by category as a fallback or update service. 
                 // For now, let's fetch by category of the current product
                 if (data.categories.length > 0) {
                     const related = await wooService.getProducts({ category: data.categories[0].id });
                     setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
                 }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
      if (product) {
          // Add loop for quantity
          for(let i=0; i<quantity; i++) {
              addToCart(product);
          }
      }
  };

  if (loading) {
      return (
          <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl h-[400px]"></div>
                  <div className="space-y-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  </div>
              </div>
          </div>
      );
  }

  if (!product) return <div className="text-center py-20 text-gray-500">محصول یافت نشد</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-20">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/store" className="hover:text-primary-600">فروشگاه</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link to="/store" className="hover:text-primary-600">{product.categories[0]?.name}</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-200 font-bold">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            
            {/* Gallery */}
            <div className="space-y-4">
                <div className="aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                    <img 
                        src={product.images[selectedImage]?.src} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.on_sale && <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">حراج ویژه</span>}
                </div>
                {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {product.images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedImage(idx)}
                                className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden ${selectedImage === idx ? 'border-primary-500' : 'border-transparent'}`}
                            >
                                <img src={img.src} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center text-yellow-400 gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{product.average_rating}</span>
                        <span className="text-xs text-gray-400">({product.rating_count} نظر)</span>
                    </div>
                    <div className="text-sm text-gray-400">کد محصول: <span className="font-mono">{product.sku || product.id}</span></div>
                </div>

                <div 
                    className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm md:text-base border-b border-gray-100 dark:border-gray-700 pb-6" 
                    dangerouslySetInnerHTML={{ __html: product.short_description }} 
                />

                <div className="mt-auto space-y-6">
                    <div className="flex flex-col">
                         {product.on_sale && product.regular_price && (
                            <div className="text-gray-400 line-through text-lg decoration-red-400 decoration-2">
                                {formatPrice(product.regular_price)}
                            </div>
                         )}
                         <div className="flex items-baseline gap-2">
                             <div className="text-4xl font-black text-primary-600 dark:text-primary-400">
                                 {formatPrice(product.price)}
                             </div>
                             <div className="text-gray-500 font-bold text-lg">تومان</div>
                         </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-2">
                             <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-lg font-bold hover:text-primary-600">-</button>
                             <span className="w-8 text-center font-bold">{quantity}</span>
                             <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-lg font-bold hover:text-primary-600">+</button>
                        </div>
                        <button 
                            onClick={handleAddToCart}
                            disabled={product.stock_status !== 'instock'}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary-500/30 transition-all active:scale-95 ${
                                product.stock_status === 'instock' 
                                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {product.stock_status === 'instock' ? 'افزودن به سبد خرید' : 'ناموجود'}
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 pt-4">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                            <Truck className="w-5 h-5 text-green-500" />
                            ارسال سریع به سراسر کشور
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            ضمانت اصالت و سلامت
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('desc')}
                    className={`pb-3 font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'desc' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                    توضیحات محصول
                </button>
                <button 
                    onClick={() => setActiveTab('specs')}
                    className={`pb-3 font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'specs' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                    مشخصات فنی
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 leading-relaxed text-gray-700 dark:text-gray-300">
                {activeTab === 'desc' && (
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
                {activeTab === 'specs' && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {product.attributes && product.attributes.length > 0 ? (
                            product.attributes.map(attr => (
                                <div key={attr.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="text-gray-500">{attr.name}</span>
                                    <span className="font-bold">{attr.options.join(', ')}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">مشخصات فنی خاصی ثبت نشده است.</p>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary-500" />
                    محصولات مرتبط
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        )}

    </div>
  );
};

export default ProductDetails;
