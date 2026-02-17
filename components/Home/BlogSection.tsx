
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { wooService } from '../../services/wooService';
import { Post } from '../../types';

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch posts
    wooService.getPosts(1, 6).then(setPosts).catch(console.error);
  }, []);

  // Auto Scroll Logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const speed = 1; // px per tick
    let animationId: number;
    let direction = 1; // 1 = right to left (because of RTL), -1 = left to right

    const animate = () => {
        // In RTL, scrollLeft is negative or works differently depending on browser, 
        // but for simplicity in horizontal overflow, we manipulate scrollLeft.
        // For RTL layout, scrolling "forward" usually means decreasing scrollLeft (going more negative) 
        // or increasing if the browser normalizes it. 
        // Let's rely on standard scrollLeft behavior.
        
        if (scrollContainer) {
            // Check if we hit the end
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            
            // Auto scroll logic (simple loop)
            // Note: Handling RTL scroll programmatically can be tricky.
            // We'll increment scrollLeft. If it reaches max, we reset or reverse.
            
            // Simple method: Just increment and if max, reset to 0
            // But we want smooth pixel by pixel
        }
        // Actually, for a clean app feel, CSS scroll-snap is better, 
        // but user asked for "Automatic scroll".
        // Let's use a interval to scroll card by card every few seconds, which is more "App like"
    };
    
    // Changing strategy to "Slide every 3 seconds" instead of continuous marquee
    const interval = setInterval(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const cardWidth = 200; // Approx card width + gap
            const currentScroll = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            // RTL scroll calculation
            // In many browsers with dir=rtl, scrollLeft starts at 0 and goes negative.
            // Or starts at 0 (right) and goes positive (left) depends on implementation.
            // Safest is to scrollBy.
            
            // Check if we are at the end (leftmost side in RTL)
            // It's hard to detect end perfectly cross-browser in RTL.
            // Let's just scrollBy -200. If it doesn't move, we reset to 0.
            
            const prevScroll = container.scrollLeft;
            container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            
            // If we didn't move (reached end), reset to start (which is typically 0 or max positive in RTL)
            // Reset logic:
             setTimeout(() => {
                if (Math.abs(container.scrollLeft - prevScroll) < 5) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                }
             }, 500);

        }
    }, 3000);

    return () => clearInterval(interval);
  }, [posts]);

  return (
    <section className=" bg-white dark:bg-gray-900 py-4 mb-2 m-3 overflow-hidden rounded-2xl md:rounded-3xl shadow-md">
        <div className="container mx-auto px-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4">
                <h2 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white">تازه ها</h2>
                <Link to="/blog" className="text-xs text-primary-600 flex items-center gap-1 font-bold">
                    مشاهده همه
                    <ChevronLeft className="w-3 h-3" />
                </Link>
            </div>
            
            {/* Horizontal Scroll List */}
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {posts.length > 0 ? posts.map(post => (
                    <a 
                        key={post.id} 
                        href={post.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-none w-[140px] md:w-[180px] snap-start group"
                    >
                        {/* Image */}
                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gray-100 relative">
                            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                                <img 
                                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                                    alt={post.title.rendered} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed group-hover:text-primary-600 transition-colors" dangerouslySetInnerHTML={{__html: post.title.rendered}} />
                    </a>
                )) : (
                    // Skeletons
                    [1,2,3,4].map(i => (
                        <div key={i} className="flex-none w-[140px] md:w-[180px]">
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-2"></div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </section>
  );
};

export default BlogSection;
