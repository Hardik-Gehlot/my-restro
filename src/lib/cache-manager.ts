// ============================================
// Smart Cache Manager
// ============================================
import { idb } from './indexeddb';
import { KEYS, RestaurantCacheData } from '@/types';
import { getFirebaseTimestamp } from './firebase';
import { CONFIG } from './constants';

/**
 * Check if we should fetch fresh data from API
 * @param restaurantId - Restaurant ID
 * @param isRefresh - Whether this is a page refresh (vs initial load)
 * @returns true if should fetch from API, false if can use cache
 */
export const shouldFetchFromAPI = async (
    restaurantId: string,
    isRefresh: boolean = false
): Promise<{ shouldFetch: boolean; reason: string }> => {
    try {
        // 1. Check if data exists in IndexedDB
        const cached = await idb.get(KEYS.RESTAURANT_DATA);

        if (!cached) {
            return { shouldFetch: true, reason: 'No cached data found' };
        }

        // 2. Check if cached data is for the correct restaurant
        if (cached.restaurantData.id !== restaurantId) {
            return { shouldFetch: true, reason: 'Different restaurant' };
        }

        // 3. Check if cache is older than 1 days
        const cacheAge = Date.now() - cached.timestamp;
        const oneDaysInMs = CONFIG.CACHE_DURATION;

        if (cacheAge > oneDaysInMs) {
            await idb.del(KEYS.RESTAURANT_DATA);
            await idb.del(KEYS.CART_DATA);
            return { shouldFetch: true, reason: 'Cache expired (>2 days old)' };
        }

        // 4. If this is NOT a refresh, use cached data (initial load)
        if (!isRefresh) {
            return { shouldFetch: false, reason: 'Using cache (initial load)' };
        }

        // 5. If this IS a refresh, check Firebase timestamp
        const lastFirebaseCheck = cached.lastFirebaseCheck || 0;
        const timeSinceLastCheck = Date.now() - lastFirebaseCheck;

        // Only check Firebase if last check was > 2 minutes ago
        if (timeSinceLastCheck < CONFIG.FIREBASE_CHECK_INTERVAL) {
            return { shouldFetch: false, reason: 'Firebase checked recently (<2 min)' };
        }

        // Check Firebase for updates
        const firebaseTimestamp = await getFirebaseTimestamp(restaurantId);
        const localTimestamp = cached.firebaseTimestamp || 0;

        if (firebaseTimestamp > localTimestamp) {
            return { shouldFetch: true, reason: 'Firebase shows newer data available' };
        }

        // Update last Firebase check time (but don't refetch)
        cached.lastFirebaseCheck = Date.now();
        await idb.set(KEYS.RESTAURANT_DATA, cached);

        return { shouldFetch: false, reason: 'Data is up to date (Firebase check passed)' };
    } catch (error) {
        console.error('Error in shouldFetchFromAPI:', error);
        // On error, fetch fresh data to be safe
        return { shouldFetch: true, reason: 'Error checking cache' };
    }
};

/**
 * Invalidate (delete) cached restaurant data
 * @param restaurantId - Restaurant ID (optional, if not provided clears all)
 */
export const invalidateCache = async (restaurantId?: string): Promise<void> => {
    try {
        if (!restaurantId) {
            // Clear all restaurant cache
            await idb.del(KEYS.RESTAURANT_DATA);
            console.log('Cache: Cleared all restaurant data');
            return;
        }

        // Check if cached data is for this restaurant
        const cached = await idb.get(KEYS.RESTAURANT_DATA);
        if (cached && cached.restaurantData.id === restaurantId) {
            await idb.del(KEYS.RESTAURANT_DATA);
            console.log(`Cache: Cleared data for restaurant ${restaurantId}`);
        }
    } catch (error) {
        console.error('Error invalidating cache:', error);
    }
};

/**
 * Get cache age in human-readable format
 * @param restaurantId - Restaurant ID
 */
export const getCacheAge = async (restaurantId: string): Promise<string | null> => {
    try {
        const cached = await idb.get(KEYS.RESTAURANT_DATA);
        if (!cached || cached.restaurantData.id !== restaurantId) {
            return null;
        }

        const ageMs = Date.now() - cached.timestamp;
        const ageMinutes = Math.floor(ageMs / (1000 * 60));
        const ageHours = Math.floor(ageMinutes / 60);
        const ageDays = Math.floor(ageHours / 24);

        if (ageDays > 0) return `${ageDays} day(s) old`;
        if (ageHours > 0) return `${ageHours} hour(s) old`;
        if (ageMinutes > 0) return `${ageMinutes} minute(s) old`;
        return 'Just now';
    } catch (error) {
        return null;
    }
};
