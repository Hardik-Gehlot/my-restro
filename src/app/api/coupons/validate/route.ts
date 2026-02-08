import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-client';
import { validateCouponForOrder, calculateDiscount, Coupon } from '@/utils/coupon-utils';

// POST /api/coupons/validate
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { coupon_code, restaurant_id, order_total } = body;

        if (!coupon_code || !restaurant_id || order_total === undefined) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const upperCouponCode = coupon_code.toUpperCase().trim();
        const supabase = getServiceRoleClient();

        // Fetch coupon from database
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('coupon_code', upperCouponCode)
            .eq('restaurant_id', restaurant_id)
            .single();

        if (error || !coupon) {
            return NextResponse.json(
                { ok: false, error: 'Invalid coupon code' },
                { status: 404 }
            );
        }

        // Validate coupon for the order
        const validation = validateCouponForOrder(coupon as Coupon, parseFloat(order_total));

        if (!validation.valid) {
            return NextResponse.json(
                {
                    ok: false,
                    error: validation.error,
                    amountNeeded: validation.amountNeeded
                },
                { status: 400 }
            );
        }

        // Calculate discount
        const discountAmount = calculateDiscount(coupon as Coupon, parseFloat(order_total));

        // Return coupon details
        return NextResponse.json({
            ok: true,
            data: {
                id: coupon.id,
                coupon_code: coupon.coupon_code,
                coupon_type: coupon.coupon_type,
                discount_value: coupon.discount_value,
                max_discount_amount: coupon.max_discount_amount,
                min_order_value: coupon.min_order_value,
                discount_amount: discountAmount,
            },
        });
    } catch (error) {
        console.error('Error in POST /api/coupons/validate:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
