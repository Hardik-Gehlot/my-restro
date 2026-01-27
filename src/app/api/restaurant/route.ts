import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { getServiceRoleClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7);
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = getServiceRoleClient();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', payload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch restaurant with menu and categories (Optimized column selection)
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select(`
        id, name, tagline, mobile_no, logo, cover_image, google_map_link, google_rating_link, about_us, 
        instagram_link, facebook_link, twitter_link, linkedin_link, youtube_link,
        active_plan, plan_expiry,
        categories (id, name, restaurant_id),
        dishes (
          id, restaurant_id, category_id, name, description, image, is_veg, is_available,
          categories (name),
          dish_variations (id, size, price)
        )
      `)
      .eq('id', payload.restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Transform data to match frontend types
    const menuData = (restaurant.dishes || []).map((dish: any) => ({
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

    const categoriesData = (restaurant.categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      restaurantId: cat.restaurant_id,
    }));

    // Remove relations from restaurantData
    const { dishes, categories, ...restaurantData } = restaurant;

    return NextResponse.json({
      user: user,
      restaurantData: {
        ...restaurantData,
        mobileNo: restaurantData.mobile_no,
        coverImage: restaurantData.cover_image,
        googleMapLink: restaurantData.google_map_link,
        googleRatingLink: restaurantData.google_rating_link,
        aboutus: restaurantData.about_us,
        instagramLink: restaurantData.instagram_link,
        facebookLink: restaurantData.facebook_link,
        twitterLink: restaurantData.twitter_link,
        linkedinLink: restaurantData.linkedin_link,
        youtubeLink: restaurantData.youtube_link,
      },
      menuData,
      categoriesData
    }, { status: 200 });

  } catch (error) {
    console.error('Get restaurant data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let payload: JWTPayload;

    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    if (updatedData.id !== payload.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update another restaurant' },
        { status: 403 }
      );
    }

    const supabase = getServiceRoleClient();

    const { data: restaurant, error: updateError } = await supabase
      .from('restaurants')
      .update({
        name: updatedData.name,
        tagline: updatedData.tagline,
        mobile_no: updatedData.mobileNo,
        logo: updatedData.logo,
        cover_image: updatedData.coverImage,
        google_map_link: updatedData.googleMapLink,
        google_rating_link: updatedData.googleRatingLink,
        about_us: updatedData.aboutus,
        instagram_link: updatedData.instagramLink,
        facebook_link: updatedData.facebookLink,
        twitter_link: updatedData.twitterLink,
        linkedin_link: updatedData.linkedinLink,
        youtube_link: updatedData.youtubeLink,
        active_plan: updatedData.active_plan,
        plan_expiry: updatedData.plan_expiry,
      })
      .eq('id', payload.restaurantId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Restaurant updated successfully',
      restaurant: {
        ...restaurant,
        mobileNo: restaurant.mobile_no,
        aboutus: restaurant.about_us,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}