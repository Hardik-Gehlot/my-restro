/**
 * Coupon utility functions for generating codes, calculating discounts, and validation
 */

export interface Coupon {
    id: string;
    restaurant_id: string;
    coupon_code: string;
    coupon_type: 'flat' | 'percentage';
    discount_value: number;
    max_discount_amount?: number;
    min_order_value: number;
    max_usage_count: number;
    current_usage_count: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

/**
 * Generate a random 7-character uppercase coupon code (A-Z only)
 */
export function generateCouponCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

/**
 * Validate coupon code format
 * Auto-generated: 7 characters, A-Z only
 * Manual: up to 15 characters, alphanumeric only
 */
export function validateCouponCodeFormat(code: string): { valid: boolean; error?: string } {
    if (!code || code.trim() === '') {
        return { valid: false, error: 'Coupon code is required' };
    }

    const trimmedCode = code.trim();

    if (trimmedCode.length > 15) {
        return { valid: false, error: 'Coupon code must be 15 characters or less' };
    }

    // Only allow alphanumeric characters (A-Z, 0-9)
    const alphanumericRegex = /^[A-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmedCode)) {
        return { valid: false, error: 'Coupon code must contain only letters and numbers' };
    }

    return { valid: true };
}

/**
 * Calculate discount amount based on coupon type and order total
 */
export function calculateDiscount(coupon: Coupon, orderTotal: number): number {
    if (coupon.coupon_type === 'flat') {
        return Math.min(coupon.discount_value, orderTotal);
    } else if (coupon.coupon_type === 'percentage') {
        const percentageDiscount = (orderTotal * coupon.discount_value) / 100;

        // Apply max discount cap if specified
        if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
            return Math.min(percentageDiscount, coupon.max_discount_amount, orderTotal);
        }

        return Math.min(percentageDiscount, orderTotal);
    }

    return 0;
}

/**
 * Validate if coupon can be applied to an order
 */
export function validateCouponForOrder(
    coupon: Coupon,
    orderTotal: number,
    currentDate: Date = new Date()
): { valid: boolean; error?: string; amountNeeded?: number } {
    // Check if coupon is active
    if (!coupon.is_active) {
        return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check date validity
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (currentDate < startDate) {
        return { valid: false, error: 'This coupon is not yet valid' };
    }

    if (currentDate > endDate) {
        return { valid: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.current_usage_count >= coupon.max_usage_count) {
        return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check minimum order value
    if (orderTotal < coupon.min_order_value) {
        const amountNeeded = coupon.min_order_value - orderTotal;
        return {
            valid: false,
            error: `Add ₹${amountNeeded.toFixed(2)} more to use this coupon`,
            amountNeeded
        };
    }

    return { valid: true };
}

/**
 * Format coupon for display in UI
 */
export function formatCouponForDisplay(coupon: Coupon): string {
    if (coupon.coupon_type === 'flat') {
        return `₹${coupon.discount_value} OFF`;
    } else {
        const maxCap = coupon.max_discount_amount
            ? ` upto ₹${coupon.max_discount_amount}`
            : '';
        return `${coupon.discount_value}% OFF${maxCap}`;
    }
}

/**
 * Check if coupon is expired
 */
export function isCouponExpired(coupon: Coupon, currentDate: Date = new Date()): boolean {
    const endDate = new Date(coupon.end_date);
    return currentDate > endDate;
}

/**
 * Check if coupon is fully used
 */
export function isCouponFullyUsed(coupon: Coupon): boolean {
    return coupon.current_usage_count >= coupon.max_usage_count;
}

/**
 * Get coupon status for display
 */
export function getCouponStatus(coupon: Coupon): 'active' | 'expired' | 'used' | 'inactive' {
    if (!coupon.is_active) return 'inactive';
    if (isCouponFullyUsed(coupon)) return 'used';
    if (isCouponExpired(coupon)) return 'expired';
    return 'active';
}
