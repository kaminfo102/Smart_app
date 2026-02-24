import React, { useState, useEffect } from 'react';
import { promotionService } from '../services/promotionService';
import { Promotion } from '../types';
import { X, ExternalLink } from 'lucide-react';

const PromotionDialog: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await promotionService.getActivePromotions();
        if (data && data.length > 0) {
          setPromotions(data);
        }
      } catch (error) {
        console.error('Failed to fetch promotions', error);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length === 0 || hasClosed) return;

    const currentPromo = promotions[currentPromoIndex];
    
    // Check if this promotion was already seen recently (e.g., in session storage)
    const seenPromos = JSON.parse(sessionStorage.getItem('seenPromos') || '[]');
    if (seenPromos.includes(currentPromo.id)) {
      // Move to next promo if available
      if (currentPromoIndex < promotions.length - 1) {
        setCurrentPromoIndex(prev => prev + 1);
      }
      return;
    }

    // Show promotion after delay
    const delayTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Mark as seen
      sessionStorage.setItem('seenPromos', JSON.stringify([...seenPromos, currentPromo.id]));

      // Hide after duration if set
      if (currentPromo.duration_seconds > 0) {
        setTimeout(() => {
          handleClose();
        }, currentPromo.duration_seconds * 1000);
      }
    }, currentPromo.delay_seconds * 1000);

    return () => clearTimeout(delayTimer);
  }, [promotions, currentPromoIndex, hasClosed]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Wait for exit animation, then check for next promo
    setTimeout(() => {
      if (currentPromoIndex < promotions.length - 1) {
        setCurrentPromoIndex(prev => prev + 1);
      } else {
        setHasClosed(true);
      }
    }, 300);
  };

  if (!isVisible || promotions.length === 0) return null;

  const promo = promotions[currentPromoIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>

        {promo.image_url && (
          <div className="w-full h-48 sm:h-56 relative">
            <img 
              src={promo.image_url} 
              alt={promo.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className={`p-6 sm:p-8 ${!promo.image_url ? 'pt-10' : ''}`}>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
            {promo.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
            {promo.message}
          </p>

          {promo.link_url && (
            <a 
              href={promo.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-600/20"
            >
              مشاهده پیشنهاد
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog;