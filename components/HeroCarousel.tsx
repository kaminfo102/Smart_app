import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { formatPrice } from '../constants';
import { ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

interface HeroCarouselProps {
  products: Product[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useStore();
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [products.length, nextSlide]);

  if (products.length === 0) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800 h-[500px] md:h-[400px] animate-pulse"></div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 h-[550px] md:h-[450px]">
      {/* Background blobs for visual interest */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8">
        
        {/* Text Content */}
        <div className="flex-1 space-y-6 text-center md:text-right z-10 max-w-lg flex flex-col items-center md:items-start">
          <div className="flex items-center justify-center md:justify-start gap-2">
             {currentProduct.on_sale && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    فروش ویژه
                </span>
             )}
             {currentProduct.categories?.[0] && (
                 <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
                    {currentProduct.categories[0].name}
                 </span>
             )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
            {currentProduct.name}
          </h2>

          <div 
            className="text-gray-500 dark:text-gray-400 text-sm md:text-base line-clamp-2"
            dangerouslySetInnerHTML={{ __html: currentProduct.short_description || currentProduct.description }} 
          />

          <div className="flex flex-col md:flex-row items-center gap-6 pt-4 justify-center md:justify-start w-full md:w-auto">
             <div className="flex flex-col items-center md:items-start">
                {currentProduct.on_sale && currentProduct.regular_price && (
                    <span className="text-gray-400 line-through text-sm">
                        {formatPrice(currentProduct.regular_price)}
                    </span>
                )}
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(currentProduct.price)}
                    </span>
                    <span className="text-gray-500 text-sm">تومان</span>
                </div>
             </div>

             <button 
                onClick={() => addToCart(currentProduct)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
             >
                <ShoppingCart className="w-5 h-5" />
                افزودن به سبد
             </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 relative w-full h-48 md:h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 rounded-full opacity-50 blur-2xl transform scale-75 pointer-events-none"></div>
            <img 
                key={currentProduct.id} 
                src={currentProduct.images[0]?.src} 
                alt={currentProduct.name}
                className="relative max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-700 hover:scale-105"
            />
        </div>
      </div>

      {/* Controls */}
      {products.length > 1 && (
          <>
            <button 
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all z-20"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all z-20"
            >
                <ArrowRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentIndex 
                            ? 'w-8 bg-primary-600' 
                            : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-primary-400'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
          </>
      )}
    </div>
  );
};

export default HeroCarousel;