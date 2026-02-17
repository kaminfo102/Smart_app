
import { getWooConfig } from './wooService';
import { User, TrainingSession } from '../types';

const HISTORY_KEY = 'abacus_training_history';

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    const config = getWooConfig();

    // Real WordPress Login
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      
      // Step 1: Get Token
      const tokenResponse = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenResponse.ok) {
        let errorMessage = 'خطا در ورود به سیستم';
        try {
            const errData = await tokenResponse.json();
            errorMessage = errData.message || errorMessage;
        } catch (e) {
            errorMessage = `خطا: ${tokenResponse.status} ${tokenResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.token;

      // Step 2: Get User Basic Details
      const userResponse = await fetch(`${baseUrl}/wp-json/wp/v2/users/me?context=edit`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!userResponse.ok) {
        return {
          id: 0,
          username: tokenData.user_display_name || username,
          email: tokenData.user_email || '',
          display_name: tokenData.user_display_name || username,
          roles: ['customer'],
          token: token,
          points: 0
        };
      }

      const userData = await userResponse.json();
      
      let user: User = {
        id: userData.id,
        username: userData.slug,
        email: userData.email || '',
        display_name: userData.name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        roles: userData.roles || ['customer'],
        avatar_url: userData.avatar_urls?.[96],
        token: token,
        points: 0
      };

      // Step 3: Try to fetch detailed Customer data from WooCommerce
      if (config.key && config.secret) {
        try {
          const customerResponse = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${userData.id}?consumer_key=${config.key}&consumer_secret=${config.secret}`);
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            user.billing = customerData.billing;
            user.shipping = customerData.shipping;
            user.first_name = customerData.first_name;
            user.last_name = customerData.last_name;
            user.username = customerData.username;
            user.email = customerData.email;
            
            // Extract Points and Instructor from meta_data
            const pointsMeta = customerData.meta_data.find((m: any) => m.key === 'abacus_points');
            user.points = pointsMeta ? parseInt(pointsMeta.value) : 0;

            const instructorMeta = customerData.meta_data.find((m: any) => m.key === 'instructor_id');
            user.instructor_id = instructorMeta ? parseInt(instructorMeta.value) : undefined;
          }
        } catch (e) {
          console.warn('Could not fetch WooCommerce customer data', e);
        }
      }

      return user;

    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.message === 'Failed to fetch') {
           throw new Error('خطا در برقراری ارتباط با سرور. لطفا آدرس سایت و اتصال اینترنت را بررسی کنید.');
      }
      throw new Error(error.message || 'خطا در برقراری ارتباط با سرور');
    }
  },

  register: async (data: { email: string; username: string; password: string; firstName?: string; lastName?: string; mobile?: string }): Promise<void> => {
    const config = getWooConfig();
    
    if (config.key && config.secret) {
      const baseUrl = config.url.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          billing: {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.mobile
          },
          shipping: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.mobile
          },
          meta_data: [
              { key: 'abacus_points', value: '0' }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'خطا در ثبت نام');
      }
      return;
    } 
    throw new Error('برای ثبت نام باید کلیدهای API ووکامرس در تنظیمات وارد شده باشند.');
  },

  updateProfile: async (user: User, data: any): Promise<User> => {
    const config = getWooConfig();

    try {
        const baseUrl = config.url.replace(/\/$/, '');
        let updatedUser = { ...user };

        if (config.key && config.secret) {
             const wooBody: any = {};
             if (data.firstName) wooBody.first_name = data.firstName;
             if (data.lastName) wooBody.last_name = data.lastName;
             if (data.email) wooBody.email = data.email;
             if (data.password) wooBody.password = data.password;
             if (data.billing) wooBody.billing = data.billing;
             if (data.shipping) wooBody.shipping = data.shipping;

             const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${user.id}?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wooBody)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'خطا در بروزرسانی اطلاعات مشتری');
            }
            
            const customerData = await response.json();
            updatedUser = {
                ...updatedUser,
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                email: customerData.email,
                billing: customerData.billing,
                shipping: customerData.shipping,
                display_name: `${customerData.first_name} ${customerData.last_name}`.trim() || user.display_name
            };
        } else {
            const body: any = {};
            if (data.email) body.email = data.email;
            if (data.firstName) body.first_name = data.firstName;
            if (data.lastName) body.last_name = data.lastName;
            if (data.password) body.password = data.password;
            
            const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'خطا در بروزرسانی اطلاعات');
            }

            const wpData = await response.json();
            updatedUser = {
                 ...updatedUser,
                 email: wpData.email,
                 first_name: wpData.first_name,
                 last_name: wpData.last_name,
                 display_name: wpData.name
            };
        }
        return updatedUser;
    } catch (error: any) {
        throw new Error(error.message || 'خطا در ارتباط با سرور');
    }
  },

  updateUserPoints: async (user: User, newTotalPoints: number): Promise<User> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    // Optimistically update local user
    const updatedUser = { ...user, points: newTotalPoints };

    if (config.key && config.secret) {
        try {
            const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${user.id}?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meta_data: [
                        { key: 'abacus_points', value: String(newTotalPoints) }
                    ]
                })
            });
            
            if (!response.ok) {
                console.error("Server refused points update");
            }
        } catch (e) {
            console.error("Failed to sync points", e);
        }
    }
    return updatedUser;
  },

  // --- Training History ---
  saveTrainingSession: (session: TrainingSession) => {
    const history = authService.getTrainingHistory();
    history.unshift(session);
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  },

  getTrainingHistory: (): TrainingSession[] => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // --- Admin Functions ---

  getAllUsers: async (user: User): Promise<User[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    try {
        const response = await fetch(`${baseUrl}/wp-json/wp/v2/users?context=edit&per_page=100`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (!response.ok) {
             throw new Error(`Error ${response.status}: Failed to fetch users`);
        }
        
        const data = await response.json();
        return data.map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            display_name: u.name,
            first_name: u.first_name,
            last_name: u.last_name,
            roles: u.roles,
            avatar_url: u.avatar_urls?.[96]
        }));
    } catch (e: any) {
        console.error("getAllUsers error:", e);
        throw new Error(e.message || 'خطا در دریافت لیست کاربران');
    }
  },

  // Fetch Customers with details (metadata) via Woo API
  getCustomers: async (): Promise<User[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    
    try {
        // Use role=all to ensure we get custom roles like 'student' if they are considered customers
        const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers?per_page=100&role=all&consumer_key=${config.key}&consumer_secret=${config.secret}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const data = await response.json();
        return data.map((c: any) => {
            const instructorMeta = c.meta_data.find((m: any) => m.key === 'instructor_id');
            const roles = c.role ? [c.role] : [];
            return {
                id: c.id,
                username: c.username,
                email: c.email,
                display_name: `${c.first_name} ${c.last_name}`.trim() || c.username,
                first_name: c.first_name,
                last_name: c.last_name,
                roles: roles,
                avatar_url: c.avatar_url,
                instructor_id: instructorMeta ? parseInt(instructorMeta.value) : undefined
            };
        });
    } catch(e) {
        console.error(e);
        return [];
    }
  },

  getLeaderboard: async (): Promise<any[]> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    if (!config.key || !config.secret) return [];

    try {
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers?consumer_key=${config.key}&consumer_secret=${config.secret}&per_page=50&role=all`, {
          method: 'GET'
      });

      if (!response.ok) return [];

      const customers = await response.json();
      
      const leaderboard = customers.map((c: any) => {
          const pointsMeta = c.meta_data.find((m: any) => m.key === 'abacus_points');
          const points = pointsMeta ? parseInt(pointsMeta.value) : 0;
          return {
              id: c.id,
              username: c.username,
              display_name: `${c.first_name} ${c.last_name}`.trim() || c.username,
              points: points,
              avatar_url: c.avatar_url
          };
      });

      return leaderboard.sort((a: any, b: any) => b.points - a.points).slice(0, 10);

    } catch (e) {
      console.error("Leaderboard fetch error:", e);
      return [];
    }
  },

  createUser: async (currentUser: User, newUser: any, metaData?: any[]): Promise<void> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      
      // If we have API keys and we are creating a customer/student or need meta, prefer Woo API
      if (config.key && config.secret && (newUser.role === 'customer' || newUser.role === 'student' || metaData)) {
          const body: any = {
              username: newUser.username,
              email: newUser.email,
              password: newUser.password,
              first_name: newUser.firstName,
              last_name: newUser.lastName,
              role: newUser.roles ? newUser.roles[0] : (newUser.role || 'customer'),
              meta_data: metaData || []
          };

          const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'خطا در ایجاد کاربر');
          }
      } else {
          // Fallback to WP User API
          const response = await fetch(`${baseUrl}/wp-json/wp/v2/users`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${currentUser.token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(newUser)
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'خطا در ایجاد کاربر');
          }
      }
  },

  updateUserRole: async (currentUser: User, targetUserId: number, roles: string[]): Promise<void> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/${targetUserId}`, {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roles })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'خطا در ویرایش نقش کاربر');
      }
  },

  assignInstructor: async (studentId: number, instructorId: number | null): Promise<void> => {
      const config = getWooConfig();
      const baseUrl = config.url.replace(/\/$/, '');
      
      const response = await fetch(`${baseUrl}/wp-json/wc/v3/customers/${studentId}?consumer_key=${config.key}&consumer_secret=${config.secret}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              meta_data: [
                  { key: 'instructor_id', value: instructorId ? String(instructorId) : '' }
              ]
          })
      });

      if (!response.ok) throw new Error('خطا در تخصیص مربی');
  },

  deleteUser: async (user: User, deleteId: number): Promise<void> => {
    const config = getWooConfig();
    const baseUrl = config.url.replace(/\/$/, '');
    try {
        const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/${deleteId}?force=true&reassign=1`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!response.ok) throw new Error('Failed to delete user');
    } catch (e: any) {
        console.error("deleteUser error:", e);
        throw new Error(e.message || 'خطا در حذف کاربر');
    }
  },

  logout: () => {
    localStorage.removeItem('auth_user');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }
};
