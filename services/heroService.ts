import { HeroSlide } from '../types';

const STORAGE_KEY = 'hero_slides';

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
  getSlides: (): HeroSlide[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return DEFAULT_SLIDES;
  },
  saveSlides: (slides: HeroSlide[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  },
  addSlide: (slide: Omit<HeroSlide, 'id'>) => {
    const slides = heroService.getSlides();
    const newSlide = { ...slide, id: Date.now() };
    heroService.saveSlides([...slides, newSlide]);
    return newSlide;
  },
  updateSlide: (updatedSlide: HeroSlide) => {
    const slides = heroService.getSlides();
    const newSlides = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    heroService.saveSlides(newSlides);
  },
  deleteSlide: (id: number) => {
    const slides = heroService.getSlides();
    const newSlides = slides.filter(s => s.id !== id);
    heroService.saveSlides(newSlides);
  },
  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_SLIDES;
  }
};