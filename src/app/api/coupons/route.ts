import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-client';
import { validateCouponCodeFormat } from '@/utils/coupon-utils';

// GET /api/coupons?restaurant_id=<id>
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get('restaurant_id');

        if (!restaurantId) {
            return NextResponse.json(
                { ok: false, error: 'Restaurant ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServiceRoleClient();

        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coupons:', error);
            return NextResponse.json(
                { ok: false, error: 'Failed to fetch coupons' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, data: coupons });
    } catch (error) {
        console.error('Error in GET /api/coupons:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST /api/coupons - Create new coupon
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            restaurant_id,
            coupon_code,
            coupon_type,
            discount_value,
            max_discount_amount,
            min_order_value,
            max_usage_count,
            start_date,
            end_date,
        } = body;

        // Validate required fields
        if (
            !restaurant_id ||
            !coupon_code ||
            !coupon_type ||
            discount_value === undefined ||
            min_order_value === undefined ||
            !max_usage_count ||
            !start_date ||
            !end_date
        ) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert coupon code to uppercase
        const upperCouponCode = coupon_code.toUpperCase();

        // Validate coupon code format
        const codeValidation = validateCouponCodeFormat(upperCouponCode);
        if (!codeValidation.valid) {
            return NextResponse.json(
                { ok: false, error: codeValidation.error },
                { status: 400 }
            );
        }

        // Validate coupon type
        if (!['flat', 'percentage'].includes(coupon_type)) {
            return NextResponse.json(
                { ok: false, error: 'Invalid coupon type' },
                { status: 400 }
            );
        }

        // Validate dates
        const startDateTime = new Date(start_date);
        const endDateTime = new Date(end_date);

        if (endDateTime <= startDateTime) {
            return NextResponse.json(
                { ok: false, error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        const supabase = getServiceRoleClient();

        // Check if coupon code already exists
        const { data: existingCoupon } = await supabase
            .from('coupons')
            .select('id')
            .eq('coupon_code', upperCouponCode)
            .single();

        if (existingCoupon) {
            return NextResponse.json(
                { ok: false, error: 'Coupon code already exists' },
                { status: 400 }
            );
        }

        // Create coupon
        const couponData: any = {
            restaurant_id,
            coupon_code: upperCouponCode,
            coupon_type,
            discount_value: parseFloat(discount_value),
            min_order_value: parseFloat(min_order_value),
            max_usage_count: parseInt(max_usage_count),
            start_date: startDateTime.toISOString(),
            end_date: endDateTime.toISOString(),
            current_usage_count: 0,
            is_active: true,
        };

        // Add max_discount_amount only for percentage type
        if (coupon_type === 'percentage' && max_discount_amount) {
            couponData.max_discount_amount = parseFloat(max_discount_amount);
        }

        const { data: newCoupon, error } = await supabase
            .from('coupons')
            .insert(couponData)
            .select()
            .single();

        if (error) {
            console.error('Error creating coupon:', error);
            return NextResponse.json(
                { ok: false, error: 'Failed to create coupon' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, data: newCoupon });
    } catch (error) {
        console.error('Error in POST /api/coupons:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PUT /api/coupons - Update existing coupon
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            coupon_code,
            coupon_type,
            discount_value,
            max_discount_amount,
            min_order_value,
            max_usage_count,
            start_date,
            end_date,
            is_active,
        } = body;

        if (!id) {
            return NextResponse.json(
                { ok: false, error: 'Coupon ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServiceRoleClient();

        // Get existing coupon
        const { data: existingCoupon, error: fetchError } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingCoupon) {
            return NextResponse.json(
                { ok: false, error: 'Coupon not found' },
                { status: 404 }
            );
        }

        const updateData: any = {};

        // Update coupon code if changed
        if (coupon_code && coupon_code !== existingCoupon.coupon_code) {
            const upperCouponCode = coupon_code.toUpperCase();

            const codeValidation = validateCouponCodeFormat(upperCouponCode);
            if (!codeValidation.valid) {
                return NextResponse.json(
                    { ok: false, error: codeValidation.error },
                    { status: 400 }
                );
            }

            // Check if new code already exists
            const { data: duplicateCoupon } = await supabase
                .from('coupons')
                .select('id')
                .eq('coupon_code', upperCouponCode)
                .neq('id', id)
                .single();

            if (duplicateCoupon) {
                return NextResponse.json(
                    { ok: false, error: 'Coupon code already exists' },
                    { status: 400 }
                );
            }

            updateData.coupon_code = upperCouponCode;
        }

        if (coupon_type) updateData.coupon_type = coupon_type;
        if (discount_value !== undefined) updateData.discount_value = parseFloat(discount_value);
        if (min_order_value !== undefined) updateData.min_order_value = parseFloat(min_order_value);
        if (max_usage_count !== undefined) updateData.max_usage_count = parseInt(max_usage_count);
        if (is_active !== undefined) updateData.is_active = is_active;

        if (coupon_type === 'percentage' && max_discount_amount !== undefined) {
            updateData.max_discount_amount = max_discount_amount ? parseFloat(max_discount_amount) : null;
        }

        if (start_date) updateData.start_date = new Date(start_date).toISOString();
        if (end_date) updateData.end_date = new Date(end_date).toISOString();

        // Validate dates if both are provided
        if (updateData.start_date && updateData.end_date) {
            if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
                return NextResponse.json(
                    { ok: false, error: 'End date must be after start date' },
                    { status: 400 }
                );
            }
        }

        const { data: updatedCoupon, error } = await supabase
            .from('coupons')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating coupon:', error);
            return NextResponse.json(
                { ok: false, error: 'Failed to update coupon' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, data: updatedCoupon });
    } catch (error) {
        console.error('Error in PUT /api/coupons:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE /api/coupons?id=<id>
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { ok: false, error: 'Coupon ID is required' },
                { status: 400 }
            );
        }

        const supabase = getServiceRoleClient();

        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting coupon:', error);
            return NextResponse.json(
                { ok: false, error: 'Failed to delete coupon' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error in DELETE /api/coupons:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
