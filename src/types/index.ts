// ============================================
// User & Authentication Types
// ============================================
export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  restaurantId: string;
  name: string;
  role: "admin";
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  restaurantId: string;
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
}

export interface AdminRestaurantCacheData extends TimestampedData {
  restaurantData: Restaurant;
  menuData: Dish[];
  categoriesData: Category[];
}

// ============================================
// Domain Models
// ============================================
export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  mobileNo: string;
  logo: string;
  coverImage: string;
  googleMapLink: string;
  googleRatingLink: string;
  aboutus: string;
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  linkedinLink?: string;
  youtubeLink?: string;
  active_plan?: string;
  plan_expiry?: string;
}

export interface DishVariation {
  size: "half" | "full" | "small" | "medium" | "large" | "price";
  price: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  isVeg: boolean;
  name: string;
  image: string;
  category: string;
  description: string;
  variations: DishVariation[];
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  restaurantId: string;
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
  JWT_TOKEN = "jwt_token"
}

// IndexedDB value types
export type IDBValue =
  | RestaurantCacheData
  | AdminRestaurantCacheData
  | string
  | null
  | undefined;