
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
  getEvents: async (): Promise<AppEvent[]> => {
    // 1. Check Local Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache.data;
      }
    }

    try {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/events`);
      
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

          localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: mappedEvents,
              timestamp: Date.now()
          }));
          
          return mappedEvents;
      }
    } catch (e) {
      console.warn("Event Service Error", e);
    }
    return [];
  },

  saveEvents: async (events: AppEvent[], token: string): Promise<void> => {
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

    // Update Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: events,
        timestamp: Date.now()
    }));
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
