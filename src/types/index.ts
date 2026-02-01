// ============================================
// User & Authentication Types
// ============================================
export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  restaurantId: string;
  name: string;
  role: "admin" | "superadmin";
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  restaurantId: string;
  role: "admin" | "superadmin";
}

// ============================================
// API Response Types
// ============================================
export type ApiStatus = 'success' | 'error';

export interface BaseApiResponse {
  status: ApiStatus;
  message?: string;
}

export interface SuccessResponse<T> extends BaseApiResponse {
  status: 'success';
  data: T;
}

export interface ErrorResponse extends BaseApiResponse {
  status: 'error';
  message: string;
  data?: never;
}

// Generic API Response (for backward compatibility)
export interface ApiResponse<T = any> {
  status: ApiStatus;
  message?: string;
  data?: T;
}

// Specific response types
export type CategoryResponse = SuccessResponse<Category> | ErrorResponse;
export type CategoriesResponse = SuccessResponse<{ categoriesData: Category[] }> | ErrorResponse;
export type RestaurantUpdateResponse = SuccessResponse<{ message: string }> | ErrorResponse;
export type LoginResponse = SuccessResponse<{ token: string }> | ErrorResponse;
export type PasswordChangeResponse = SuccessResponse<{ token: string }> | ErrorResponse;

// ============================================
// Cache Types
// ============================================
export interface TimestampedData {
  timestamp: number;
  expiresAt?: number;
}

export interface RestaurantCacheData extends TimestampedData {
  restaurantData: Restaurant;
  menuData: Dish[];
  lastFirebaseCheck?: number;  // Last time we checked Firebase (for refresh optimization)
  firebaseTimestamp?: number;  // Firebase's last update timestamp
}

export interface AdminRestaurantCacheData extends TimestampedData {
  restaurantData: Restaurant;
  menuData: Dish[];
  categoriesData: Category[];
  // No Firebase checks for admin - always fresh data
}

// ============================================
// Domain Models
// ============================================
export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  mobile_no: string;
  logo: string;
  cover_image: string;
  google_map_link: string;
  google_rating_link: string;
  about_us: string;
  description?: string;
  rating?: number;
  total_reviews?: number;
  cuisine?: string[];
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  linkedin_link?: string;
  youtube_link?: string;
  active_plan?: "menu" | "order" | "grow";
  plan_expiry?: string;
  plan_amount?: number;
  // Ordering & Billing Fields
  cgst_rate?: number;
  sgst_rate?: number;
  gst_no?: string;
  delivery_charges_type?: "fixed" | "variable";
  delivery_charge_fixed?: number;
  delivery_charge_min?: number;
  delivery_charge_max?: number;
  delivery_instruction?: string;
  enabled_services?: string; // Stringified array like "[dinein,takeaway,delivery]"
}

export interface CartItem {
  dishId: string;
  name: string;
  image: string;
  variationId?: string;
  variationSize: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface DishVariation {
  id?: string;
  size: "half" | "full" | "small" | "medium" | "large" | "price";
  price: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  isVeg: boolean;
  name: string;
  image: string;
  category: string; // This will store the category NAME for display
  categoryId?: string; // This will store the category ID for logic/updates
  description: string;
  variations: DishVariation[];
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  restaurantId: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

// ============================================
// Validation Types
// ============================================
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export interface MultiValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================
// Storage Keys
// ============================================
export enum KEYS {
  RESTAURANT_DATA = "restaurant_data",
  ADMIN_RESTAURANT_DATA = "admin_restaurant_data",
  JWT_TOKEN = "jwt_token",
  CART_DATA = "cart_data"
}

// IndexedDB value types
export type IDBValue =
  | RestaurantCacheData
  | AdminRestaurantCacheData
  | CartItem[]
  | string
  | null
  | undefined;