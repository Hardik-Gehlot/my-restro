// ============================================
// Firebase Service for Timestamp Management
// ============================================
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Timestamp, Firestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let db: Firestore;

if (typeof window !== 'undefined') {
    // Only initialize on client side
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    db = getFirestore(app);
}

/**
 * Restaurant timestamp data structure
 */
export interface RestaurantTimestamp {
    lastUpdated: number;  // Unix timestamp in milliseconds
    updatedBy?: string;   // Admin user who made the change
    changeType?: 'restaurant' | 'menu' | 'category';
}

/**
 * Get restaurant's last update timestamp from Firebase
 * @param restaurantId - Restaurant ID
 * @returns Unix timestamp in milliseconds, or 0 if not found
 */
export const getFirebaseTimestamp = async (restaurantId: string): Promise<number> => {
    if (typeof window === 'undefined') {
        console.warn('Firebase can only be used on client side');
        return 0;
    }

    try {
        const docRef = doc(db, 'restaurant_timestamps', restaurantId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as RestaurantTimestamp;
            console.log(`Firebase: Restaurant ${restaurantId} last updated at`, new Date(data.lastUpdated));
            return data.lastUpdated;
        } else {
            console.log(`Firebase: No timestamp found for restaurant ${restaurantId}`);
            return 0;
        }
    } catch (error) {
        console.error('Error fetching Firebase timestamp:', error);
        return 0;
    }
};

/**
 * Update restaurant's timestamp in Firebase
 * Called when admin makes changes to restaurant/menu/categories
 * @param restaurantId - Restaurant ID
 * @param changeType - Type of change made
 * @param updatedBy - Admin user who made the change
 */
export const updateFirebaseTimestamp = async (
    restaurantId: string,
    changeType: 'restaurant' | 'menu' | 'category' = 'menu',
    updatedBy: string = 'admin'
): Promise<void> => {
    if (typeof window === 'undefined') {
        console.warn('Firebase can only be used on client side');
        return;
    }

    try {
        const docRef = doc(db, 'restaurant_timestamps', restaurantId);
        const timestampData = {
            lastUpdated: Date.now(),
        };

        await setDoc(docRef, timestampData);
        console.log(`Firebase: Updated timestamp for restaurant ${restaurantId}`, timestampData);
    } catch (error) {
        console.error('Error updating Firebase timestamp:', error);
        // Don't throw - timestamp update failure shouldn't break the operation
    }
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        typeof window !== 'undefined'
    );
};
