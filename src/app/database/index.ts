import {
  RESTAURANT_CACHE_DURATION,
} from "@/lib/common-data";
import { mockDishes, mockRestaurants, mockUsers } from "@/lib/mock-data";
import { supabaseDatabase } from "@/lib/supabase";
import { AdminRestaurantCacheData, ApiResponse, Category, Dish, KEYS, Restaurant, RestaurantCacheData, User } from "@/types";

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
      const cachedData = localStorage.getItem(KEYS.RESTAURANT_DATA);
      if (cachedData) {
        const parsed: RestaurantCacheData = JSON.parse(cachedData);
        if (parsed.restaurantId === restaurantId) {
          const now = Date.now();
          if (now - parsed.timestamp < RESTAURANT_CACHE_DURATION) {
            return {
              restaurant: parsed.restaurant,
              menu: parsed.menu,
            };
          }
        }
      }

      const { restaurantData, menuData } =
        await supabaseDatabase.getRestaurantDataWithMenu(restaurantId);

      if (restaurantData) {
        const cacheData: RestaurantCacheData = {
          restaurantId,
          restaurant: restaurantData,
          menu: menuData,
          timestamp: Date.now(),
        };
        localStorage.setItem(KEYS.RESTAURANT_DATA, JSON.stringify(cacheData));
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
  logout: async():Promise<{status:string,message:string}> => {
    sessionStorage.removeItem(KEYS.JWT_TOKEN);
    localStorage.removeItem(KEYS.ADMIN_RESTAURANT_DATA);
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
        status:'error',
        message:'token is not provided'
      };
    }
    try {
      const RestaurantCacheData = localStorage.getItem(KEYS.ADMIN_RESTAURANT_DATA);
      if (RestaurantCacheData) {
        return {
          status: "success",
          data: JSON.parse(RestaurantCacheData),
        };
      }
      const response = await fetch("/api/restaurant", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('data',data);
      if (!response.ok) {
        return {
          status: "error",
          data: data.error,
        };
      }
      localStorage.setItem(
        KEYS.ADMIN_RESTAURANT_DATA,
        JSON.stringify({
          restaurantData: data.restaurantData,
          menuData: data.menuData,
          categoriesData: data.categoriesData,
          timestamp: Date.now(),
        }),
      );
      return {
        status: "success",
        data:{
          restaurantData: data.restaurantData,
          menuData: data.menuData
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
    const cachedData = localStorage.getItem(KEYS.ADMIN_RESTAURANT_DATA);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData) as AdminRestaurantCacheData;
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
    const existingData = localStorage.getItem(KEYS.RESTAURANT_DATA);
    const restaurantData = existingData ? JSON.parse(existingData) : {};
    
    restaurantData.categoriesData = data.categoriesData;
    localStorage.setItem(KEYS.RESTAURANT_DATA, JSON.stringify(restaurantData));

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

addCategory: async (token: string, categoryName: string): Promise<{status:string,message?:string,data?:Category}> => {
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
    const cachedData = localStorage.getItem(KEYS.RESTAURANT_DATA);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (parsedData.categoriesData) {
        parsedData.categoriesData.push(data.category);
        localStorage.setItem(KEYS.RESTAURANT_DATA, JSON.stringify(parsedData));
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

updateCategory: async (token: string, categoryId: string, categoryName: string): Promise<ApiResponse> => {
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

    // Update localStorage
    const cachedData = localStorage.getItem('restaurant-data');
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (parsedData.categories) {
        const index = parsedData.categories.findIndex((c: Category) => c.id === categoryId);
        if (index !== -1) {
          parsedData.categories[index] = data.category;
          localStorage.setItem('restaurant-data', JSON.stringify(parsedData));
        }
      }
    }

    return {
      status: 'success',
      data: {
        categoriesData: data.category
      }
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

    // Update localStorage
    const cachedData = localStorage.getItem('restaurant-data');
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (parsedData.categories) {
        parsedData.categories = parsedData.categories.filter((c: Category) => c.id !== categoryId);
        localStorage.setItem('restaurant-data', JSON.stringify(parsedData));
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
};
