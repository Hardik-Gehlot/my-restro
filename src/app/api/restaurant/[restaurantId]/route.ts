import { NextRequest, NextResponse } from 'next/server';
import { fetchRestaurantWithMenu } from '@/lib/supabase-client';

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
        const { restaurantId } = params;

        if (!restaurantId) {
            return NextResponse.json(
                { error: 'Restaurant ID is required' },
                { status: 400 }
            );
        }

        // Fetch from Supabase
        const data = await fetchRestaurantWithMenu(restaurantId);

        if (!data || !data.restaurantData) {
            return NextResponse.json(
                { error: 'Restaurant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('API Route - Error fetching restaurant data:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
