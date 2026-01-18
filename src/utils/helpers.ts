import { Restaurant, Dish, db } from "@/lib/mock-data";

export const smoothScrollTo = (y: number, duration: number) => {
  const startY = window.scrollY;
  const distance = y - startY;
  let startTime: number | null = null;

  const step = (currentTime: number) => {
    if (!startTime) {
      startTime = currentTime;
    }
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    window.scrollTo(0, startY + distance * progress);
    if (timeElapsed < duration) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

interface RestaurantCacheData {
  restaurantId: string;
  restaurant: Restaurant;
  menu: Dish[];
  timestamp: number;
}

const CACHE_KEY = "restaurantData";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export const getRestaurantDataWithMenu = async (
  restaurantId: string,
): Promise<{ restaurant: Restaurant | null; menu: Dish[] }> => {
  try {
    // Try to get from localStorage first
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      const parsed: RestaurantCacheData = JSON.parse(cachedData);

      // Check if cached data is for the same restaurant and not expired
      if (parsed.restaurantId === restaurantId) {
        const now = Date.now();
        if (now - parsed.timestamp < CACHE_DURATION) {
          // Return cached data
          return {
            restaurant: parsed.restaurant,
            menu: parsed.menu,
          };
        }
      }
    }

    // If not in cache or expired or different restaurant, fetch from DB
    const [restaurantData, menuData] = await Promise.all([
      db.getRestaurantById(restaurantId),
      db.getDishesByRestaurant(restaurantId),
    ]);

    // Save to localStorage
    if (restaurantData) {
      const cacheData: RestaurantCacheData = {
        restaurantId,
        restaurant: restaurantData,
        menu: menuData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }

    return {
      restaurant: restaurantData,
      menu: menuData,
    };
  } catch (error) {
    console.error("Error in getRestaurantDataWithMenu:", error);
    // If error, try to fetch from DB anyway
    const [restaurantData, menuData] = await Promise.all([
      fetchRestaurant(restaurantId),
      fetchMenu(restaurantId),
    ]);
    return {
      restaurant: restaurantData,
      menu: menuData,
    };
  }
};

export const clearRestaurantCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};