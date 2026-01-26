import { db } from "@/app/database";
import { Dish, Restaurant } from "@/types";

export const supabaseDatabase = {
    getRestaurantDataWithMenu: async (restaurantId: string): Promise<{ restaurantData: Restaurant | null; menuData: Dish[] }> =>{
        try {
            const [restaurantData, menuData] = await Promise.all([ 
                db.getRestaurantById(restaurantId), 
                db.getDishesByRestaurant(restaurantId)]
            );
            return {
                restaurantData,
                menuData
            }
        }catch(error){
            console.error("Error in getRestaurantDataWithMenu:", error);
            return {
                restaurantData:null,
                menuData: []
            }
        }
    },
    getAdminRestaurantDataWithMenu: async (): Promise<{ restaurantData: Restaurant | null; menuData: Dish[] }> =>{
        try {
            const [restaurantData, menuData] = await Promise.all([ 
                db.getRestaurantById(restaurantId), 
                db.getDishesByRestaurant(restaurantId)]
            );
            return {
                restaurantData,
                menuData
            }
        }catch(error){
            console.error("Error in getRestaurantDataWithMenu:", error);
            return {
                restaurantData:null,
                menuData: []
            }
        }
    }
}