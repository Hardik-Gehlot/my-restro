// ============================================
// Validation Utilities
// ============================================
import { ValidationResult, MultiValidationResult, Restaurant } from '@/types';

/**
 * Validates authentication token format
 */
export const validateToken = (token: string): boolean => {
    return Boolean(token && token.length > 0 && !token.includes(' '));
};

/**
 * Validates category name
 */
export const validateCategoryName = (name: string): ValidationResult => {
    const trimmed = name.trim();

    if (!trimmed) {
        return { valid: false, error: 'Category name cannot be empty' };
    }

    if (trimmed.length > 100) {
        return { valid: false, error: 'Category name too long (max 100 characters)' };
    }

    if (!/^[a-zA-Z0-9\s\-&]+$/.test(trimmed)) {
        return { valid: false, error: 'Category name contains invalid characters' };
    }

    return { valid: true };
};

/**
 * Validates mobile number (10 digits)
 */
export const validateMobileNumber = (mobile: string): ValidationResult => {
    const trimmed = mobile.trim();

    if (!trimmed) {
        return { valid: false, error: 'Mobile number is required' };
    }

    if (!/^\d{10}$/.test(trimmed)) {
        return { valid: false, error: 'Mobile number must be exactly 10 digits' };
    }

    return { valid: true };
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string, fieldName: string = 'URL'): ValidationResult => {
    if (!url || !url.trim()) {
        return { valid: true }; // Optional field
    }

    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, error: `${fieldName} must be a valid URL` };
    }
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
    const trimmed = email.trim();

    if (!trimmed) {
        return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string, minLength: number = 6): ValidationResult => {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < minLength) {
        return { valid: false, error: `Password must be at least ${minLength} characters` };
    }

    return { valid: true };
};

/**
 * Validates restaurant data comprehensively
 */
export const validateRestaurantData = (restaurant: Partial<Restaurant>): MultiValidationResult => {
    const errors: string[] = [];

    // Required fields
    if (!restaurant.name?.trim()) {
        errors.push('Restaurant name is required');
    }

    // Mobile number validation
    const mobileValidation = validateMobileNumber(restaurant.mobile_no || '');
    if (!mobileValidation.valid) {
        errors.push(mobileValidation.error!);
    }

    // URL validations
    const urlFields: Array<{ key: keyof Restaurant; label: string }> = [
        { key: 'logo', label: 'Logo URL' },
        { key: 'cover_image', label: 'Cover image URL' },
        { key: 'google_map_link', label: 'Google Maps link' },
        { key: 'google_rating_link', label: 'Google Rating link' },
        { key: 'instagram_link', label: 'Instagram link' },
        { key: 'facebook_link', label: 'Facebook link' },
        { key: 'twitter_link', label: 'Twitter link' },
        { key: 'linkedin_link', label: 'LinkedIn link' },
        { key: 'youtube_link', label: 'YouTube link' },
    ];

    urlFields.forEach(({ key, label }) => {
        const value = restaurant[key];
        if (value && typeof value === 'string') {
            const urlValidation = validateUrl(value, label);
            if (!urlValidation.valid) {
                errors.push(urlValidation.error!);
            }
        }
    });

    return { valid: errors.length === 0, errors };
};

/**
 * Sanitizes string input by trimming and removing dangerous characters
 */
export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Validates dish name
 */
export const validateDishName = (name: string): ValidationResult => {
    const trimmed = name.trim();

    if (!trimmed) {
        return { valid: false, error: 'Dish name cannot be empty' };
    }

    if (trimmed.length > 200) {
        return { valid: false, error: 'Dish name too long (max 200 characters)' };
    }

    return { valid: true };
};
