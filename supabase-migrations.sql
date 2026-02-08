-- ============================================
-- Supabase Database Schema Migrations
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Restaurants Table
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tagline TEXT,
  mobile_no VARCHAR(10) NOT NULL,
  logo TEXT,
  cover_image TEXT,
  google_map_link TEXT,
  google_rating_link TEXT,
  about_us TEXT,
  instagram_link TEXT,
  facebook_link TEXT,
  twitter_link TEXT,
  linkedin_link TEXT,
  youtube_link TEXT,
  active_plan VARCHAR(50) DEFAULT 'basic',
  plan_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_restaurants_mobile ON restaurants(mobile_no);

-- ============================================
-- 2. Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- ============================================
-- 3. Dishes Table
-- ============================================
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);

-- ============================================
-- 4. Dish Variations Table (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS dish_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL, -- 'half', 'full', 'small', 'medium', 'large', 'price'
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_variations_dish ON dish_variations(dish_id);

-- ============================================
-- 5. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_restaurant ON users(restaurant_id);

-- ============================================
-- Triggers for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for restaurants, dishes, categories, variations
CREATE POLICY "Public can read restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read dishes" ON dishes FOR SELECT USING (true);
CREATE POLICY "Public can read variations" ON dish_variations FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "Authenticated can update restaurants" ON restaurants FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage categories" ON categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage dishes" ON dishes FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage variations" ON dish_variations FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- 6. Coupons Table
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  coupon_code VARCHAR(15) UNIQUE NOT NULL,
  coupon_type VARCHAR(20) NOT NULL CHECK (coupon_type IN ('flat', 'percentage')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
  max_discount_amount DECIMAL(10, 2), -- Only for percentage type
  min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  max_usage_count INTEGER NOT NULL DEFAULT 1 CHECK (max_usage_count > 0),
  current_usage_count INTEGER NOT NULL DEFAULT 0 CHECK (current_usage_count >= 0),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT usage_limit CHECK (current_usage_count <= max_usage_count)
);

-- Add indexes
CREATE INDEX idx_coupons_restaurant ON coupons(restaurant_id);
CREATE INDEX idx_coupons_code ON coupons(coupon_code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public can read active coupons for validation
CREATE POLICY "Public can read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  receipt TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_coupon ON orders(coupon_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public can create orders
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);


alter table orders add column coupon_id UUID;
