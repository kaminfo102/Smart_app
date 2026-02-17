
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';
import { heroService } from '../../services/heroService';
import { HeroSlide } from '../../types';

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    setSlides(heroService.getSlides());
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="px-3 md:px-4">
        <div className="relative w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] overflow-hidden rounded-2xl md:rounded-3xl shadow-md">
            {slides.map((slide, index) => (
                <div 
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    ></div>
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r ${slide.bg} from-black/90 via-black/40 to-transparent opacity-80`}></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end md:justify-center items-start text-right">
                        <div className={`space-y-2 md:space-y-4 transition-all duration-700 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            
                            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold text-white mb-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span>{slide.subtitle}</span>
                            </div>
                            
                            <h1 className="text-xl md:text-4xl font-black text-white leading-tight">
                                {slide.title}
                            </h1>
                            
                            <p className="text-xs md:text-base text-gray-200 line-clamp-2 max-w-md">
                                {slide.desc}
                            </p>
                            
                            <Link to={slide.link} className="inline-flex items-center gap-1 bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all mt-2">
                                {slide.cta}
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {slides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    </section>
  );
};

export default HeroSlider;