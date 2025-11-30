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
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    mapLink?: string;
  };
  phone: string;
  email: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    googleReviews?: string;
  };
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  specialties: string[];
  priceRange: string;
}

// Updated mock data with complete information
const mockRestaurants: Restaurant[] = [
  {
    id: "pizza_paradise_123",
    name: "Pizza Paradise",
    description: "Authentic Italian pizzas with a modern twist. We use fresh, locally-sourced ingredients and traditional wood-fired ovens to create the perfect pizza every time.",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    cuisine: ["Italian", "Fast Food"],
    rating: 4.5,
    totalReviews: 342,
    isActive: true,
    address: {
      street: "Shop 12, Phoenix Mall",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
      mapLink: "https://maps.google.com/?q=Phoenix+Mall+Mumbai"
    },
    phone: "+91-9876543210",
    email: "contact@pizzaparadise.com",
    socialMedia: {
      instagram: "https://instagram.com/pizzaparadise",
      facebook: "https://facebook.com/pizzaparadise",
      googleReviews: "https://www.google.com/maps/search/pizza+paradise"
    },
    openingHours: {
      monday: { open: "11:00", close: "23:00" },
      tuesday: { open: "11:00", close: "23:00" },
      wednesday: { open: "11:00", close: "23:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "00:00" },
      saturday: { open: "11:00", close: "00:00" },
      sunday: { open: "11:00", close: "23:00" }
    },
    specialties: ["Wood-fired Pizza", "Fresh Pasta", "Italian Desserts"],
    priceRange: "₹₹"
  },
  {
    id: "spice_route_456",
    name: "Spice Route",
    description: "Traditional Indian cuisine with royal recipes from across the subcontinent. Experience authentic flavors passed down through generations.",
    logo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop",
    cuisine: ["Indian", "North Indian"],
    rating: 4.8,
    totalReviews: 567,
    isActive: true,
    address: {
      street: "45 MG Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      mapLink: "https://maps.google.com/?q=MG+Road+Bangalore"
    },
    phone: "+91-9123456789",
    email: "hello@spiceroute.com",
    socialMedia: {
      instagram: "https://instagram.com/spiceroute",
      facebook: "https://facebook.com/spiceroute",
      googleReviews: "https://www.google.com/maps/search/spice+route"
    },
    openingHours: {
      monday: { open: "12:00", close: "22:30" },
      tuesday: { open: "12:00", close: "22:30" },
      wednesday: { open: "12:00", close: "22:30" },
      thursday: { open: "12:00", close: "22:30" },
      friday: { open: "12:00", close: "23:30" },
      saturday: { open: "12:00", close: "23:30" },
      sunday: { open: "12:00", close: "22:30" }
    },
    specialties: ["Butter Chicken", "Biryani", "Tandoori"],
    priceRange: "₹₹₹"
  }
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