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

// PUT - Update plan, expiry, or reset password
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = verifySuperadmin(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: restaurantId } = await params;
    const body = await request.json();
    const { action, plan, expiryDate, newPassword, planAmount } = body;

    const supabase = getServiceRoleClient();

    try {
        if (action === 'update_plan') {
            const { data, error } = await supabase
                .from('restaurants')
                .update({
                    active_plan: plan,
                    plan_expiry: expiryDate,
                    plan_amount: planAmount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', restaurantId)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ message: 'Plan updated successfully', data });
        }

        if (action === 'reset_password') {
            if (!newPassword) return NextResponse.json({ error: 'New password is required' }, { status: 400 });

            // 1. Find the admin user for this restaurant
            // Try role='admin' first, fallback to any user for this restaurant
            let { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('role', 'admin')
                .maybeSingle();

            if (!user) {
                const { data: fallbackUser, error: fallbackError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('restaurant_id', restaurantId)
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                user = fallbackUser;
                userError = fallbackError;
            }

            if (userError || !user) return NextResponse.json({ error: 'No user account found for this restaurant' }, { status: 404 });

            // 2. Hash and update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) throw updateError;
            return NextResponse.json({ message: 'Password reset successfully' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Superadmin Restaurant Action error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
