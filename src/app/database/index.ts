// ============================================
// Database Service with Type Safety & Validation
// ============================================
import { RESTAURANT_CACHE_DURATION } from "@/lib/common-data";
import { mockDishes, mockRestaurants } from "@/lib/mock-data";
import { supabaseDatabase } from "@/lib/supabase";
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
   * Update dish (mock implementation)
   */
  updateDish: async (id: string, data: Partial<Dish>): Promise<Dish | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const dish = mockDishes.find((d) => d.id === id);
    if (dish) {
      Object.assign(dish, data);
      return dish;
    }
    return null;
  },

  /**
   * Delete dish (mock implementation)
   */
  deleteDish: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDishes.findIndex((d) => d.id === id);
    if (index !== -1) {
      mockDishes.splice(index, 1);
      return true;
    }
    return false;
  },

  /**
   * Add dish (mock implementation)
   */
  addDish: async (dish: Omit<Dish, "id">): Promise<Dish> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newDish: Dish = {
      ...dish,
      id: `dish_${Date.now()}`,
    };
    mockDishes.push(newDish);
    return newDish;
  },

  /**
   * Get restaurant data with menu (with caching)
   * Public endpoint - no authentication required
   */
  getRestaurantDataWithMenu: async (
    restaurantId: string,
  ): Promise<{ restaurant: Restaurant | null; menu: Dish[] }> => {
    try {
      // Check cache first
      const cachedData = await idb.get(KEYS.RESTAURANT_DATA);
      if (cachedData) {
        if (cachedData.restaurantData.id === restaurantId) {
          const now = Date.now();
          if (now - cachedData.timestamp < RESTAURANT_CACHE_DURATION) {
            console.log('Returning restaurant data from cache');
            return {
              restaurant: cachedData.restaurantData,
              menu: cachedData.menuData,
            };
          }
        }
      }

      // Fetch from API
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

      console.log('response: ', response);

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        console.error('Failed to fetch restaurant data:', data.error);
        return {
          restaurant: null,
          menu: [],
        };
      }

      // Validate response data
      if (!data.restaurantData) {
        console.error('Invalid response: missing restaurantData');
        return {
          restaurant: null,
          menu: [],
        };
      }

      // Store in IndexedDB cache
      const cacheData: RestaurantCacheData = {
        restaurantData: data.restaurantData,
        menuData: data.menuData || [],
        timestamp: Date.now(),
      };

      try {
        await idb.set(KEYS.RESTAURANT_DATA, cacheData);
        console.log('Restaurant data cached in IndexedDB');
      } catch (cacheError) {
        console.warn('Failed to cache restaurant data:', cacheError);
        // Don't fail the operation if caching fails
      }

      return {
        restaurant: data.restaurantData,
        menu: data.menuData || [],
      };
    } catch (error) {
      console.error("Error in getRestaurantDataWithMenu:", error);
      return {
        restaurant: null,
        menu: [],
      };
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
};
