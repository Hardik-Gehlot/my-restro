export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  cuisine: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
}

// Mock data
const mockRestaurants: Restaurant[] = [
  {
    id: "pizza_paradise_123",
    name: "Pizza Paradise",
    description: "Authentic Italian pizzas with a modern twist",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
    cuisine: ["Italian", "Fast Food"],
    rating: 4.5,
    totalReviews: 342,
    isActive: true,
  },
  {
    id: "spice_route_456",
    name: "Spice Route",
    description: "Traditional Indian cuisine with royal recipes",
    logo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop",
    cuisine: ["Indian", "North Indian"],
    rating: 4.8,
    totalReviews: 567,
    isActive: true,
  },
  {
    id: "sushi_master_789",
    name: "Sushi Master",
    description: "Fresh sushi and Japanese delicacies",
    logo: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop",
    cuisine: ["Japanese", "Sushi"],
    rating: 4.7,
    totalReviews: 289,
    isActive: true,
  },
  {
    id: "burger_barn_012",
    name: "Burger Barn",
    description: "Gourmet burgers made with premium ingredients",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
    cuisine: ["American", "Fast Food"],
    rating: 4.3,
    totalReviews: 421,
    isActive: true,
  },
];

// Database functions (mock implementations)
export const db = {
  // Get all featured restaurants
  getFeaturedRestaurants: async (): Promise<Restaurant[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRestaurants.filter(r => r.isActive);
  },

  // Get restaurants by cuisine type
  getRestaurantsByCuisine: async (cuisine: string): Promise<Restaurant[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRestaurants.filter(r => 
      r.cuisine.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
    );
  },

  // Search restaurants
  searchRestaurants: async (query: string): Promise<Restaurant[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockRestaurants.filter(r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description.toLowerCase().includes(lowerQuery) ||
      r.cuisine.some(c => c.toLowerCase().includes(lowerQuery))
    );
  },

  // Get restaurant by ID
  getRestaurantById: async (id: string): Promise<Restaurant | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRestaurants.find(r => r.id === id) || null;
  },
};