export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  restaurantId: string;
  name: string;
  role: "admin";
  createdAt: string;
}
export interface JWTPayload {
  userId: string;
  email: string;
  restaurantId: string;
}
export interface RestaurantCacheData {
  restaurantData: Restaurant;
  menuData: Dish[];
  timestamp: number;
}
export interface AdminRestaurantCacheData {
  restaurantData: Restaurant;
  menuData: Dish[];
  categoriesData: Category[];
  timestamp: number;
}
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
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  linkedinLink?: string;
  youtubeLink?: string;
  active_pan?:string;
  plan_expiry?:string;
}

export interface DishVariation {
  size: "half" | "full" | "small" | "medium" | "large" | "price";
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
  isAvailable: boolean;
}

export interface ApiResponse {
  status: string;
  message?: string;
  data?: {
    restaurantData?: Restaurant | null;
    menuData?: Dish[];
    categoriesData?: Category[];
  };
}

export enum KEYS{
  RESTAURANT_DATA="restaurant_data",
  ADMIN_RESTAURANT_DATA="admin_restaurant_data",
  JWT_TOKEN="jwt_token"
}

export interface Category {
  id: string;
  name: string;
  restaurantId: string;
}