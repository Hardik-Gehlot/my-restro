import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { getServiceRoleClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// Helper function to verify token
const verifyToken = (request: NextRequest): { payload: JWTPayload | null; error: NextResponse | null } => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            payload: null,
            error: NextResponse.json({ error: 'No token provided' }, { status: 401 })
        };
    }

    const token = authHeader.substring(7);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return { payload, error: null };
    } catch (err) {
        return {
            payload: null,
            error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        };
    }
};

// POST - Add a new dish
export async function POST(request: NextRequest) {
    try {
        const { payload, error } = verifyToken(request);
        if (error) return error;

        const body = await request.json();
        const { name, isVeg, image, categoryId, description, variations, isAvailable } = body;

        const supabase = getServiceRoleClient();

        // 1. Insert dish
        const { data: dish, error: dishError } = await supabase
            .from('dishes')
            .insert({
                name,
                restaurant_id: payload!.restaurantId,
                category_id: categoryId,
                description,
                image,
                is_veg: isVeg,
                is_available: isAvailable
            })
            .select(`
                *,
                categories (name)
            `)
            .single();

        if (dishError) {
            console.error('Supabase dish insert error:', dishError);
            return NextResponse.json({ error: 'Failed to add dish' }, { status: 500 });
        }

        // 2. Insert variations if any
        if (variations && Array.isArray(variations) && variations.length > 0) {
            const variationsToInsert = variations.map(v => ({
                dish_id: dish.id,
                size: v.size,
                price: v.price
            }));

            const { error: varError } = await supabase
                .from('dish_variations')
                .insert(variationsToInsert);

            if (varError) {
                console.error('Supabase variation insert error:', varError);
            }
        }

        return NextResponse.json({
            message: 'Dish added successfully',
            dish: {
                ...dish,
                isVeg: dish.is_veg,
                isAvailable: dish.is_available,
                categoryId: dish.category_id,
                category: (dish as any).categories?.name || 'Other',
                variations: variations || []
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Add dish error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update a dish
export async function PUT(request: NextRequest) {
    try {
        const { payload, error } = verifyToken(request);
        if (error) return error;

        const body = await request.json();
        const { id, name, isVeg, image, categoryId, description, variations, isAvailable } = body;

        if (!id) {
            return NextResponse.json({ error: 'Dish ID is required' }, { status: 400 });
        }

        const supabase = getServiceRoleClient();

        // 1. Update dish and verify ownership
        const { data: dish, error: dishError } = await supabase
            .from('dishes')
            .update({
                name,
                category_id: categoryId,
                description,
                image,
                is_veg: isVeg,
                is_available: isAvailable
            })
            .eq('id', id)
            .eq('restaurant_id', payload!.restaurantId)
            .select(`
                *,
                categories (name)
            `)
            .single();

        if (dishError) {
            if (dishError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Dish not found or unauthorized' }, { status: 404 });
            }
            console.error('Supabase dish update error:', dishError);
            return NextResponse.json({ error: 'Failed to update dish' }, { status: 500 });
        }

        // 2. Update variations (delete and re-insert for simplicity)
        if (variations && Array.isArray(variations)) {
            // Delete existing variations
            await supabase.from('dish_variations').delete().eq('dish_id', id);

            // Insert new variations
            if (variations.length > 0) {
                const variationsToInsert = variations.map(v => ({
                    dish_id: id,
                    size: v.size,
                    price: v.price
                }));

                await supabase.from('dish_variations').insert(variationsToInsert);
            }
        }

        return NextResponse.json({
            message: 'Dish updated successfully',
            dish: {
                ...dish,
                isVeg: dish.is_veg,
                isAvailable: dish.is_available,
                categoryId: dish.category_id,
                category: (dish as any).categories?.name || 'Other',
                variations: variations || []
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Update dish error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a dish
export async function DELETE(request: NextRequest) {
    try {
        const { payload, error } = verifyToken(request);
        if (error) return error;

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Dish ID is required' }, { status: 400 });
        }

        const supabase = getServiceRoleClient();

        // Verify ownership and delete
        const { error: dbError } = await supabase
            .from('dishes')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', payload!.restaurantId);

        if (dbError) {
            console.error('Supabase delete error:', dbError);
            return NextResponse.json({ error: 'Failed to delete dish' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Dish deleted successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Delete dish error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
