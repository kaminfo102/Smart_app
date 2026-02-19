import { Product, Category } from './types';

// API Configuration
export const DEFAULT_API_URL = 'https://api.kurdkids.ir';
export const DEFAULT_CONSUMER_KEY = 'ck_e8b46a0bd487f3d3cb8266af7e5a3e40b9725b3a';
export const DEFAULT_CONSUMER_SECRET = 'cs_fdde7fac59842b8f75e422e8207500895adcbd1f';

export const formatPrice = (price: string | number) => {
  return Number(price).toLocaleString('fa-IR');
};
