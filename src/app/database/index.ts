// ============================================
// Database Service with Type Safety & Validation
// ============================================
import { RESTAURANT_CACHE_DURATION } from "@/lib/common-data";
import { mockDishes, mockRestaurants } from "@/lib/mock-data";

import {
  AdminRestaurantCacheData,
  ApiResponse,
  Category,
  CategoryResponse,
  Dish,
  KEYS,
  Restaurant,
  RestaurantCacheData,
  ApiStatus
} from "@/types";
import { idb } from "@/lib/indexeddb";
import { fetchWithTimeout, parseJsonResponse, createAuthHeaders, ApiError } from "@/lib/api-client";
import {
  validateToken,
  validateCategoryName,
  validateRestaurantData,
  sanitizeInput
} from "@/lib/validation";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIG } from "@/lib/constants";
import { shouldFetchFromAPI } from "@/lib/cache-manager";
import { updateFirebaseTimestamp, getFirebaseTimestamp } from "@/lib/firebase";

// ============================================
// Database Service
// ============================================
export const db = {
  /**
   * Update restaurant with validation
   */
  updateRestaurant: async (
    token: string,
    updatedRestaurant: Restaurant,
  ): Promise<{ status: ApiStatus; message: string }> => {
    // Validate token
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    // Validate restaurant data
    const validation = validateRestaurantData(updatedRestaurant);
    if (!validation.valid) {
      return {
        status: 'error',
        message: validation.errors.join(', ')
      };
    }

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.RESTAURANT,
        {
          method: 'PUT',
          headers: createAuthHeaders(token),
          body: JSON.stringify(updatedRestaurant),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || ERROR_MESSAGES.RESTAURANT.UPDATE_FAILED,
        };
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData) {
          cachedData.restaurantData = updatedRestaurant;
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      // Update Firebase timestamp for public users to see the update on refresh
      await updateFirebaseTimestamp(updatedRestaurant.id);

      return {
        status: 'success',
        message: SUCCESS_MESSAGES.RESTAURANT.UPDATED,
      };
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Update dish
   */
  updateDish: async (token: string, id: string, data: Partial<Dish>): Promise<Dish | null> => {
    try {
      // Prepare payload - prioritize categoryId if available
      const payload = {
        id,
        ...data,
        categoryId: data.categoryId,
      };

      const response = await fetchWithTimeout(
        API_ENDPOINTS.DISH,
        {
          method: 'PUT',
          headers: createAuthHeaders(token),
          body: JSON.stringify(payload),
        },
        CONFIG.API_TIMEOUT
      );

      const responseData = await parseJsonResponse(response);
      if (!response.ok) {
        console.error('Update dish failed:', responseData.error);
        return null;
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.menuData) {
          const index = cachedData.menuData.findIndex(d => d.id === id);
          if (index !== -1) {
            cachedData.menuData[index] = responseData.dish;
            await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

            // Update Firebase timestamp
            await updateFirebaseTimestamp(cachedData.restaurantData.id);
          }
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return responseData.dish;
    } catch (error) {
      console.error('Error updating dish:', error);
      return null;
    }
  },

  /**
   * Delete dish
   */
  deleteDish: async (token: string, id: string): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(
        `${API_ENDPOINTS.DISH}?id=${id}`,
        {
          method: 'DELETE',
          headers: createAuthHeaders(token),
        },
        CONFIG.API_TIMEOUT
      );

      if (!response.ok) {
        return false;
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.menuData) {
          cachedData.menuData = cachedData.menuData.filter(d => d.id !== id);
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

          // Update Firebase timestamp
          await updateFirebaseTimestamp(cachedData.restaurantData.id);
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting dish:', error);
      return false;
    }
  },

  /**
   * Add dish
   */
  addDish: async (token: string, dish: Omit<Dish, "id">): Promise<Dish | null> => {
    try {
      const payload = {
        ...dish,
        categoryId: dish.categoryId || dish.category,
      };

      const response = await fetchWithTimeout(
        API_ENDPOINTS.DISH,
        {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify(payload),
        },
        CONFIG.API_TIMEOUT
      );

      const responseData = await parseJsonResponse(response);

      if (!response.ok) {
        console.error('Add dish failed:', responseData.error);
        return null;
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.menuData) {
          cachedData.menuData.push(responseData.dish);
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

          // Update Firebase timestamp
          await updateFirebaseTimestamp(cachedData.restaurantData.id);
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return responseData.dish;
    } catch (error) {
      console.error('Error adding dish:', error);
      return null;
    }
  },

  /**
   * Get restaurant data with menu (with smart caching)
   * Public endpoint - no authentication required
   * @param restaurantId id of the restaurant
   * @param isRefresh if true, will check Firebase for updates (2 min throttle)
   */
  getRestaurantDataWithMenu: async (
    restaurantId: string,
    isRefresh: boolean = false
  ): Promise<{ restaurant: Restaurant | null; menu: Dish[] }> => {
    try {
      // 1. Use smart cache manager to decide if we need to hit the API
      const { shouldFetch, reason } = await shouldFetchFromAPI(restaurantId, isRefresh);
      console.log(`Cache Decision: ${shouldFetch ? 'FETCH' : 'CACHE'} (${reason})`);

      if (!shouldFetch) {
        const cached = await idb.get(KEYS.RESTAURANT_DATA);
        return {
          restaurant: cached!.restaurantData,
          menu: cached!.menuData,
        };
      }

      // 2. Fetch from API
      const response = await fetchWithTimeout(
        `/api/restaurant/${restaurantId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        console.error('Failed to fetch restaurant data:', data.error);
        // Fallback to cache if available on API failure
        const cached = await idb.get(KEYS.RESTAURANT_DATA);
        if (cached && cached.restaurantData.id === restaurantId) {
          return { restaurant: cached.restaurantData, menu: cached.menuData };
        }
        return { restaurant: null, menu: [] };
      }

      // 3. Get latest Firebase timestamp to store in cache
      // This ensures we know when the server was last updated
      const firebaseTimestamp = await getFirebaseTimestamp(restaurantId);

      // 4. Store in IndexedDB cache
      const cacheData: RestaurantCacheData = {
        restaurantData: data.restaurantData,
        menuData: data.menuData || [],
        timestamp: Date.now(),
        lastFirebaseCheck: isRefresh ? Date.now() : 0,
        firebaseTimestamp: firebaseTimestamp
      };

      try {
        await idb.set(KEYS.RESTAURANT_DATA, cacheData);
        console.log('Restaurant data cached');
      } catch (cacheError) {
        console.warn('Failed to cache restaurant data:', cacheError);
      }

      return {
        restaurant: data.restaurantData,
        menu: data.menuData || [],
      };
    } catch (error) {
      console.error("Error in getRestaurantDataWithMenu:", error);
      // Fallback to cache if available
      const cached = await idb.get(KEYS.RESTAURANT_DATA);
      if (cached && cached.restaurantData.id === restaurantId) {
        return { restaurant: cached.restaurantData, menu: cached.menuData };
      }
      return { restaurant: null, menu: [] };
    }
  },

  /**
   * Login with validation
   */
  login: async (
    email: string,
    password: string,
  ): Promise<{ status: ApiStatus; data: string }> => {
    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: sanitizeInput(email), password }),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: "error",
          data: data.error || ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        };
      }

      return {
        status: "success",
        data: data.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: "error",
        data: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Logout and clear cache
   */
  logout: async (): Promise<{ status: ApiStatus; message: string }> => {
    sessionStorage.removeItem(KEYS.JWT_TOKEN);
    await idb.clearAuthData();
    return {
      status: "success",
      message: SUCCESS_MESSAGES.AUTH.LOGOUT
    };
  },

  /**
   * Get admin restaurant data with menu and categories
   */
  getAdminRestaurantDataWithMenu: async (
    token: string,
  ): Promise<{
    status: ApiStatus;
    message?: string;
    data?: { restaurantData: Restaurant | null; menuData: Dish[]; categoriesData: Category[] };
  }> => {
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    try {
      // Check cache
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (cachedData) {
        console.log('Returning admin data from cache');
        return {
          status: "success",
          data: {
            restaurantData: cachedData.restaurantData,
            menuData: cachedData.menuData,
            categoriesData: cachedData.categoriesData
          },
        };
      }

      // Fetch from API
      const response = await fetchWithTimeout(
        API_ENDPOINTS.RESTAURANT,
        {
          method: "GET",
          headers: createAuthHeaders(token),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: "error",
          message: data.error || ERROR_MESSAGES.RESTAURANT.FETCH_FAILED,
        };
      }

      // Cache the data
      const cacheData: AdminRestaurantCacheData = {
        restaurantData: data.restaurantData,
        menuData: data.menuData,
        categoriesData: data.categoriesData,
        timestamp: Date.now(),
      };
      await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cacheData);

      return {
        status: "success",
        data: {
          restaurantData: data.restaurantData,
          menuData: data.menuData,
          categoriesData: data.categoriesData
        },
      };
    } catch (error) {
      console.error('Error fetching admin data:', error);
      return {
        status: "error",
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Get categories with caching
   */
  getCategories: async (token: string): Promise<ApiResponse> => {
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    try {
      // Check cache
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (cachedData?.categoriesData) {
        console.log('Returning categories from cache');
        return {
          status: 'success',
          data: {
            categoriesData: cachedData.categoriesData
          }
        };
      }

      // Fetch from API
      const response = await fetchWithTimeout(
        API_ENDPOINTS.CATEGORY,
        {
          method: 'GET',
          headers: createAuthHeaders(token),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || ERROR_MESSAGES.CATEGORY.FETCH_FAILED,
        };
      }

      // Update cache
      const existingData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (existingData) {
        existingData.categoriesData = data.categoriesData;
        await idb.set(KEYS.ADMIN_RESTAURANT_DATA, existingData);
      }

      return {
        status: 'success',
        data: {
          categoriesData: data.categoriesData
        }
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Add category with validation
   */
  addCategory: async (token: string, categoryName: string): Promise<CategoryResponse> => {
    // Validate token
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    // Validate category name
    const validation = validateCategoryName(categoryName);
    if (!validation.valid) {
      return {
        status: 'error',
        message: validation.error!
      };
    }

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.CATEGORY,
        {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ name: sanitizeInput(categoryName) }),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || ERROR_MESSAGES.CATEGORY.ADD_FAILED,
        };
      }

      // Validate response
      if (!data.category || typeof data.category.id !== 'string') {
        return {
          status: 'error',
          message: 'Invalid response from server'
        };
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.categoriesData) {
          cachedData.categoriesData.push(data.category);
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

          // Update Firebase timestamp
          await updateFirebaseTimestamp(cachedData.restaurantData.id);
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return {
        status: 'success',
        data: data.category
      };
    } catch (error) {
      console.error('Error adding category:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Update category with validation
   */
  updateCategory: async (
    token: string,
    categoryId: string,
    categoryName: string
  ): Promise<CategoryResponse> => {
    // Validate token
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    // Validate category name
    const validation = validateCategoryName(categoryName);
    if (!validation.valid) {
      return {
        status: 'error',
        message: validation.error!
      };
    }

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.CATEGORY,
        {
          method: 'PUT',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ id: categoryId, name: sanitizeInput(categoryName) }),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || ERROR_MESSAGES.CATEGORY.UPDATE_FAILED,
        };
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.categoriesData) {
          const index = cachedData.categoriesData.findIndex((c: Category) => c.id === categoryId);
          if (index !== -1) {
            cachedData.categoriesData[index] = data.category;
            await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

            // Update Firebase timestamp
            await updateFirebaseTimestamp(cachedData.restaurantData.id);
          }
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return {
        status: 'success',
        data: data.category
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Delete category
   */
  deleteCategory: async (token: string, categoryId: string): Promise<ApiResponse> => {
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.CATEGORY,
        {
          method: 'DELETE',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ id: categoryId }),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || ERROR_MESSAGES.CATEGORY.DELETE_FAILED,
        };
      }

      // Update cache
      try {
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        if (cachedData?.categoriesData) {
          cachedData.categoriesData = cachedData.categoriesData.filter(
            (c: Category) => c.id !== categoryId
          );
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, cachedData);

          // Update Firebase timestamp
          await updateFirebaseTimestamp(cachedData.restaurantData.id);
        }
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
      }

      return {
        status: 'success',
        message: SUCCESS_MESSAGES.CATEGORY.DELETED
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    token: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    if (!validateToken(token)) {
      return {
        status: 'error',
        message: ERROR_MESSAGES.AUTH.INVALID_TOKEN
      };
    }

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ currentPassword, newPassword }),
        },
        CONFIG.API_TIMEOUT
      );

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to change password',
        };
      }

      return {
        status: 'success',
        message: SUCCESS_MESSAGES.AUTH.PASSWORD_CHANGED,
        data: { token: data.token }
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        status: 'error',
        message: error instanceof ApiError ? error.message : ERROR_MESSAGES.NETWORK.UNKNOWN,
      };
    }
  },

  /**
   * Get featured restaurants for the home page
   */
  getFeaturedRestaurants: async (): Promise<Restaurant[]> => {
    // For now, return mock data since we don't have a global restaurants fetcher yet
    return mockRestaurants;
  },

  /**
   * Search restaurants by query
   */
  searchRestaurants: async (query: string): Promise<Restaurant[]> => {
    const q = query.toLowerCase();
    return mockRestaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.tagline.toLowerCase().includes(q)
    );
  },

  /**
   * Filter restaurants by cuisine
   */
  getRestaurantsByCuisine: async (cuisine: string): Promise<Restaurant[]> => {
    const c = cuisine.toLowerCase();
    return mockRestaurants.filter(r =>
      r.cuisine?.some(type => type.toLowerCase() === c)
    );
  },

  /**
   * Track ad impression
   */
  trackAdImpression: async (adId: string): Promise<void> => {
    console.log(`Ad Impression tracked for: ${adId}`);
  },

  /**
   * Track ad click
   */
  trackAdClick: async (adId: string): Promise<void> => {
    console.log(`Ad Click tracked for: ${adId}`);
  },

  /**
   * Superadmin: Get dashboard stats and all restaurants
   */
  getSuperStats: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithTimeout(
        '/api/superadmin/dashboard',
        {
          method: 'GET',
          headers: createAuthHeaders(token),
        },
        CONFIG.API_TIMEOUT
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) return { status: 'error', message: data.error || 'Failed to fetch stats' };
      return { status: 'success', data };
    } catch (error) {
      return { status: 'error', message: 'Network error or timeout' };
    }
  },

  /**
   * Superadmin: Update restaurant plan/expiry
   */
  updateRestaurantPlan: async (token: string, id: string, plan: string, expiryDate: string, planAmount: number): Promise<ApiResponse> => {
    try {
      const response = await fetchWithTimeout(
        `/api/superadmin/restaurant/${id}`,
        {
          method: 'PUT',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ action: 'update_plan', plan, expiryDate, planAmount }),
        },
        CONFIG.API_TIMEOUT
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) return { status: 'error', message: data.error || 'Update failed' };
      return { status: 'success', message: 'Plan updated' };
    } catch (error) {
      return { status: 'error', message: 'Network error' };
    }
  },

  /**
   * Superadmin: Reset restaurant password
   */
  resetRestaurantPassword: async (token: string, id: string, newPassword: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithTimeout(
        `/api/superadmin/restaurant/${id}`,
        {
          method: 'PUT',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ action: 'reset_password', newPassword }),
        },
        CONFIG.API_TIMEOUT
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) return { status: 'error', message: data.error || 'Reset failed' };
      return { status: 'success', message: 'Password reset' };
    } catch (error) {
      return { status: 'error', message: 'Network error' };
    }
  },

  /**
   * Superadmin: Create new restaurant and user
   */
  createRestaurant: async (token: string, restaurantName: string, mobileNo: string, email: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithTimeout(
        '/api/superadmin/restaurant',
        {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ action: 'create_single', restaurantName, mobileNo, email, password }),
        },
        CONFIG.API_TIMEOUT
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) return { status: 'error', message: data.error || 'Creation failed' };
      return { status: 'success', data: data.restaurantId, message: 'Restaurant created' };
    } catch (error) {
      return { status: 'error', message: 'Network error' };
    }
  },

  /**
   * Superadmin: Bulk upload dishes for a specific restaurant
   */
  bulkUploadDishes: async (token: string, restaurantId: string, bulkData: any[]): Promise<ApiResponse> => {
    try {
      const response = await fetchWithTimeout(
        '/api/superadmin/restaurant',
        {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify({ action: 'bulk_upload_dishes', restaurantId, bulkData }),
        },
        CONFIG.API_TIMEOUT
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) return { status: 'error', message: data.error || 'Bulk upload failed' };
      return { status: 'success', message: data.message, data: data.count };
    } catch (error) {
      return { status: 'error', message: 'Network error' };
    }
  },
};
