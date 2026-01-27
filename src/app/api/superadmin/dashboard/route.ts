import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { getServiceRoleClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to verify Superadmin
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

export async function GET(request: NextRequest) {
    const payload = verifySuperadmin(request);
    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized: Superadmin access required' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    try {
        // Fetch all restaurants
        const { data: restaurants, error: restError } = await supabase
            .from('restaurants')
            .select('*')
            .order('plan_expiry', { ascending: true });

        if (restError) throw restError;

        // Fetch all users to count admins
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('role');

        if (userError) throw userError;

        const totalRevenue = restaurants.reduce((acc, r) => acc + (parseFloat(r.plan_amount) || 0), 0);

        const stats = {
            totalRestaurants: restaurants.length,
            totalRevenue,
            plans: {
                free: restaurants.filter(r => !r.active_plan || r.active_plan === 'free').length,
                basic: restaurants.filter(r => r.active_plan === 'basic').length,
                complete: restaurants.filter(r => r.active_plan === 'complete').length,
            }
        };

        return NextResponse.json({
            stats,
            restaurants: restaurants.map(r => ({
                id: r.id,
                name: r.name,
                logo: r.logo,
                active_plan: r.active_plan || 'free',
                plan_expiry: r.plan_expiry,
                planAmount: r.plan_amount,
                mobile_no: r.mobile_no,
                createdAt: r.created_at
            }))
        }, { status: 200 });

    } catch (error: any) {
        console.error('Superadmin Dashboard error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
