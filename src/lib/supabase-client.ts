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
        // Fetch restaurant
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();

        if (restaurantError) throw restaurantError;

        // Fetch dishes with variations and category details
        const { data: dishes, error: dishesError } = await supabase
            .from('dishes')
            .select(`
                *,
                categories (name),
                dish_variations (*)
            `)
            .eq('restaurant_id', restaurantId)
            .eq('is_available', true);

        if (dishesError) throw dishesError;

        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .eq('restaurant_id', restaurantId);

        if (categoriesError) throw categoriesError;

        // Transform data to match frontend types
        const menuData: Dish[] = (dishes || []).map((dish: any) => ({
            id: dish.id,
            restaurantId: dish.restaurant_id,
            isVeg: dish.is_veg,
            name: dish.name,
            image: dish.image || '',
            category: dish.categories?.name || 'Other',
            description: dish.description || '',
            variations: (dish.dish_variations || []).map((v: any) => ({
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
            mobileNo: restaurant.mobile_no,
            logo: restaurant.logo || '',
            coverImage: restaurant.cover_image || '',
            googleMapLink: restaurant.google_map_link || '',
            googleRatingLink: restaurant.google_rating_link || '',
            aboutus: restaurant.about_us || '',
            instagramLink: restaurant.instagram_link,
            facebookLink: restaurant.facebook_link,
            twitterLink: restaurant.twitter_link,
            linkedinLink: restaurant.linkedin_link,
            youtubeLink: restaurant.youtube_link,
            active_plan: restaurant.active_plan,
            plan_expiry: restaurant.plan_expiry,
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
            mobile_no: updates.mobileNo,
            logo: updates.logo,
            cover_image: updates.coverImage,
            google_map_link: updates.googleMapLink,
            google_rating_link: updates.googleRatingLink,
            about_us: updates.aboutus,
            instagram_link: updates.instagramLink,
            facebook_link: updates.facebookLink,
            twitter_link: updates.twitterLink,
            linkedin_link: updates.linkedinLink,
            youtube_link: updates.youtubeLink,
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
