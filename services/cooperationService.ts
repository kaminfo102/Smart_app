
import { CooperationRequest } from '../types';
import { getWooConfig } from './wooService';

export const cooperationService = {
    
    submitRequest: async (data: CooperationRequest): Promise<void> => {
        const config = getWooConfig();
        const baseUrl = config.url.replace(/\/$/, '');
        
        try {
            const response = await fetch(`${baseUrl}/wp-json/lms/v1/cooperation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'خطا در ثبت درخواست');
            }
        } catch (e: any) {
            console.error('Submit Cooperation Error:', e);
            throw new Error('خطا در ارتباط با سرور. لطفا اتصال اینترنت را بررسی کنید.');
        }
    },

    getRequests: async (token: string): Promise<CooperationRequest[]> => {
        const config = getWooConfig();
        const baseUrl = config.url.replace(/\/$/, '');

        try {
            const response = await fetch(`${baseUrl}/wp-json/lms/v1/cooperation`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('خطا در دریافت لیست درخواست‌ها');
            }

            return await response.json();
        } catch (e) {
            console.error('Get Cooperation Error:', e);
            return [];
        }
    },

    setupDatabase: async (token: string): Promise<void> => {
        const config = getWooConfig();
        const baseUrl = config.url.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/wp-json/lms/v1/setup-cooperation`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('خطا در ساخت جدول همکاری');
    }
};
