'use server';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { mockUsers,mockRestaurants, mockDishes } from '@/lib/mock-data';
import { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    const user = mockUsers.find(u => u.id === payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const restaurant = mockRestaurants.find(r => r.id === payload.restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    const dishes = mockDishes.filter(d => d.restaurantId === restaurant.id);
    const { name,email} = user;
    return NextResponse.json({
      user: {name,email},
      restaurantData:restaurant,
      menuData:dishes
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
    const updatedRestaurant = await request.json();

    if (updatedRestaurant.id !== payload.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update another restaurant' },
        { status: 403 }
      );
    }
    const restaurant = mockRestaurants.find(r => r.id === payload.restaurantId);
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    Object.assign(restaurant, updatedRestaurant);

    return NextResponse.json({
      message: 'Restaurant updated successfully',
      restaurant
    }, { status: 200 });

  } catch (error) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}