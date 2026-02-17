
import { Term, Lesson, Question, User, UserAddress } from '../types';
import { wooService } from './wooService';

// We use a specific meta key to store the JSON structure of lessons within a WooCommerce Product
const LMS_CONTENT_KEY = '_lms_lessons_data';
const LMS_TERM_TAG = '_is_lms_term'; // We can use a tag or meta to identify Terms

export const lmsService = {
    // Fetches Products that act as Terms
    getTerms: async (): Promise<Term[]> => {
        try {
            // Fetch all products. In a real app, you might filter by category 'courses' or tag.
            // Here we fetch recent products and filter client side for safety in demo
            const products = await wooService.getProducts({ per_page: 50 } as any);
            
            // To check user status for each term, we would normally fetch user orders.
            const userOrders = await wooService.getOrders({ per_page: 100 }); 
            
            const terms: Term[] = products.filter((p: any) => {
                 const hasMeta = p.meta_data && p.meta_data.some((m: any) => m.key === LMS_CONTENT_KEY);
                 const isCourseCat = p.categories.some((c: any) => c.name.toLowerCase().includes('ترم') || c.name.toLowerCase().includes('course'));
                 return hasMeta || isCourseCat;
            }).map((p: any) => {
                
                // Parse Lessons Count from meta if possible
                const meta = p.meta_data.find((m: any) => m.key === LMS_CONTENT_KEY);
                let lessonsCount = 0;
                if (meta) {
                    try {
                        const parsed = JSON.parse(meta.value);
                        lessonsCount = parsed.length;
                    } catch(e) {}
                }

                // Determine Status based on Orders
                // Find all orders for this product, sort by ID descending to get the LATEST status
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

            return terms;
        } catch (e) {
            console.error("LMS getTerms error", e);
            return [];
        }
    },

    getTermLessons: async (termId: number): Promise<Lesson[]> => {
        try {
            const product = await wooService.getProduct(termId);
            const meta = product.meta_data?.find((m: any) => m.key === LMS_CONTENT_KEY);
            
            if (meta) {
                try {
                    // Start of JSON parse
                    // Clean the string if WP added slashes
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
        // Convert Term + Lessons into a WooCommerce Product Structure
        const productData = {
            name: termData.title,
            short_description: termData.description,
            regular_price: termData.price?.toString(),
            images: termData.image ? [{ src: termData.image }] : [],
            categories: [{ id: 999 }], // Ideally find/create 'Courses' category ID. Using placeholder or existing.
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
            // Update
            await wooService.updateProduct(termData.id, productData);
        } else {
            // Create
            await wooService.createProduct({ ...productData, type: 'simple', virtual: true });
        }
    },

    deleteTerm: async (termId: number): Promise<void> => {
        await wooService.deleteProduct(termId);
    },

    // Create a request (Order) for a term
    purchaseTerm: async (user: User, termId: number) => {
        try {
            // Ensure fallback data is valid for WooCommerce
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
                status: 'on-hold', // Explicitly set as on-hold (request pending)
                billing: defaultBilling,
                shipping: defaultBilling,
                line_items: [
                    {
                        product_id: termId,
                        quantity: 1
                    }
                ],
            });
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

    // Helper to get questions (now extracted from lesson object)
    getQuestions: (termId: number): Question[] => {
        return [];
    },

    getStudentsPendingActivation: async (): Promise<any[]> => {
        try {
            // Fetch orders with status 'on-hold' (manual request) or 'processing' (paid but not active)
            const orders = await wooService.getOrders({ status: 'on-hold,processing', per_page: 50 });
            
            // Map orders to a student request format
            return orders.map(order => {
                // Find first product in order (assuming it's a term)
                const termItem = order.line_items[0];
                const studentName = `${order.billing.first_name} ${order.billing.last_name}`.trim() || 'کاربر ناشناس';
                
                return {
                    id: order.id, // We use Order ID as the request ID
                    student_id: order.billing.email, 
                    customer_id: order.customer_id || 0, // Ensure customer_id is available
                    name: studentName,
                    term_id: termItem?.product_id,
                    term_title: termItem?.name || 'محصول نامشخص',
                    date: new Date(order.date_created).toLocaleDateString('fa-IR'),
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`,
                    status: order.status
                };
            }).filter(item => item.term_title !== 'محصول نامشخص'); // Basic filter
        } catch (e) {
            console.error("Error fetching pending students", e);
            return [];
        }
    },

    activateStudentTerm: async (orderId: number, instructorName?: string): Promise<void> => {
        // To activate, we simply complete the order. 
        await wooService.updateOrder(orderId, 'completed');
        
        // Add note to WordPress order
        if (instructorName) {
            await wooService.createOrderNote(orderId, `ترم توسط مربی ${instructorName} فعال شد.`);
        }
    },

    rejectStudentTerm: async (orderId: number, instructorName?: string): Promise<void> => {
        await wooService.updateOrder(orderId, 'cancelled');
        
        // Add note to WordPress order
        if (instructorName) {
            await wooService.createOrderNote(orderId, `درخواست توسط مربی ${instructorName} رد شد.`);
        }
    }
};
