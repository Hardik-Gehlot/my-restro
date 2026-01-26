
'use server';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { mockCategories } from '@/lib/mock-data';
import { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    const restaurantCategories = mockCategories.filter(
      c => c.restaurantId === payload!.restaurantId
    );

    return NextResponse.json({
      categories: restaurantCategories
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

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      restaurantId: payload!.restaurantId
    };

    mockCategories.push(newCategory);

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

    const categoryIndex = mockCategories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Verify ownership
    if (mockCategories[categoryIndex].restaurantId !== payload!.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update another restaurant\'s category' },
        { status: 403 }
      );
    }

    // Update category name
    mockCategories[categoryIndex].name = name.trim();

    return NextResponse.json({
      message: 'Category updated successfully',
      category: mockCategories[categoryIndex]
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

    const categoryIndex = mockCategories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Verify ownership
    if (mockCategories[categoryIndex].restaurantId !== payload!.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot delete another restaurant\'s category' },
        { status: 403 }
      );
    }

    mockCategories.splice(categoryIndex, 1);

    return NextResponse.json({
      message: 'Category deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
