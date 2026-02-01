// ============================================
// Supabase Client Service
// ============================================

import { createClient } from '@supabase/supabase-js';
import { Restaurant, Dish, Category } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const getServiceRoleClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, serviceRoleKey);
};

/**
 * Fetch restaurant data with menu and categories
 * @param restaurantId - Restaurant ID
 */
export const fetchRestaurantWithMenu = async (restaurantId: string) => {
    try {
        // Fetch restaurant (Include ordering fields and plan info)
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select(`
                id, name, tagline, mobile_no, logo, cover_image, google_map_link, google_rating_link, about_us, 
                instagram_link, facebook_link, twitter_link, linkedin_link, youtube_link,
                active_plan, plan_expiry,
                gst_no, cgst_rate, sgst_rate, 
                delivery_charges_type, delivery_charge_fixed, delivery_charge_min, delivery_charge_max, delivery_instruction,
                enabled_services
            `)
            .eq('id', restaurantId)
            .single();

        if (restaurantError) throw restaurantError;
        if (!restaurant) return null;

        // Check plan expiry
        if (restaurant.plan_expiry) {
            const expiryDate = new Date(restaurant.plan_expiry);
            const now = new Date();
            if (expiryDate < now) {
                console.warn(`Restaurant ${restaurant.name} (${restaurantId}) has an expired plan.`);
                return null; // This will trigger a "Not Found" on the frontend
            }
        }

        // Fetch dishes with variations and category details
        const { data: dishes, error: dishesError } = await supabase
            .from('dishes')
            .select(`
                id, restaurant_id, category_id, name, description, image, is_veg, is_available,
                categories (id, name),
                dish_variations (id, size, price)
            `)
            .eq('restaurant_id', restaurantId);

        if (dishesError) throw dishesError;

        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, restaurant_id')
            .eq('restaurant_id', restaurantId);

        if (categoriesError) throw categoriesError;

        // Transform data to match frontend types (using actual column names)
        const menuData: Dish[] = (dishes || []).map((dish: any) => ({
            id: dish.id,
            restaurantId: dish.restaurant_id,
            isVeg: dish.is_veg,
            name: dish.name,
            image: dish.image || '',
            categoryId: dish.category_id,
            category: dish.categories?.name || 'Other',
            description: dish.description || '',
            variations: (dish.dish_variations || []).map((v: any) => ({
                id: v.id,
                size: v.size,
                price: parseFloat(v.price),
            })),
            isAvailable: dish.is_available,
        }));

        const categoriesData: Category[] = (categories || []).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            restaurantId: cat.restaurant_id,
        }));

        const restaurantData: Restaurant = {
            id: restaurant.id,
            name: restaurant.name,
            tagline: restaurant.tagline || '',
            mobile_no: restaurant.mobile_no,
            logo: restaurant.logo || '',
            cover_image: restaurant.cover_image || '',
            google_map_link: restaurant.google_map_link || '',
            google_rating_link: restaurant.google_rating_link || '',
            about_us: restaurant.about_us || '',
            instagram_link: restaurant.instagram_link,
            facebook_link: restaurant.facebook_link,
            twitter_link: restaurant.twitter_link,
            linkedin_link: restaurant.linkedin_link,
            youtube_link: restaurant.youtube_link,
            active_plan: restaurant.active_plan,
            plan_expiry: restaurant.plan_expiry,
            gst_no: restaurant.gst_no,
            cgst_rate: restaurant.cgst_rate,
            sgst_rate: restaurant.sgst_rate,
            delivery_charges_type: restaurant.delivery_charges_type,
            delivery_charge_fixed: restaurant.delivery_charge_fixed,
            delivery_charge_min: restaurant.delivery_charge_min,
            delivery_charge_max: restaurant.delivery_charge_max,
            delivery_instruction: restaurant.delivery_instruction,
            enabled_services: restaurant.enabled_services,
        };

        return {
            restaurantData,
            menuData,
            categoriesData,
        };
    } catch (error) {
        console.error('Error fetching restaurant data from Supabase:', error);
        throw error;
    }
};

/**
 * Update restaurant data
 * @param restaurantId - Restaurant ID
 * @param updates - Restaurant updates
 */
export const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>) => {
    const { data, error } = await supabase
        .from('restaurants')
        .update({
            name: updates.name,
            tagline: updates.tagline,
            mobile_no: updates.mobile_no,
            logo: updates.logo,
            cover_image: updates.cover_image,
            google_map_link: updates.google_map_link,
            google_rating_link: updates.google_rating_link,
            about_us: updates.about_us,
            instagram_link: updates.instagram_link,
            facebook_link: updates.facebook_link,
            twitter_link: updates.twitter_link,
            linkedin_link: updates.linkedin_link,
            youtube_link: updates.youtube_link,
            gst_no: updates.gst_no,
            cgst_rate: updates.cgst_rate,
            sgst_rate: updates.sgst_rate,
            delivery_charges_type: updates.delivery_charges_type,
            delivery_charge_fixed: updates.delivery_charge_fixed,
            delivery_charge_min: updates.delivery_charge_min,
            delivery_charge_max: updates.delivery_charge_max,
            delivery_instruction: updates.delivery_instruction,
            enabled_services: updates.enabled_services,
            updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Add a new category
 */
export const addCategory = async (restaurantId: string, name: string) => {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            restaurant_id: restaurantId,
            name,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update category
 */
export const updateCategory = async (categoryId: string, name: string) => {
    const { data, error } = await supabase
        .from('categories')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) throw error;
};
