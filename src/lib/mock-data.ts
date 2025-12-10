// ==========================================
// FILE: src/lib/mock-data.ts
// Complete Mock Data for Restaurants & Dishes
// ==========================================

// ==========================================
// INTERFACES
// ==========================================

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  mobileNo: string;
  logo: string;
  coverImage: string;
  googleMapLink: string;
  googleRatingLink: string;
  aboutus: string;
}

export interface DishVariation {
  size: 'half' | 'full' | 'small' | 'medium' | 'large';
  price: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  isVeg: boolean;
  name: string;
  image: string;
  category: string;
  description: string;
  variations: DishVariation[];
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  advertiser: string;
  isActive: boolean;
  position: string;  // Changed: 'rest-1', 'rest-2', 'menu-1', 'home-1', etc.
  targetAudience?: string[];
  impressions: number;
  clicks: number;
}

// ==========================================
// RESTAURANT DATA (3 Restaurants)
// ==========================================

const mockRestaurants: Restaurant[] = [
  {
    id: "pizza_paradise_123",
    name: "Pizza Paradise",
    tagline: "Authentic Italian Pizzas & Pasta",
    mobileNo: "+91-9876543210",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Pizza+Paradise+Mumbai",
    googleRatingLink: "https://www.google.com/maps/search/Pizza+Paradise/@19.0760,72.8777,12z",
    aboutus: "empty"
  },
  {
    id: "spice_route_456",
    name: "Spice Route",
    tagline: "Royal Indian Cuisine",
    mobileNo: "+91-9123456789",
    logo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Spice+Route+Bangalore",
    googleRatingLink: "https://www.google.com/maps/search/Spice+Route/@12.9716,77.5946,12z",
    aboutus: "empty"
  },
  {
    id: "burger_hub_789",
    name: "Burger Hub",
    tagline: "Gourmet Burgers & Shakes",
    mobileNo: "+91-9988776655",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Burger+Hub+Delhi",
    googleRatingLink: "https://www.google.com/maps/search/Burger+Hub/@28.7041,77.1025,12z",
    aboutus: "empty"
  }
];

// ==========================================
// DISHES DATA
// ==========================================

const mockDishes: Dish[] = [
  // ========================================
  // PIZZA PARADISE - 3 Dishes
  // ========================================
  {
    id: "dish_001",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Margherita Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Pizza",
    description: "Classic Italian pizza with San Marzano tomatoes, fresh mozzarella, basil leaves, and extra virgin olive oil on a wood-fired crust.",
    variations: [
      { size: "small", price: 249 },
      { size: "medium", price: 349 },
      { size: "large", price: 449 }
    ]
  },
  {
    id: "dish_002",
    restaurantId: "pizza_paradise_123",
    isVeg: false,
    name: "Pepperoni Feast",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Pizza",
    description: "Loaded with premium pepperoni slices, mozzarella cheese, oregano, and our signature pizza sauce.",
    variations: [
      { size: "small", price: 299 },
      { size: "medium", price: 449 },
      { size: "large", price: 549 }
    ]
  },
  {
    id: "dish_003",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Pasta Alfredo",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    category: "Pasta",
    description: "Creamy fettuccine pasta tossed in rich Alfredo sauce with parmesan cheese and Italian herbs.",
    variations: [
      { size: "half", price: 199 },
      { size: "full", price: 329 }
    ]
  },

  // ========================================
  // SPICE ROUTE - 3 Dishes
  // ========================================
  {
    id: "dish_004",
    restaurantId: "spice_route_456",
    isVeg: false,
    name: "Butter Chicken",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop",
    category: "Main Course",
    description: "Tender chicken pieces cooked in a creamy tomato gravy with butter, cream, and aromatic spices. A North Indian classic.",
    variations: [
      { size: "half", price: 299 },
      { size: "full", price: 479 }
    ]
  },
  {
    id: "dish_005",
    restaurantId: "spice_route_456",
    isVeg: true,
    name: "Paneer Tikka Masala",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop",
    category: "Main Course",
    description: "Grilled cottage cheese cubes in a rich, spiced tomato-onion gravy with bell peppers and aromatic Indian spices.",
    variations: [
      { size: "half", price: 249 },
      { size: "full", price: 399 }
    ]
  },
  {
    id: "dish_006",
    restaurantId: "spice_route_456",
    isVeg: false,
    name: "Biryani Hyderabadi",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    category: "Rice",
    description: "Fragrant basmati rice layered with marinated chicken, saffron, fried onions, and traditional Hyderabadi spices. Served with raita.",
    variations: [
      { size: "half", price: 249 },
      { size: "full", price: 429 }
    ]
  },

  // ========================================
  // BURGER HUB - 15+ Dishes
  // ========================================
  {
    id: "dish_007",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Classic Beef Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    category: "Burgers",
    description: "Juicy beef patty with lettuce, tomato, onions, pickles, cheese, and our special sauce in a toasted sesame bun.",
    variations: [
      { size: "small", price: 179 },
      { size: "medium", price: 249 },
      { size: "large", price: 329 }
    ]
  },
  {
    id: "dish_008",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Veggie Delight Burger",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=400&fit=crop",
    category: "Burgers",
    description: "Crispy vegetable patty with fresh lettuce, tomatoes, grilled onions, cheese, and mayo in a whole wheat bun.",
    variations: [
      { size: "small", price: 149 },
      { size: "medium", price: 199 },
      { size: "large", price: 269 }
    ]
  },
  {
    id: "dish_009",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Spicy Chicken Burger",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop",
    category: "Burgers",
    description: "Crispy fried chicken breast with spicy mayo, jalapeños, lettuce, and cheese in a brioche bun.",
    variations: [
      { size: "small", price: 169 },
      { size: "medium", price: 229 },
      { size: "large", price: 299 }
    ]
  },
  {
    id: "dish_010",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "BBQ Bacon Burger",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    category: "Burgers",
    description: "Beef patty topped with crispy bacon, BBQ sauce, cheddar cheese, onion rings, and coleslaw.",
    variations: [
      { size: "medium", price: 279 },
      { size: "large", price: 369 }
    ]
  },
  {
    id: "dish_011",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Paneer Tikka Burger",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop",
    category: "Burgers",
    description: "Grilled paneer tikka patty with mint chutney, onions, tomatoes, and lettuce in a tandoori bun.",
    variations: [
      { size: "small", price: 159 },
      { size: "medium", price: 219 },
      { size: "large", price: 289 }
    ]
  },
  {
    id: "dish_012",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "French Fries",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&h=400&fit=crop",
    category: "Sides",
    description: "Crispy golden french fries seasoned with salt and herbs. Perfect side for your burger!",
    variations: [
      { size: "small", price: 79 },
      { size: "medium", price: 99 },
      { size: "large", price: 129 }
    ]
  },
  {
    id: "dish_013",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Loaded Cheese Fries",
    image: "https://images.unsplash.com/photo-1630431341973-02e1b1c46993?w=600&h=400&fit=crop",
    category: "Sides",
    description: "Crispy fries loaded with melted cheese sauce, jalapeños, and spring onions.",
    variations: [
      { size: "medium", price: 149 },
      { size: "large", price: 199 }
    ]
  },
  {
    id: "dish_014",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Chicken Wings",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop",
    category: "Sides",
    description: "Crispy fried chicken wings tossed in your choice of BBQ, Buffalo, or Peri-Peri sauce.",
    variations: [
      { size: "small", price: 179 },
      { size: "medium", price: 249 },
      { size: "large", price: 329 }
    ]
  },
  {
    id: "dish_015",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Onion Rings",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop",
    category: "Sides",
    description: "Crispy battered onion rings served with tangy dipping sauce.",
    variations: [
      { size: "small", price: 99 },
      { size: "medium", price: 139 }
    ]
  },
  {
    id: "dish_016",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Chocolate Shake",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop",
    category: "Beverages",
    description: "Thick and creamy chocolate milkshake topped with whipped cream and chocolate syrup.",
    variations: [
      { size: "small", price: 119 },
      { size: "medium", price: 149 },
      { size: "large", price: 189 }
    ]
  },
  {
    id: "dish_017",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Strawberry Shake",
    image: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=600&h=400&fit=crop",
    category: "Beverages",
    description: "Fresh strawberry milkshake blended with vanilla ice cream and topped with whipped cream.",
    variations: [
      { size: "small", price: 129 },
      { size: "medium", price: 159 },
      { size: "large", price: 199 }
    ]
  },
  {
    id: "dish_018",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Mango Smoothie",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=400&fit=crop",
    category: "Beverages",
    description: "Refreshing mango smoothie made with fresh mangoes, yogurt, and a touch of honey.",
    variations: [
      { size: "small", price: 119 },
      { size: "medium", price: 149 }
    ]
  },
  {
    id: "dish_019",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Caesar Salad",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    category: "Salads",
    description: "Fresh romaine lettuce, croutons, parmesan cheese, and Caesar dressing.",
    variations: [
      { size: "small", price: 149 },
      { size: "large", price: 229 }
    ]
  },
  {
    id: "dish_020",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&h=400&fit=crop",
    category: "Salads",
    description: "Mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and balsamic vinaigrette.",
    variations: [
      { size: "small", price: 199 },
      { size: "large", price: 279 }
    ]
  },
  {
    id: "dish_021",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Cheese Nachos",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=400&fit=crop",
    category: "Appetizers",
    description: "Crispy tortilla chips topped with melted cheese, jalapeños, salsa, and sour cream.",
    variations: [
      { size: "small", price: 159 },
      { size: "medium", price: 219 },
      { size: "large", price: 289 }
    ]
  },
  {
    id: "dish_022",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Brownie Sundae",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
    category: "Desserts",
    description: "Warm chocolate brownie topped with vanilla ice cream, chocolate sauce, and nuts.",
    variations: [
      { size: "small", price: 129 },
      { size: "large", price: 189 }
    ]
  }
];

// ==========================================
// ADVERTISEMENT DATA
// ==========================================

const mockAdvertisements: Advertisement[] = [
  {
    id: "ad_001",
    title: "Get 50% Off on First Order!",
    description: "Download FoodHub app and get exclusive discounts on your favorite restaurants",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=300&fit=crop",
    ctaText: "Download Now",
    ctaLink: "https://example.com/foodhub-app",
    advertiser: "FoodHub",
    isActive: true,
    position: "rest-1", // Top of restaurant page
    targetAudience: ["food-lovers", "app-users"],
    impressions: 15420,
    clicks: 892
  },
  {
    id: "ad_002",
    title: "Premium Kitchen Appliances - Up to 40% Off",
    description: "Upgrade your kitchen with latest appliances from KitchenPro",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=300&fit=crop",
    ctaText: "Shop Now",
    ctaLink: "https://example.com/kitchenpro",
    advertiser: "KitchenPro",
    isActive: true,
    position: "rest-2", // Mid-section of restaurant page
    targetAudience: ["restaurant-owners", "chefs"],
    impressions: 8765,
    clicks: 543
  },
  {
    id: "ad_003",
    title: "Master Chef Cooking Classes",
    description: "Learn professional cooking techniques from expert chefs. Join now!",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=300&fit=crop",
    ctaText: "Enroll Today",
    ctaLink: "https://example.com/cooking-classes",
    advertiser: "CulinaryAcademy",
    isActive: true,
    position: "menu-1", // Menu page top
    targetAudience: ["food-enthusiasts", "home-cooks"],
    impressions: 12340,
    clicks: 678
  },
  {
    id: "ad_004",
    title: "Fresh Ingredients Delivered Daily",
    description: "Farm-fresh vegetables and premium ingredients at your doorstep",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    ctaText: "Order Now",
    ctaLink: "https://example.com/fresh-delivery",
    advertiser: "FreshFarm",
    isActive: true,
    position: "home-1", // Homepage
    targetAudience: ["health-conscious", "organic-lovers"],
    impressions: 9876,
    clicks: 432
  }
];

// ==========================================
// DATABASE FUNCTIONS
// ==========================================

export const db = {
  // Get all restaurants
  getRestaurants: async (): Promise<Restaurant[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRestaurants;
  },

  // Get restaurant by ID
  getRestaurantById: async (id: string): Promise<Restaurant | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRestaurants.find(r => r.id === id) || null;
  },

  // Get dishes by restaurant ID
  getDishesByRestaurant: async (restaurantId: string): Promise<Dish[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDishes.filter(d => d.restaurantId === restaurantId);
  },

  // Get dish by ID
  getDishById: async (id: string): Promise<Dish | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDishes.find(d => d.id === id) || null;
  },

  // Search dishes
  searchDishes: async (restaurantId: string, query: string): Promise<Dish[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockDishes.filter(d => 
      d.restaurantId === restaurantId &&
      (d.name.toLowerCase().includes(lowerQuery) ||
       d.description.toLowerCase().includes(lowerQuery) ||
       d.category.toLowerCase().includes(lowerQuery))
    );
  },

  // Filter dishes by category
  getDishesByCategory: async (restaurantId: string, category: string): Promise<Dish[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDishes.filter(d => 
      d.restaurantId === restaurantId && 
      d.category === category
    );
  },

  // Filter dishes by veg/non-veg
  getDishesByVegType: async (restaurantId: string, isVeg: boolean): Promise<Dish[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDishes.filter(d => 
      d.restaurantId === restaurantId && 
      d.isVeg === isVeg
    );
  },

  // Get all unique categories for a restaurant
  getCategories: async (restaurantId: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const dishes = mockDishes.filter(d => d.restaurantId === restaurantId);
    const categories = [...new Set(dishes.map(d => d.category))];
    return categories;
  },

  // Get advertisements
  getAdvertisements: async (position?: 'top' | 'sidebar' | 'bottom'): Promise<Advertisement[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let ads = mockAdvertisements.filter(ad => ad.isActive);
    
    if (position) {
      ads = ads.filter(ad => ad.position === position);
    }
    
    return ads.sort(() => Math.random() - 0.5);
  },

  // Track ad impression
  trackAdImpression: async (adId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAdvertisements.find(a => a.id === adId);
    if (ad) {
      ad.impressions++;
      console.log(`Ad impression tracked: ${adId}`);
    }
  },

  // Track ad click
  trackAdClick: async (adId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAdvertisements.find(a => a.id === adId);
    if (ad) {
      ad.clicks++;
      console.log(`Ad click tracked: ${adId}`);
    }
  },
};

// ==========================================
// EXPORT SUMMARY
// ==========================================

/*
SUMMARY OF MOCK DATA:

RESTAURANTS (3):
1. Pizza Paradise (pizza_paradise_123) - 3 dishes
2. Spice Route (spice_route_456) - 3 dishes  
3. Burger Hub (burger_hub_789) - 16 dishes

TOTAL DISHES: 22

CATEGORIES:
- Pizza (2 dishes)
- Pasta (1 dish)
- Main Course (2 dishes)
- Rice (1 dish)
- Burgers (5 dishes)
- Sides (4 dishes)
- Beverages (3 dishes)
- Salads (2 dishes)
- Appetizers (1 dish)
- Desserts (1 dish)

PRICE VARIATIONS:
- Half/Full (for Indian dishes)
- Small/Medium/Large (for pizzas, burgers, sides, beverages)

VEG vs NON-VEG:
- Vegetarian dishes: 14
- Non-vegetarian dishes: 8
*/