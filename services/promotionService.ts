import { Promotion } from '../types';
import { getWooConfig } from './wooService';

// Mock data for development/fallback
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    title: 'تخفیف ویژه دوره چرتکه',
    message: 'با ثبت نام در دوره پیشرفته چرتکه، ۲۰٪ تخفیف دریافت کنید. کد تخفیف: CHORTKEH20',
    image_url: 'https://picsum.photos/seed/abacus/800/600',
    link_url: '/store',
    delay_seconds: 2,
    duration_seconds: 10,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const promotionService = {
  getActivePromotions: async (): Promise<Promotion[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/promotions/active`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON response, using mock data');
        return MOCK_PROMOTIONS;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      // Fallback to mock data so the UI can be tested
      return MOCK_PROMOTIONS;
    }
  },

  getAllPromotions: async (token: string): Promise<Promotion[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/admin/promotions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON response, using mock data');
        return MOCK_PROMOTIONS;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all promotions:', error);
      return MOCK_PROMOTIONS;
    }
  },

  createPromotion: async (token: string, promotion: Promotion): Promise<Promotion> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/admin/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(promotion)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create promotion');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create Promotion Error:', error);
      throw error;
    }
  },

  updatePromotion: async (token: string, id: number, promotion: Promotion): Promise<Promotion> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/admin/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(promotion)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update promotion');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update Promotion Error:', error);
      throw error;
    }
  },

  deletePromotion: async (token: string, id: number): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }
    } catch (error) {
      console.error('Delete Promotion Error:', error);
      throw error;
    }
  },

  setupDatabase: async (token: string): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    try {
      const response = await fetch(`${baseUrl}/wp-json/lms/v1/setup-promotions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('خطا در ساخت جدول تبلیغات');
    } catch (error) {
      console.error('Setup Database Error:', error);
      throw error;
    }
  }
};
