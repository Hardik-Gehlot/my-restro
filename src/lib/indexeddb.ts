import { get, set, del } from 'idb-keyval';
import { KEYS, RestaurantCacheData, AdminRestaurantCacheData, CartItem } from '@/types';

// ============================================
// Type-safe IndexedDB Wrapper
// ============================================

// Type-safe key-value mapping
type IDBKeyMap = {
    [KEYS.RESTAURANT_DATA]: RestaurantCacheData;
    [KEYS.ADMIN_RESTAURANT_DATA]: AdminRestaurantCacheData;
    [KEYS.JWT_TOKEN]: string;
    [KEYS.CART_DATA]: CartItem[];
};

/**
 * Custom error class for IndexedDB operations
 */
export class IndexedDBError extends Error {
    constructor(
        message: string,
        public operation: 'get' | 'set' | 'del',
        public key: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'IndexedDBError';
    }
}

export const idb = {
    /**
     * Type-safe get with proper error handling
     * Returns undefined if key doesn't exist
     * Throws IndexedDBError on failure
     */
    get: async <K extends keyof IDBKeyMap>(
        key: K
    ): Promise<IDBKeyMap[K] | undefined> => {
        try {
            const value = await get<IDBKeyMap[K]>(key);
            return value;
        } catch (error) {
            console.error(`Error getting ${key} from IndexedDB:`, error);
            throw new IndexedDBError('Failed to retrieve data', 'get', key, error);
        }
    },

    /**
     * Type-safe set with validation
     * Throws IndexedDBError on failure
     */
    set: async <K extends keyof IDBKeyMap>(
        key: K,
        value: IDBKeyMap[K]
    ): Promise<void> => {
        try {
            await set(key, value);
        } catch (error) {
            console.error(`Error setting ${key} in IndexedDB:`, error);
            throw new IndexedDBError('Failed to store data', 'set', key, error);
        }
    },

    /**
     * Delete key from IndexedDB
     * Throws IndexedDBError on failure
     */
    del: async (key: string): Promise<void> => {
        try {
            await del(key);
        } catch (error) {
            console.error(`Error deleting ${key} from IndexedDB:`, error);
            throw new IndexedDBError('Failed to delete data', 'del', key, error);
        }
    },

    /**
     * Clear authentication data on logout
     * Logs errors but doesn't throw (logout should succeed even if cleanup fails)
     */
    clearAuthData: async (): Promise<void> => {
        const errors: IndexedDBError[] = [];

        try {
            await del(KEYS.JWT_TOKEN);
        } catch (error) {
            const err = new IndexedDBError('Failed to delete JWT token', 'del', KEYS.JWT_TOKEN, error);
            errors.push(err);
            console.error(err);
        }

        try {
            await del(KEYS.ADMIN_RESTAURANT_DATA);
        } catch (error) {
            const err = new IndexedDBError('Failed to delete admin data', 'del', KEYS.ADMIN_RESTAURANT_DATA, error);
            errors.push(err);
            console.error(err);
        }

        // Don't throw - logout should succeed even if IDB cleanup fails
        if (errors.length > 0) {
            console.warn(`${errors.length} error(s) occurred while clearing auth data`);
        }
    },

    /**
     * Check if a key exists in IndexedDB
     */
    has: async (key: string): Promise<boolean> => {
        try {
            const value = await get(key);
            return value !== undefined;
        } catch {
            return false;
        }
    },

    /**
     * Get with fallback value
     */
    getOrDefault: async <K extends keyof IDBKeyMap>(
        key: K,
        defaultValue: IDBKeyMap[K]
    ): Promise<IDBKeyMap[K]> => {
        try {
            const value = await get<IDBKeyMap[K]>(key);
            return value !== undefined ? value : defaultValue;
        } catch (error) {
            console.error(`Error getting ${key}, returning default:`, error);
            return defaultValue;
        }
    }
};
