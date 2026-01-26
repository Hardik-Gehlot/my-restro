export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  restaurantId: string;
}

// To generate these hashes, run:
// const hash = await bcrypt.hash('password123', 10);

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'The Golden Spoon',
    location: '123 Main Street, New York, NY 10001'
  },
  {
    id: 'rest-2',
    name: 'Ocean Blue Bistro',
    location: '456 Harbor Way, Miami, FL 33101'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    // Plain password: "password123"
    password: '$2b$10$USjaj6N/c/qbJn6uJzyndOGBVZef5qQKareEDdJs3ie3rQc3OuTMS',
    restaurantId: 'rest-1'
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    // Plain password: "securePass456"
    password: '$2b$10$USjaj6N/c/qbJn6uJzyndOGBVZef5qQKareEDdJs3ie3rQc3OuTMS',
    restaurantId: 'rest-2'
  }
];