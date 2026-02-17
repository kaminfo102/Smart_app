
import { DEFAULT_API_URL, DEFAULT_CONSUMER_KEY, DEFAULT_CONSUMER_SECRET } from '../constants';
import { Product, Category, Order, CreateOrderPayload, Post } from '../types';

const STORAGE_KEY = 'woo_config';

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
};

const getHeaders = (config: WooConfig) => {
    const auth = btoa(`${config.key}:${config.secret}`);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
    };
};

export const wooService = {
  getProducts: async (params: { category?: number; search?: string; min_price?: string; max_price?: string; orderby?: string; order?: string; tag?: number } = {}): Promise<Product[]> => {
    const config = getWooConfig();
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      const queryParams = new URLSearchParams({ per_page: '50' });
      if (params.category) queryParams.append('category', params.category.toString());
      if (params.tag) queryParams.append('tag', params.tag.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.min_price) queryParams.append('min_price', params.min_price);
      if (params.max_price) queryParams.append('max_price', params.max_price);
      if (params.orderby) queryParams.append('orderby', params.orderby);
      if (params.order) queryParams.append('order', params.order);

      const queryString = queryParams.toString();
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/products?${queryString}`, {
          headers: getHeaders(config)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
            const fallbackQuery = new URLSearchParams(queryParams);
            fallbackQuery.append('consumer_key', config.key);
            fallbackQuery.append('consumer_secret', config.secret);
            const retryResponse = await fetch(`${baseUrl}/wp-json/wc/v3/products?${fallbackQuery.toString()}`);
            if (!retryResponse.ok) throw new Error(`HTTP Error: ${retryResponse.status}`);
            return await retryResponse.json();
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error; 
    }
  },

  getProduct: async (id: number): Promise<Product> => {
    const config = getWooConfig();
    try {
        const baseUrl = config.url.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/wp-json/wc/v3/products/${id}`, { headers: getHeaders(config) });
        if (!response.ok) {
             if (response.status === 401) {
                 const retry = await fetch(`${baseUrl}/wp-json/wc/v3/products/${id}?consumer_key=${config.key}&consumer_secret=${config.secret}`);
                 if (!retry.ok) throw new Error('Product not found');
                 return await retry.json();
             }
             throw new Error('Product not found');
        }
        return await response.json();
    } catch (e) {
        console.error("Error fetching product:", e);
        throw e;
    }
  },

  // --- Product Management (Create/Update/Delete) ---

  createProduct: async (data: any): Promise<Product> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/products`, {
          method: 'POST',
          headers: getHeaders(config),
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Error creating product');
      }
      return await response.json();
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/products/${id}`, {
          method: 'PUT',
          headers: getHeaders(config),
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Error updating product');
      }
      return await response.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/products/${id}?force=true`, {
          method: 'DELETE',
          headers: getHeaders(config)
      });

      if (!response.ok) {
          throw new Error('Error deleting product');
      }
  },

  // --- Categories & Others ---

  getCategories: async (): Promise<Category[]> => {
    const config = getWooConfig();
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/products/categories?per_page=20&hide_empty=true`, { headers: getHeaders(config) });
      if (!response.ok) {
        if (response.status === 401) {
            const retryResponse = await fetch(`${baseUrl}/wp-json/wc/v3/products/categories?consumer_key=${config.key}&consumer_secret=${config.secret}&per_page=20&hide_empty=true`);
            if (!retryResponse.ok) throw new Error(`HTTP Error: ${retryResponse.status}`);
            return await retryResponse.json();
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getPosts: async (page: number = 1, per_page: number = 3): Promise<Post[]> => {
    const config = getWooConfig();
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      const endpoint = `${baseUrl}/wp-json/wp/v2/posts?per_page=${per_page}&page=${page}&_embed`;
      try {
        const response = await fetch(endpoint);
        if (response.ok) return await response.json();
      } catch (err) { console.warn("Direct post fetch failed."); }

      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
      const proxyResponse = await fetch(proxyUrl);
      if (proxyResponse.ok) return await proxyResponse.json();

      return [];
    } catch (e) { return []; }
  },

  getOrders: async (params: { customer?: number, per_page?: number, page?: number, status?: string } = {}): Promise<Order[]> => {
    const config = getWooConfig();
    try {
        const baseUrl = config.url.replace(/\/$/, '');
        let url = `${baseUrl}/wp-json/wc/v3/orders?per_page=${params.per_page || 20}`;
        if (params.page) url += `&page=${params.page}`;
        if (params.customer) url += `&customer=${params.customer}`;
        if (params.status) url += `&status=${params.status}`;

        const response = await fetch(url, { headers: getHeaders(config) });
        if (!response.ok) {
             if (response.status === 401) {
                 let retryUrl = `${baseUrl}/wp-json/wc/v3/orders?consumer_key=${config.key}&consumer_secret=${config.secret}&per_page=${params.per_page || 20}`;
                 if (params.page) retryUrl += `&page=${params.page}`;
                 if (params.customer) retryUrl += `&customer=${params.customer}`;
                 if (params.status) retryUrl += `&status=${params.status}`;
                 
                 const retry = await fetch(retryUrl);
                 if (!retry.ok) throw new Error('Error fetching orders');
                 return await retry.json();
             }
             throw new Error('Error fetching orders');
        }
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch orders", e);
        throw e;
    }
  },

  getOrder: async (id: number): Promise<Order | null> => {
      const config = getWooConfig();
      try {
          const baseUrl = config.url.replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${id}`, { headers: getHeaders(config) });
          if (!response.ok) {
              if (response.status === 401) {
                  const retry = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${id}?consumer_key=${config.key}&consumer_secret=${config.secret}`);
                  if (!retry.ok) throw new Error('Order not found');
                  return await retry.json();
              }
              throw new Error('Order not found');
          }
          return await response.json();
      } catch (e) { throw e; }
  },

  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/orders`, {
          method: 'POST',
          headers: getHeaders(config),
          body: JSON.stringify(orderData)
      });

      if (!response.ok) {
           if (response.status === 401) {
               const retry = await fetch(`${baseUrl}/wp-json/wc/v3/orders?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(orderData)
               });
               if (!retry.ok) {
                   const err = await retry.json();
                   throw new Error(err.message || 'خطا در ثبت سفارش');
               }
               return await retry.json();
           }
          const err = await response.json();
          throw new Error(err.message || 'خطا در ثبت سفارش');
      }
      return await response.json();
  },

  updateOrder: async (orderId: number, status: string): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'PUT',
        headers: getHeaders(config),
        body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            const retry = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!retry.ok) throw new Error('Failed to update order');
            return;
        }
        throw new Error('Failed to update order');
    }
  },

  createOrderNote: async (orderId: number, note: string): Promise<void> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}/notes`, {
          method: 'POST',
          headers: getHeaders(config),
          body: JSON.stringify({ note })
      });
      
      if (!response.ok) {
           if (response.status === 401) {
               const retry = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}/notes?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ note })
               });
               if (!retry.ok) throw new Error('Failed to add order note');
               return;
           }
           throw new Error('Failed to add order note');
      }
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}?force=true`, {
        method: 'DELETE',
        headers: getHeaders(config)
    });

    if (!response.ok) {
        if (response.status === 401) {
             const retry = await fetch(`${baseUrl}/wp-json/wc/v3/orders/${orderId}?consumer_key=${config.key}&consumer_secret=${config.secret}&force=true`, { method: 'DELETE' });
            if (!retry.ok) throw new Error('Failed to delete order');
            return;
        }
        throw new Error('Failed to delete order');
    }
  }
};
