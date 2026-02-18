
import { HeroSlide } from '../types';
import { getWooConfig } from './wooService';

const CACHE_KEY = 'hero_slides_sql_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 Minutes Cache

// Mapping Interface for Backend SQL Structure
interface SqlSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    bg: string;
    image: string;
    cta_text: string;
    cta_link: string;
    sort_order: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
      id: 1,
      title: "نابغه کوچک خود را کشف کنید",
      subtitle: "آموزش چرتکه",
      desc: "افزایش تمرکز و خلاقیت فرزندتان",
      bg: "from-blue-600 to-indigo-800",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop", 
      cta: "شروع کنید",
      link: "/training"
    },
    {
      id: 2,
      title: "فروشگاه ابزار آموزشی",
      subtitle: "خرید آنلاین",
      desc: "بهترین چرتکه‌ها و کتاب‌های آموزشی",
      bg: "from-purple-600 to-pink-800",
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=2071&auto=format&fit=crop",
      cta: "خرید کنید",
      link: "/store"
    }
];

export const heroService = {
  // --- Public: Get Slides (Fast SQL Read) ---
  getSlides: async (): Promise<HeroSlide[]> => {
    // 1. Check Local Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache.data;
      }
    }

    // 2. Fetch from Custom WP SQL API
    try {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/slider`);
      
      if (!response.ok) throw new Error('Custom API not found or error');
      
      const sqlData: SqlSlide[] = await response.json();
      
      if (Array.isArray(sqlData) && sqlData.length > 0) {
          // Map SQL columns to App types
          const mappedSlides: HeroSlide[] = sqlData.map(s => ({
              id: s.id,
              title: s.title,
              subtitle: s.subtitle,
              desc: s.description, 
              bg: s.bg,
              image: s.image,
              cta: s.cta_text,
              link: s.cta_link
          }));

          // Update Cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: mappedSlides,
              timestamp: Date.now()
          }));
          
          return mappedSlides;
      }
    } catch (e) {
      // console.warn("Using default slides.", e);
    }

    // 3. Fallback
    return DEFAULT_SLIDES;
  },

  // --- Admin: Save Slides (Bulk SQL Insert) ---
  saveSlides: async (slides: HeroSlide[], token: string): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    // Map App types to SQL columns expected by PHP
    const payload = slides.map(s => ({
        title: s.title,
        subtitle: s.subtitle,
        description: s.desc,
        bg: s.bg,
        image: s.image,
        cta: s.cta,
        link: s.link
    }));

    const response = await fetch(`${baseUrl}/wp-json/lms/v1/slider`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `خطا در ذخیره سازی: ${response.status}`);
    }

    // Update Local Cache immediately
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: slides,
        timestamp: Date.now()
    }));
  },

  // --- Admin: Fix/Setup Database Table ---
  setupDatabase: async (token: string): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    const response = await fetch(`${baseUrl}/wp-json/lms/v1/setup`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('خطا در اجرای اسکریپت ساخت جدول');
    }
  },

  resetDefaults: (): HeroSlide[] => {
    localStorage.removeItem(CACHE_KEY);
    return DEFAULT_SLIDES;
  }
};
