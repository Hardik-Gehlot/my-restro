import { get, set, del } from 'idb-keyval';
import { KEYS } from '@/types';

export const idb = {
    // Get data from IndexedDB
    get: async (key: string) => {
        try {
            return await get(key);
        } catch (error) {
            console.error(`Error getting ${key} from IndexedDB:`, error);
            return null;
        }
    },

    // Set data in IndexedDB
    set: async (key: string, value: any) => {
        try {
            await set(key, value);
        } catch (error) {
            console.error(`Error setting ${key} in IndexedDB:`, error);
        }
    },

    // Delete data from IndexedDB
    del: async (key: string) => {
        try {
            await del(key);
        } catch (error) {
            console.error(`Error deleting ${key} from IndexedDB:`, error);
        }
    },

    // Clear specific keys on logout
    clearAuthData: async () => {
        try {
            await del(KEYS.JWT_TOKEN);
            await del(KEYS.ADMIN_RESTAURANT_DATA);
        } catch (error) {
            console.error('Error clearing auth data from IndexedDB:', error);
        }
    }
};
