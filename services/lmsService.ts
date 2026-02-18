
import { Term, Lesson, Question, User, UserAddress } from '../types';
import { wooService } from './wooService';

const LMS_CONTENT_KEY = '_lms_lessons_data';
const LMS_TERM_TAG = '_is_lms_term';
const CACHE_KEY_TERMS = 'lms_terms_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const lmsService = {
    // 1. Get Cached Terms (Sync)
    getCachedTerms: (): Term[] | null => {
        const cached = localStorage.getItem(CACHE_KEY_TERMS);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                return parsed.data;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // 2. Fetch Terms (Async with Skip Cache)
    getTerms: async (skipCache = false): Promise<Term[]> => {
        // Check cache first
        if (!skipCache) {
            const cached = localStorage.getItem(CACHE_KEY_TERMS);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                    return parsed.data;
                }
            }
        }

        try {
            // Fetch all products. 
            // Important: We bypass wooService cache here by using a custom param or skipCache if we implemented it there.
            // But wooService.getProducts caches by URL params. 
            const products = await wooService.getProducts({ per_page: 50 } as any);
            
            // To check user status for each term
            const userOrders = await wooService.getOrders({ per_page: 100 }); 
            
            const terms: Term[] = products.filter((p: any) => {
                 const hasMeta = p.meta_data && p.meta_data.some((m: any) => m.key === LMS_CONTENT_KEY);
                 const isCourseCat = p.categories.some((c: any) => c.name.toLowerCase().includes('ترم') || c.name.toLowerCase().includes('course'));
                 return hasMeta || isCourseCat;
            }).map((p: any) => {
                const meta = p.meta_data.find((m: any) => m.key === LMS_CONTENT_KEY);
                let lessonsCount = 0;
                if (meta) {
                    try {
                        const parsed = JSON.parse(meta.value);
                        lessonsCount = parsed.length;
                    } catch(e) {}
                }

                // Determine Status based on Orders
                const relatedOrders = userOrders.filter(o => 
                    o.line_items.some(item => item.product_id === p.id)
                ).sort((a, b) => b.id - a.id);

                const latestOrder = relatedOrders[0];

                let status: Term['status'] = 'locked';
                if (latestOrder) {
                    if (latestOrder.status === 'completed') {
                        status = 'active';
                    } else if (['processing', 'on-hold', 'pending'].includes(latestOrder.status)) {
                        status = 'purchased_pending';
                    } else if (['cancelled', 'failed', 'refunded'].includes(latestOrder.status)) {
                        status = 'rejected';
                    }
                }

                return {
                    id: p.id,
                    title: p.name,
                    description: p.short_description.replace(/<[^>]*>?/gm, ''), // Strip HTML
                    price: parseInt(p.price || '0'),
                    status: status,
                    image: p.images[0]?.src || '',
                    lessons_count: lessonsCount,
                    required_score: 70
                };
            });

            // Save to Cache
            localStorage.setItem(CACHE_KEY_TERMS, JSON.stringify({
                data: terms,
                timestamp: Date.now()
            }));

            return terms;
        } catch (e) {
            console.error("LMS getTerms error", e);
            // Return cached version if network fails
            const cached = localStorage.getItem(CACHE_KEY_TERMS);
            if (cached) return JSON.parse(cached).data;
            return [];
        }
    },

    getTermLessons: async (termId: number): Promise<Lesson[]> => {
        try {
            const product = await wooService.getProduct(termId);
            const meta = product.meta_data?.find((m: any) => m.key === LMS_CONTENT_KEY);
            
            if (meta) {
                try {
                    const jsonString = meta.value; 
                    const lessons: Lesson[] = JSON.parse(jsonString);
                    return lessons;
                } catch (e) {
                    console.error("Failed to parse lessons JSON", e);
                }
            }
            return [];
        } catch (e) {
            console.error("LMS getTermLessons error", e);
            return [];
        }
    },

    saveTerm: async (termData: Partial<Term>, lessons: Lesson[]): Promise<void> => {
        const productData = {
            name: termData.title,
            short_description: termData.description,
            regular_price: termData.price?.toString(),
            images: termData.image ? [{ src: termData.image }] : [],
            categories: [{ id: 999 }], 
            meta_data: [
                {
                    key: LMS_CONTENT_KEY,
                    value: JSON.stringify(lessons)
                },
                {
                    key: LMS_TERM_TAG,
                    value: 'yes'
                }
            ]
        };

        if (termData.id) {
            await wooService.updateProduct(termData.id, productData);
        } else {
            await wooService.createProduct({ ...productData, type: 'simple', virtual: true });
        }
        
        // Invalidate cache
        localStorage.removeItem(CACHE_KEY_TERMS);
    },

    deleteTerm: async (termId: number): Promise<void> => {
        await wooService.deleteProduct(termId);
        localStorage.removeItem(CACHE_KEY_TERMS);
    },

    purchaseTerm: async (user: User, termId: number) => {
        try {
            const billingData: Partial<UserAddress> = user.billing || {};
            const defaultBilling = {
                first_name: billingData.first_name || user.first_name || 'Student',
                last_name: billingData.last_name || user.last_name || 'User',
                email: billingData.email || user.email || `student${user.id}@example.com`,
                phone: billingData.phone || '09000000000',
                address_1: billingData.address_1 || 'LMS Request',
                city: billingData.city || 'Tehran',
                state: billingData.state || 'Tehran',
                postcode: billingData.postcode || '1111111111',
                country: billingData.country || 'IR'
            };

            await wooService.createOrder({
                customer_id: user.id,
                payment_method: 'cheque', 
                payment_method_title: 'درخواست فعالسازی دستی ترم',
                set_paid: false,
                status: 'on-hold', 
                billing: defaultBilling,
                shipping: defaultBilling,
                line_items: [
                    {
                        product_id: termId,
                        quantity: 1
                    }
                ],
            });
            // Force refresh of terms next time to show updated status
            localStorage.removeItem(CACHE_KEY_TERMS);
        } catch (e) {
            console.error("Failed to purchase term", e);
            throw e;
        }
    },

    completeLesson: (lessonId: number, score: number = 100) => {
        const progress = JSON.parse(localStorage.getItem('lms_progress') || '{}');
        progress[lessonId] = { completed: true, score };
        localStorage.setItem('lms_progress', JSON.stringify(progress));
    },

    getQuestions: (termId: number): Question[] => {
        return [];
    },

    getStudentsPendingActivation: async (): Promise<any[]> => {
        try {
            const orders = await wooService.getOrders({ status: 'on-hold,processing', per_page: 50 });
            return orders.map(order => {
                const termItem = order.line_items[0];
                const studentName = `${order.billing.first_name} ${order.billing.last_name}`.trim() || 'کاربر ناشناس';
                
                return {
                    id: order.id, 
                    student_id: order.billing.email, 
                    customer_id: order.customer_id || 0,
                    name: studentName,
                    term_id: termItem?.product_id,
                    term_title: termItem?.name || 'محصول نامشخص',
                    date: new Date(order.date_created).toLocaleDateString('fa-IR'),
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`,
                    status: order.status
                };
            }).filter(item => item.term_title !== 'محصول نامشخص'); 
        } catch (e) {
            console.error("Error fetching pending students", e);
            return [];
        }
    },

    activateStudentTerm: async (orderId: number, instructorName?: string): Promise<void> => {
        await wooService.updateOrder(orderId, 'completed');
        if (instructorName) {
            await wooService.createOrderNote(orderId, `ترم توسط مربی ${instructorName} فعال شد.`);
        }
    },

    rejectStudentTerm: async (orderId: number, instructorName?: string): Promise<void> => {
        await wooService.updateOrder(orderId, 'cancelled');
        if (instructorName) {
            await wooService.createOrderNote(orderId, `درخواست توسط مربی ${instructorName} رد شد.`);
        }
    }
};
