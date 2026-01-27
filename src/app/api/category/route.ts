import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { getServiceRoleClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';

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

// GET - Fetch all categories for the restaurant
export async function GET(request: NextRequest) {
  try {
    const { payload, error } = verifyToken(request);
    if (error) return error;

    const supabase = getServiceRoleClient();
    const { data: categories, error: dbError } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', payload!.restaurantId);

    if (dbError) {
      console.error('Supabase fetch error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json({
      categories: categories || []
    }, { status: 200 });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const { payload, error } = verifyToken(request);
    if (error) return error;

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();
    const { data: newCategory, error: dbError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        restaurant_id: payload!.restaurantId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Category created successfully',
      category: newCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    const { payload, error } = verifyToken(request);
    if (error) return error;

    const body = await request.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();

    // Verify ownership and update in one go
    const { data: updatedCategory, error: dbError } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('restaurant_id', payload!.restaurantId)
      .select()
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 });
      }
      console.error('Supabase update error:', dbError);
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory
    }, { status: 200 });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const { payload, error } = verifyToken(request);
    if (error) return error;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();

    // Verify ownership and delete
    const { error: dbError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', payload!.restaurantId);

    if (dbError) {
      console.error('Supabase delete error:', dbError);
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Category deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
