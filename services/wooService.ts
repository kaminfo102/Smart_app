
import { DEFAULT_API_URL, DEFAULT_CONSUMER_KEY, DEFAULT_CONSUMER_SECRET } from '../constants';
import { Product, Category, Order, CreateOrderPayload, Post } from '../types';

const STORAGE_KEY = 'woo_config';
const PRODUCTS_CACHE_KEY = 'woo_products_default_cache'; // New persistent cache

// --- Cache Configuration ---
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes RAM Cache
const cache = new Map<string, { data: any; expiry: number }>();
const pendingRequests = new Map<string, Promise<any>>();

interface WooConfig {
  url: string;
  key: string;
  secret: string;
}

export const getWooConfig = (): WooConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.url && parsed.key && parsed.secret) {
        return parsed;
    }
  }
  return {
    url: DEFAULT_API_URL,
    key: DEFAULT_CONSUMER_KEY,
    secret: DEFAULT_CONSUMER_SECRET
  };
};

export const saveWooConfig = (url: string, key: string, secret: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key, secret }));
  cache.clear(); 
  localStorage.removeItem(PRODUCTS_CACHE_KEY); // Clear product cache on config change
};

// --- Advanced Fetch Wrapper ---
interface RequestOptions extends RequestInit {
  skipCache?: boolean;
  params?: Record<string, string>;
  isWpApi?: boolean; 
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const config = getWooConfig();
  const baseUrl = config.url.replace(/\/$/, '');
  const apiPath = options.isWpApi ? '/wp-json/wp/v2' : '/wp-json/wc/v3';
  
  const urlObj = new URL(`${baseUrl}${apiPath}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value) urlObj.searchParams.append(key, value);
    });
  }

  const cacheKey = urlObj.toString();

  // RAM Cache
  if (!options.skipCache && (!options.method || options.method === 'GET')) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
  }

  if (!options.skipCache && (!options.method || options.method === 'GET')) {
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  const auth = btoa(`${config.key}:${config.secret}`);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
    ...options.headers,
  };

  const requestPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(urlObj.toString(), {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok && response.status === 401) {
        urlObj.searchParams.append('consumer_key', config.key);
        urlObj.searchParams.append('consumer_secret', config.secret);
        const retryResponse = await fetch(urlObj.toString(), {
            ...options,
            headers: { ...options.headers, 'Content-Type': 'application/json' }
        });
        if (!retryResponse.ok) throw new Error(`API Error: ${retryResponse.status}`);
        const data = await retryResponse.json();
        
        if (!options.skipCache && (!options.method || options.method === 'GET')) {
           cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
        }
        return data;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!options.skipCache && (!options.method || options.method === 'GET')) {
        cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
      }

      return data;
    } catch (error: any) {
       console.error(`Fetch Error [${endpoint}]:`, error);
       throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (!options.skipCache && (!options.method || options.method === 'GET')) {
    pendingRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
};

export const wooService = {
  clearCache: () => {
    cache.clear();
    pendingRequests.clear();
    localStorage.removeItem(PRODUCTS_CACHE_KEY);
  },

  // 1. Get Cached Products (LocalStorage Sync)
  getCachedProducts: (): Product[] | null => {
      const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cached) {
          try {
              const parsed = JSON.parse(cached);
              // Return regardless of expiry for SWR
              return parsed.data;
          } catch(e) { return null; }
      }
      return null;
  },

  getProducts: async (params: { category?: number; search?: string; min_price?: string; max_price?: string; orderby?: string; order?: string; tag?: number; per_page?: number } = {}): Promise<Product[]> => {
    const queryParams: Record<string, string> = {
        per_page: (params.per_page || 50).toString(),
        ...(params.category && { category: params.category.toString() }),
        ...(params.tag && { tag: params.tag.toString() }),
        ...(params.search && { search: params.search }),
        ...(params.min_price && { min_price: params.min_price }),
        ...(params.max_price && { max_price: params.max_price }),
        ...(params.orderby && { orderby: params.orderby }),
        ...(params.order && { order: params.order }),
    };

    const isDefaultQuery = !params.category && !params.search && !params.min_price && !params.max_price && (!params.orderby || params.orderby === 'date');

    const products = await request<Product[]>('/products', { params: queryParams });

    // Update Persistent Cache only for default view
    if (isDefaultQuery && products.length > 0) {
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
            data: products,
            timestamp: Date.now()
        }));
    }

    return products;
  },

  getProduct: async (id: number): Promise<Product> => {
    return request<Product>(`/products/${id}`);
  },

  createProduct: async (data: any): Promise<Product> => {
      return request<Product>('/products', { method: 'POST', body: JSON.stringify(data), skipCache: true });
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
      cache.delete(`${getWooConfig().url}/wp-json/wc/v3/products/${id}`); 
      return request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), skipCache: true });
  },

  deleteProduct: async (id: number): Promise<void> => {
      return request<void>(`/products/${id}`, { method: 'DELETE', params: { force: 'true' }, skipCache: true });
  },

  getCategories: async (): Promise<Category[]> => {
    return request<Category[]>('/products/categories', { 
        params: { per_page: '20', hide_empty: 'true' } 
    });
  },

  getPosts: async (page: number = 1, per_page: number = 3): Promise<Post[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    const endpoint = `${baseUrl}/wp-json/wp/v2/posts?per_page=${per_page}&page=${page}&_embed`;
    const cacheKey = `posts_${page}_${per_page}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) return cached.data;

    try {
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
            return data;
        }
    } catch (err) { /* Fallback */ }

    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (proxyResponse.ok) {
             const data = await proxyResponse.json();
             cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
             return data;
        }
    } catch (e) { return []; }
    return [];
  },

  getOrders: async (params: { customer?: number, per_page?: number, page?: number, status?: string } = {}): Promise<Order[]> => {
    const queryParams: Record<string, string> = {
        per_page: (params.per_page || 20).toString(),
        ...(params.page && { page: params.page.toString() }),
        ...(params.customer && { customer: params.customer.toString() }),
        ...(params.status && { status: params.status }),
    };
    return request<Order[]>('/orders', { params: queryParams, skipCache: true }); 
  },

  getOrder: async (id: number): Promise<Order> => {
      return request<Order>(`/orders/${id}`, { skipCache: true });
  },

  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
      return request<Order>('/orders', { 
          method: 'POST', 
          body: JSON.stringify(orderData), 
          skipCache: true 
      });
  },

  updateOrder: async (orderId: number, status: string): Promise<void> => {
    return request<void>(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        skipCache: true
    });
  },

  createOrderNote: async (orderId: number, note: string): Promise<void> => {
      return request<void>(`/orders/${orderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ note }),
          skipCache: true
      });
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    return request<void>(`/orders/${orderId}`, {
        method: 'DELETE',
        params: { force: 'true' },
        skipCache: true
    });
  }
};
