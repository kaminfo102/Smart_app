


export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  on_sale: boolean;
  images: { src: string; alt: string }[];
  description: string;
  short_description: string;
  categories: { id: number; name: string }[];
  stock_status: string;
  average_rating: string;
  rating_count: number;
  attributes?: {
      id: number;
      name: string;
      options: string[];
  }[];
  related_ids?: number[];
  sku?: string;
  meta_data?: { key: string; value: any }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  image?: { src: string };
  count: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface UserAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  roles?: string[]; 
  token?: string;
  billing?: UserAddress;
  shipping?: UserAddress;
  avatar_url?: string;
  points?: number;
  coins?: number; // Virtual currency
  province?: string;
  city?: string;
  representative_id?: number;
  instructor_id?: number; // Added: Link to instructor
  active_term_id?: number;
}

export interface OrderMetaData {
    id?: number;
    key: string;
    value: string;
}

export interface Order {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_id: number;
  billing: UserAddress;
  shipping: UserAddress;
  meta_data: OrderMetaData[];
  line_items: {
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
    price: number;
  }[];
}

export interface CreateOrderPayload {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: UserAddress;
    shipping: UserAddress;
    status?: string; // Added status field
    line_items: {
        product_id: number;
        quantity: number;
    }[];
    meta_data?: {
        key: string;
        value: string;
    }[];
    transaction_id?: string;
    customer_id?: number;
}

export interface Post {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface TrainingSession {
  id: string;
  date: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  mode: 'challenge' | 'practice';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  isCompleted: boolean;
  type: 'score' | 'questions' | 'streak';
}

export interface LeaderboardUser {
  id: number;
  username: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
  avatar_bg?: string;
}

// --- LMS Types ---

export interface Term {
    id: number;
    title: string;
    description: string;
    price: number;
    status: 'locked' | 'purchased_pending' | 'active' | 'completed' | 'rejected';
    image: string;
    lessons_count: number;
    required_score: number;
    lessons?: Lesson[]; // Added for editing purposes
}

export interface Lesson {
    id: number;
    term_id: number;
    title: string;
    type: 'theory' | 'video' | 'practice' | 'exam';
    content?: string; // HTML for theory
    video_url?: string;
    practice_config?: {
        target_count: number;
        allow_error: number;
        time_limit: number;
    };
    is_completed: boolean;
    score?: number;
    questions?: Question[]; // For exams
}

export interface Question {
    id: number;
    text: string;
    options: string[];
    correct_index: number;
}

// --- Hero Slider Type ---

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  bg: string;
  image: string;
  cta: string;
  link: string;
}

// --- Event Type ---
export interface AppEvent {
    id: number;
    title: string;
    description: string;
    date: string;
    image: string;
    link: string;
    isActive: boolean;
}
