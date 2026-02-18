
import { AppEvent } from '../types';
import { getWooConfig } from './wooService';

const CACHE_KEY = 'app_events_sql_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 Minutes Cache

interface SqlEvent {
    id: number;
    title: string;
    description: string;
    event_date: string;
    image: string;
    link: string;
    is_active: string | number; // SQL usually returns '1' or '0'
    sort_order: number;
}

export const eventService = {
  // 1. Synchronous Cache Access (Fast)
  getCachedEvents: (): AppEvent[] | null => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
          try {
              const parsedCache = JSON.parse(cached);
              // Return data regardless of expiry for "Stale" display, 
              // the component will revalidate immediately.
              return parsedCache.data; 
          } catch (e) {
              return null;
          }
      }
      return null;
  },

  // 2. Async Network Fetch (Fresh)
  getEvents: async (skipCache = false): Promise<AppEvent[]> => {
    // If cache is valid and we are not skipping, return it
    if (!skipCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsedCache = JSON.parse(cached);
            if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
                return parsedCache.data;
            }
        }
    }

    try {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/events?ts=${Date.now()}`); // Prevent browser caching
      
      if (!response.ok) throw new Error('API Error');
      
      const sqlData: SqlEvent[] = await response.json();
      
      if (Array.isArray(sqlData)) {
          const mappedEvents: AppEvent[] = sqlData.map(e => ({
              id: e.id,
              title: e.title,
              description: e.description,
              date: e.event_date,
              image: e.image,
              link: e.link,
              isActive: Number(e.is_active) === 1
          }));

          // Update Cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: mappedEvents,
              timestamp: Date.now()
          }));
          
          return mappedEvents;
      }
    } catch (e) {
      console.warn("Event Service Error", e);
      // Fallback to cache if network fails, even if expired
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached).data;
    }
    return [];
  },

  saveEvents: async (events: AppEvent[], token: string): Promise<AppEvent[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    const payload = events.map(e => ({
        title: e.title,
        description: e.description,
        date: e.date,
        image: e.image,
        link: e.link,
        isActive: e.isActive
    }));

    const response = await fetch(`${baseUrl}/wp-json/lms/v1/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('خطا در ذخیره رویدادها');

    // IMPORTANT: Fetch fresh data from server to get real IDs and ensure sync
    // We force skipCache to true
    return await eventService.getEvents(true);
  },

  setupDatabase: async (token: string): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/wp-json/lms/v1/setup-events`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('خطا در ساخت جدول رویدادها');
  }
};
