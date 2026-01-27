// ============================================
// Data Injection Script for Supabase
// ============================================
// Run with: npx tsx test-connections.ts

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('\n🚀 Starting Data Injection to Supabase...\n');

// ============================================
// Configuration
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables! Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// Data to Insert
// ============================================

const testRestaurant = {
    name: 'Pizza Paradise',
    tagline: 'Authentic Italian Pizzas & Pasta',
    mobile_no: '9876543210',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
    google_map_link: 'https://maps.google.com/?q=Pizza+Paradise+Mumbai',
    google_rating_link: 'https://g.page/test-review',
    about_us: 'We serve the most authentic wood-fired pizzas in town.',
    active_plan: 'basic',
};

const testUser = {
    email: 'admin@pizzaparadise.com',
    name: 'Paradise Admin',
    role: 'admin',
    // Hash for 'admin123'
    password_hash: '$2b$10$dGq18bgdY46i0S0JYWnksOwA18vWtmb2Xj8ejXxiDIEL2x6z8CaGG',
};

// ============================================
// Execution
// ============================================

async function injectData() {
    try {
        console.log('1️⃣ Inserting/Checking Restaurant...');

        // Use upsert or check if exists to avoid duplicates if needed, 
        // but here we just follow user request for insert.
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .insert(testRestaurant)
            .select()
            .single();

        if (restError) {
            console.error('❌ Failed to insert restaurant:', restError);
            return;
        }

        console.log('✅ Restaurant inserted:', restaurant.name);
        console.log(`   ID: ${restaurant.id}`);

        console.log('\n2️⃣ Inserting Admin User...');
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                ...testUser,
                restaurant_id: restaurant.id
            })
            .select()
            .single();

        if (userError) {
            console.error('❌ Failed to insert user:', userError);
            return;
        }

        console.log('✅ User inserted:', user.email);
        console.log(`   ID: ${user.id}`);
        console.log(`   Linked Restaurant ID: ${user.restaurant_id}`);

        console.log('\n📊 VERIFICATION QUERY');
        console.log('='.repeat(50));

        const { data: result, error: queryError } = await supabase
            .from('users')
            .select(`
                *,
                restaurants (name)
            `)
            .eq('id', user.id)
            .single();

        if (queryError) {
            console.error('❌ Verification query failed:', queryError);
        } else {
            console.log('✅ Data verified! Admin is linked correctly.');
            console.log(JSON.stringify(result, null, 2));
        }

        console.log('\n🎉 Setup complete! You can now login with:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: admin123`);

    } catch (err) {
        console.error('\n💥 Unexpected error:', err);
    }
}

injectData();
