import {
  RESTAURANT_CACHE_DURATION,
} from "@/lib/common-data";
import { mockDishes, mockRestaurants, mockUsers } from "@/lib/mock-data";
import { supabaseDatabase } from "@/lib/supabase";
import { AdminRestaurantCacheData, ApiResponse, Category, Dish, KEYS, Restaurant, RestaurantCacheData, User } from "@/types";
import { idb } from "@/lib/indexeddb";

export const db = {
  updateRestaurant: async (
    token: string,
    updatedRestaurant: Restaurant,
  ): Promise<{ status: string; message: string }> => {
    try {
      const response = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRestaurant),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to update restaurant',
        };
      }
      const restaurant = mockRestaurants.find((r) => r.id === updatedRestaurant.id);
      if (restaurant) {
        Object.assign(restaurant, updatedRestaurant);
      }

      return {
        status: 'success',
        message: 'Restaurant updated successfully',
      };
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return {
        status: 'error',
        message: 'Network error occurred',
      };
    }
  },

  // Update dish
  updateDish: async (id: string, data: Partial<Dish>): Promise<Dish | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const dish = mockDishes.find((d) => d.id === id);
    if (dish) {
      Object.assign(dish, data);
      return dish;
    }
    return null;
  },

  // Delete dish
  deleteDish: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDishes.findIndex((d) => d.id === id);
    if (index !== -1) {
      mockDishes.splice(index, 1);
      return true;
    }
    return false;
  },

  // Add dish
  addDish: async (dish: Omit<Dish, "id">): Promise<Dish> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newDish = {
      ...dish,
      id: `dish_${Date.now()}`,
    };
    mockDishes.push(newDish);
    return newDish;
  },

  getRestaurantDataWithMenu: async (
    restaurantId: string,
  ): Promise<{ restaurant: Restaurant | null; menu: Dish[] }> => {
    try {
      const cachedData = await idb.get(KEYS.RESTAURANT_DATA);
      if (cachedData) {
        const parsed: RestaurantCacheData = cachedData;
        if (parsed.restaurantData.id === restaurantId) {
          const now = Date.now();
          if (now - parsed.timestamp < RESTAURANT_CACHE_DURATION) {
            return {
              restaurant: parsed.restaurantData,
              menu: parsed.menuData,
            };
          }
        }
      }

      const { restaurantData, menuData } =
        await supabaseDatabase.getRestaurantDataWithMenu(restaurantId);

      if (restaurantData) {
        const cacheData: RestaurantCacheData = {
          restaurantData,
          menuData,
          timestamp: Date.now(),
        };
        await idb.set(KEYS.RESTAURANT_DATA, cacheData);
      }

      return {
        restaurant: restaurantData,
        menu: menuData,
      };
    } catch (error) {
      console.error("Error in getRestaurantDataWithMenu:", error);
      const { restaurantData, menuData } =
        await supabaseDatabase.getRestaurantDataWithMenu(restaurantId);
      return {
        restaurant: restaurantData,
        menu: menuData,
      };
    }
  },
  login: async (
    email: string,
    password: string,
  ): Promise<{ status: string; data: string }> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        status: "error",
        data: data.error,
      };
    }
    return {
      status: "success",
      data: data.token,
    };
  },
  logout: async (): Promise<{ status: string, message: string }> => {
    sessionStorage.removeItem(KEYS.JWT_TOKEN);
    await idb.clearAuthData();
    return {
      status: "success",
      message: "Logged out successfully"
    };
  },
  getAdminRestaurantDataWithMenu: async (
    token: string,
  ): Promise<{
    status: string;
    message?: string;
    data?: { restaurantData: Restaurant | null; menuData: Dish[]; categoriesData: Category[] };
  }> => {
    if (!token) {
      return {
        status: 'error',
        message: 'token is not provided'
      };
    }
    try {
      const RestaurantCacheData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (RestaurantCacheData) {
        return {
          status: "success",
          data: RestaurantCacheData,
        };
      }
      const response = await fetch("/api/restaurant", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('data', data);
      if (!response.ok) {
        return {
          status: "error",
          data: data.error,
        };
      }
      const cacheData = {
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
    } catch (err: any) {
      return {
        status: "error",
        data: err.message,
      };
    }
  },
  getCategories: async (token: string): Promise<ApiResponse> => {
    try {
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);

      if (cachedData) {
        const parsedData = cachedData as AdminRestaurantCacheData;
        if (parsedData.categoriesData) {
          console.log('Returning categories from cache');
          return {
            status: 'success',
            data: {
              categoriesData: parsedData.categoriesData
            }
          };
        }
      }
      const response = await fetch('/api/category', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to fetch categories',
        };
      }
      const existingData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      const restaurantData = existingData || {};

      restaurantData.categoriesData = data.categoriesData;
      await idb.set(KEYS.ADMIN_RESTAURANT_DATA, restaurantData);

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
        message: 'Network error occurred',
      };
    }
  },

  addCategory: async (token: string, categoryName: string): Promise<{ status: string, message?: string, data?: Category }> => {
    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to add category',
        };
      }
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (cachedData) {
        const parsedData = cachedData;
        if (parsedData.categoriesData) {
          parsedData.categoriesData.push(data.category);
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, parsedData);
        }
      }

      return {
        status: 'success',
        data: data.category
      };
    } catch (error) {
      console.error('Error adding category:', error);
      return {
        status: 'error',
        message: 'Network error occurred',
      };
    }
  },

  updateCategory: async (token: string, categoryId: string, categoryName: string): Promise<{ status: string, message?: string, data?: Category }> => {
    try {
      const response = await fetch('/api/category', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: categoryId, name: categoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to update category',
        };
      }

      // Update IndexedDB
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (cachedData) {
        const parsedData = cachedData;
        if (parsedData.categoriesData) {
          const index = parsedData.categoriesData.findIndex((c: Category) => c.id === categoryId);
          if (index !== -1) {
            parsedData.categoriesData[index] = data.category;
            await idb.set(KEYS.ADMIN_RESTAURANT_DATA, parsedData);
          }
        }
      }

      return {
        status: 'success',
        data: data.category
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        status: 'error',
        message: 'Network error occurred',
      };
    }
  },

  deleteCategory: async (token: string, categoryId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/category', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: categoryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to delete category',
        };
      }

      // Update IndexedDB
      const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
      if (cachedData) {
        const parsedData = cachedData as AdminRestaurantCacheData;
        if (parsedData.categoriesData) {
          parsedData.categoriesData = parsedData.categoriesData.filter((c: Category) => c.id !== categoryId);
          await idb.set(KEYS.ADMIN_RESTAURANT_DATA, parsedData);
        }
      }

      return {
        status: 'success',
        message: 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        status: 'error',
        message: 'Network error occurred',
      };
    }
  },

  changePassword: async (token: string, currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'error',
          message: data.error || 'Failed to change password',
        };
      }

      return {
        status: 'success',
        message: 'Password changed successfully',
        data: { token: data.token }
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        status: 'error',
        message: 'Network error occurred',
      };
    }
  },
};
