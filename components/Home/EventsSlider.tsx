
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ArrowRight, Clock } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { AppEvent } from '../../types';

const EventsSlider: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
        const data = await eventService.getEvents();
        // Filter only active events
        setEvents(data.filter(e => e.isActive));
    };
    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="px-3 md:px-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                رویدادهای پیش‌رو
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Slider Container */}
        <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-6 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
            {events.map((event) => (
                <Link 
                    key={event.id}
                    to={event.link}
                    className="snap-center flex-none w-[280px] md:w-[320px] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 group hover:shadow-xl hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300"
                >
                    {/* Image Area */}
                    <div className="relative h-40 overflow-hidden">
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        
                        {/* Date Badge */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex flex-col items-center min-w-[50px]">
                            <span className="text-red-600 text-lg leading-none mb-0.5">{event.date.split(' ')[0]}</span>
                            <span className="text-[10px] text-gray-500">{event.date.split(' ').slice(1).join(' ')}</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col h-[160px]">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                            {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-grow">
                            {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ثبت نام محدود
                            </span>
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                مشاهده جزئیات
                                <ChevronLeft className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </section>
  );
};

export default EventsSlider;
