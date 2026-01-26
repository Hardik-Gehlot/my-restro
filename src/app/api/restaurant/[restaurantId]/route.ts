import { NextRequest, NextResponse } from 'next/server';
import { mockRestaurants, mockDishes, mockCategories } from '@/lib/mock-data';

/**
 * GET /api/restaurant/[restaurantId]
 * Public endpoint to fetch restaurant data with menu
 * No authentication required
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ restaurantId: string }> | { restaurantId: string } }
) {
    try {
        // Handle both Promise and direct params (Next.js 15+ compatibility)
        const params = await Promise.resolve(context.params);
        console.log('API Route - params:', params);

        const { restaurantId } = params;
        console.log('API Route - restaurantId:', restaurantId);

        if (!restaurantId) {
            console.error('API Route - No restaurantId provided');
            return NextResponse.json(
                { error: 'Restaurant ID is required' },
                { status: 400 }
            );
        }

        // Find restaurant
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        console.log('API Route - Found restaurant:', restaurant?.name || 'NOT FOUND');

        if (!restaurant) {
            return NextResponse.json(
                { error: 'Restaurant not found' },
                { status: 404 }
            );
        }

        // Get menu items for this restaurant
        const menuData = mockDishes.filter(dish => dish.restaurantId === restaurantId);
        console.log('API Route - Menu items count:', menuData.length);

        // Get categories for this restaurant (optional, for future use)
        const categoriesData = mockCategories.filter(cat => cat.restaurantId === restaurantId);

        return NextResponse.json({
            restaurantData: restaurant,
            menuData,
            categoriesData
        }, { status: 200 });

    } catch (error) {
        console.error('API Route - Error fetching restaurant data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
