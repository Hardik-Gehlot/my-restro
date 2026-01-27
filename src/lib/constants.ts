// ============================================
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        CHANGE_PASSWORD: '/api/auth/change-password',
    },
    RESTAURANT: '/api/restaurant',
    CATEGORY: '/api/category',
    DISH: '/api/dish',
} as const;

// ============================================
// Error Messages
// ============================================
export const ERROR_MESSAGES = {
    AUTH: {
        NO_TOKEN: 'No authentication token provided',
        INVALID_TOKEN: 'Invalid or expired token',
        INVALID_CREDENTIALS: 'Invalid email or password',
        UNAUTHORIZED: 'Unauthorized access',
    },
    NETWORK: {
        TIMEOUT: 'Request timed out. Please try again.',
        OFFLINE: 'No internet connection',
        SERVER_ERROR: 'Server error occurred. Please try again later.',
        UNKNOWN: 'An unexpected error occurred',
    },
    VALIDATION: {
        REQUIRED_FIELD: (field: string) => `${field} is required`,
        INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
        TOO_LONG: (field: string, max: number) => `${field} is too long (max ${max} characters)`,
        TOO_SHORT: (field: string, min: number) => `${field} is too short (min ${min} characters)`,
    },
    CATEGORY: {
        FETCH_FAILED: 'Failed to fetch categories',
        ADD_FAILED: 'Failed to add category',
        UPDATE_FAILED: 'Failed to update category',
        DELETE_FAILED: 'Failed to delete category',
        NOT_FOUND: 'Category not found',
    },
    RESTAURANT: {
        FETCH_FAILED: 'Failed to fetch restaurant data',
        UPDATE_FAILED: 'Failed to update restaurant',
        NOT_FOUND: 'Restaurant not found',
    },
    DISH: {
        FETCH_FAILED: 'Failed to fetch dishes',
        ADD_FAILED: 'Failed to add dish',
        UPDATE_FAILED: 'Failed to update dish',
        DELETE_FAILED: 'Failed to delete dish',
        NOT_FOUND: 'Dish not found',
    },
} as const;

// ============================================
// Success Messages
// ============================================
export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN: 'Login successful',
        LOGOUT: 'Logged out successfully',
        PASSWORD_CHANGED: 'Password changed successfully',
    },
    CATEGORY: {
        ADDED: 'Category added successfully',
        UPDATED: 'Category updated successfully',
        DELETED: 'Category deleted successfully',
    },
    RESTAURANT: {
        UPDATED: 'Restaurant updated successfully',
    },
    DISH: {
        ADDED: 'Dish added successfully',
        UPDATED: 'Dish updated successfully',
        DELETED: 'Dish deleted successfully',
    },
} as const;

// ============================================
// Configuration
// ============================================
export const CONFIG = {
    API_TIMEOUT: 10000, // 10 seconds
    CACHE_DURATION: 2 * 24 * 60 * 60 * 1000, // 2 days
    FIREBASE_CHECK_INTERVAL: 2 * 60 * 1000, // 2 minutes
    PASSWORD_MIN_LENGTH: 6,
    CATEGORY_NAME_MAX_LENGTH: 100,
    DISH_NAME_MAX_LENGTH: 200,
    MOBILE_NUMBER_LENGTH: 10,
} as const;

// ============================================
// Validation Patterns
// ============================================
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MOBILE: /^\d{10}$/,
    CATEGORY_NAME: /^[a-zA-Z0-9\s\-&]+$/,
    URL: /^https?:\/\/.+/,
} as const;
