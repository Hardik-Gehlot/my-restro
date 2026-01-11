import { db } from './mock-data';

export async function fetchAllRestaurantData(restaurantId: string) {
  const restaurant = await db.getRestaurantById(restaurantId);
  const dishes = await db.getDishesByRestaurant(restaurantId);
  
  return { restaurant, dishes };
}