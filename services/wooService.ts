
import { DEFAULT_API_URL, DEFAULT_CONSUMER_KEY, DEFAULT_CONSUMER_SECRET } from '../constants';
import { Product, Category, Order, CreateOrderPayload, Post } from '../types';

const STORAGE_KEY = 'woo_config';

// --- Cache Configuration ---
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes Cache Time
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
  cache.clear(); // Clear cache on config change
};

// --- Advanced Fetch Wrapper ---
interface RequestOptions extends RequestInit {
  skipCache?: boolean;
  params?: Record<string, string>;
  isWpApi?: boolean; // Toggle between WC and WP API
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const config = getWooConfig();
  const baseUrl = config.url.replace(/\/$/, '');
  const apiPath = options.isWpApi ? '/wp-json/wp/v2' : '/wp-json/wc/v3';
  
  // Construct URL with Params
  const urlObj = new URL(`${baseUrl}${apiPath}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value) urlObj.searchParams.append(key, value);
    });
  }

  // Generate Cache Key (URL + Params)
  const cacheKey = urlObj.toString();

  // 1. Check Cache (GET requests only)
  if (!options.skipCache && (!options.method || options.method === 'GET')) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      // console.log('🚀 Serving from Cache:', endpoint);
      return cached.data;
    }
  }

  // 2. Request Deduplication (Prevent double fetching same resource)
  if (!options.skipCache && (!options.method || options.method === 'GET')) {
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  // Auth Headers
  const auth = btoa(`${config.key}:${config.secret}`);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
    ...options.headers,
  };

  // Create Promise
  const requestPromise = (async () => {
    try {
      // Add Timeout functionality (Professional Touch)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(urlObj.toString(), {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle Retry for 401 (Fallback to query params auth)
      if (!response.ok && response.status === 401) {
        urlObj.searchParams.append('consumer_key', config.key);
        urlObj.searchParams.append('consumer_secret', config.secret);
        const retryResponse = await fetch(urlObj.toString(), {
            ...options,
            headers: { ...options.headers, 'Content-Type': 'application/json' } // Remove Basic Auth header
        });
        if (!retryResponse.ok) throw new Error(`API Error: ${retryResponse.status}`);
        const data = await retryResponse.json();
        
        // Cache result
        if (!options.skipCache && (!options.method || options.method === 'GET')) {
           cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
        }
        return data;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache result
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

// --- Service Methods ---

export const wooService = {
  // Manual Cache Invalidation
  clearCache: () => {
    cache.clear();
    pendingRequests.clear();
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

    return request<Product[]>('/products', { params: queryParams });
  },

  getProduct: async (id: number): Promise<Product> => {
    return request<Product>(`/products/${id}`);
  },

  createProduct: async (data: any): Promise<Product> => {
      return request<Product>('/products', { method: 'POST', body: JSON.stringify(data), skipCache: true });
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
      // Invalidate specific product cache and products list potentially
      cache.delete(`${getWooConfig().url}/wp-json/wc/v3/products/${id}`); 
      // Note: Invalidating list caches is harder without regex, typically we just let them expire or use a state manager.
      
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

  // Note: Posts often need external proxy if CORS is an issue on WP API.
  // We keep the proxy logic but wrap it nicely.
  getPosts: async (page: number = 1, per_page: number = 3): Promise<Post[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    const endpoint = `${baseUrl}/wp-json/wp/v2/posts?per_page=${per_page}&page=${page}&_embed`;
    const cacheKey = `posts_${page}_${per_page}`;

    // Check Cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) return cached.data;

    try {
        // Try Direct
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
            return data;
        }
    } catch (err) { /* Fallback */ }

    // Fallback Proxy
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

    // Important: Orders should usually NOT be cached long-term or skipCache should be true if we need realtime.
    // We'll allow short caching but maybe we want to skip it for admin panels often.
    // For now, let's cache but with the understanding that 'createOrder' should ideally invalidate.
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
