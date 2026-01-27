import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWTPayload } from '@/types';
import { getServiceRoleClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';

const verifySuperadmin = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        if (payload.role !== 'superadmin') return null;
        return payload;
    } catch {
        return null;
    }
};

// POST - Create new restaurant and user
export async function POST(request: NextRequest) {
    const payload = verifySuperadmin(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, restaurantName, email, password, mobileNo, bulkData, restaurantId } = body;

    const supabase = getServiceRoleClient();

    try {
        if (action === 'create_single') {
            if (!restaurantName || !email || !password || !mobileNo) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }

            // 1. Create Restaurant
            const { data: restaurant, error: restError } = await supabase
                .from('restaurants')
                .insert({
                    name: restaurantName,
                    mobile_no: mobileNo,
                })
                .select()
                .single();

            if (restError) throw restError;

            // 2. Create Admin User
            const hashedPassword = await bcrypt.hash(password, 10);
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    email: email.toLowerCase(),
                    password_hash: hashedPassword,
                    name: `Admin of ${restaurantName}`,
                    role: 'admin',
                    restaurant_id: restaurant.id
                });

            if (userError) {
                // Cleanup restaurant if user creation fails
                await supabase.from('restaurants').delete().eq('id', restaurant.id);
                throw userError;
            }

            return NextResponse.json({ message: 'Restaurant and admin created successfully', restaurantId: restaurant.id }, { status: 201 });
        }

        if (action === 'bulk_upload_dishes') {
            if (!bulkData || !Array.isArray(bulkData) || !restaurantId) {
                return NextResponse.json({ error: 'Invalid data or missing restaurant ID' }, { status: 400 });
            }

            const results = { count: 0, errors: [] as string[] };

            // Group by category to minimize category creation calls
            const uniqueCategories = [...new Set(bulkData.map(item => item.category || 'General'))] as string[];
            const categoryMap: Record<string, string> = {};

            for (const catName of uniqueCategories) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('restaurant_id', restaurantId)
                    .eq('name', catName)
                    .maybeSingle();

                if (catData) {
                    categoryMap[catName] = catData.id;
                } else {
                    const { data: newCat } = await supabase
                        .from('categories')
                        .insert({ restaurant_id: restaurantId, name: catName })
                        .select()
                        .single();
                    if (newCat) categoryMap[catName] = newCat.id;
                }
            }

            for (const item of bulkData) {
                try {
                    const name = item.name || item.dishName;
                    if (!name) continue;

                    const { data: dish, error: dError } = await supabase
                        .from('dishes')
                        .insert({
                            restaurant_id: restaurantId,
                            category_id: categoryMap[item.category || 'General'],
                            name: name,
                            description: item.description || '',
                            image: item.image || '',
                            is_veg: item.isVeg === 'true' || item.isVeg === true,
                            is_available: true
                        })
                        .select()
                        .single();

                    if (dError) throw dError;

                    // Support variations in bulk upload if provided
                    if (item.price !== undefined) {
                        await supabase.from('dish_variations').insert({
                            dish_id: dish.id,
                            size: item.size || 'price',
                            price: parseFloat(item.price) || 0
                        });
                    }

                    results.count++;
                } catch (e: any) {
                    results.errors.push(`Error for ${item.name || 'Unknown'}: ${e.message}`);
                }
            }

            return NextResponse.json({
                message: `Bulk dish upload completed. Total dishes inserted: ${results.count}`,
                count: results.count,
                errors: results.errors
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Superadmin Restaurant Creation error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
