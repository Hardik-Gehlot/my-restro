// // This is a demonstration of the Next.js project structure with actual bcrypt and jsonwebtoken implementation
// // Note: This artifact shows the code structure. In a real Next.js project, files would be organized in separate directories.

// // ============================================
// // File: types/index.ts
// // ============================================

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   password: string;
//   restaurantId: string;
// }

// export interface Restaurant {
//   id: string;
//   name: string;
//   location: string;
// }

// export interface JWTPayload {
//   userId: string;
//   email: string;
//   restaurantId: string;
// }

// // ============================================
// // File: lib/mockData.ts
// // ============================================

// import bcrypt from 'bcrypt';

// // To generate these hashes, run:
// // const hash = await bcrypt.hash('password123', 10);

// export const MOCK_RESTAURANTS: Restaurant[] = [
//   {
//     id: 'rest-1',
//     name: 'The Golden Spoon',
//     location: '123 Main Street, New York, NY 10001'
//   },
//   {
//     id: 'rest-2',
//     name: 'Ocean Blue Bistro',
//     location: '456 Harbor Way, Miami, FL 33101'
//   }
// ];

// export const MOCK_USERS: User[] = [
//   {
//     id: 'user-1',
//     name: 'John Doe',
//     email: 'john@example.com',
//     // Plain password: "password123"
//     password: '$2b$10$YKZvVXq8Z9Y7J7Q8L9Z7JeZ7J7Q8L9Z7J7Q8L9Z7J7Q8L9Z7J7Q8Lu',
//     restaurantId: 'rest-1'
//   },
//   {
//     id: 'user-2',
//     name: 'Jane Smith',
//     email: 'jane@example.com',
//     // Plain password: "securePass456"
//     password: '$2b$10$sLaWxYr9a0Z8K8R9M0a8KeM0a8K8R9M0a8K8R9M0a8K8R9M0a8K8Rm',
//     restaurantId: 'rest-2'
//   }
// ];

// // ============================================
// // File: app/api/auth/login/route.ts
// // ============================================

// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { MOCK_USERS } from '@/lib/mockData';
// import { JWTPayload } from '@/types';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Find user by email
//     const user = MOCK_USERS.find(u => u.email === email);
    
//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Verify password using bcrypt
//     const isPasswordValid = await bcrypt.compare(password, user.password);
    
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Create JWT token with 1 hour expiry
//     const payload: JWTPayload = {
//       userId: user.id,
//       email: user.email,
//       restaurantId: user.restaurantId
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

//     return NextResponse.json({ token }, { status: 200 });
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // ============================================
// // File: app/api/restaurant/route.ts
// // ============================================

// import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { MOCK_USERS, MOCK_RESTAURANTS } from '@/lib/mockData';
// import { JWTPayload } from '@/types';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// export async function GET(request: NextRequest) {
//   try {
//     // Get token from Authorization header
//     const authHeader = request.headers.get('authorization');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { error: 'No token provided' },
//         { status: 401 }
//       );
//     }

//     const token = authHeader.substring(7); // Remove 'Bearer ' prefix

//     // Verify JWT token
//     let payload: JWTPayload;
//     try {
//       payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
//     } catch (err) {
//       return NextResponse.json(
//         { error: 'Invalid or expired token' },
//         { status: 401 }
//       );
//     }

//     // Get user data (without password)
//     const user = MOCK_USERS.find(u => u.id === payload.userId);
    
//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Get restaurant data based on restaurantId from JWT
//     const restaurant = MOCK_RESTAURANTS.find(r => r.id === payload.restaurantId);
    
//     if (!restaurant) {
//       return NextResponse.json(
//         { error: 'Restaurant not found' },
//         { status: 404 }
//       );
//     }

//     // Remove password from user object
//     const { password, ...userWithoutPassword } = user;

//     return NextResponse.json({
//       user: userWithoutPassword,
//       restaurant
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Get restaurant data error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // ============================================
// // File: app/login/page.tsx
// // ============================================

// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.MouseEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }
    
//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || 'Login failed');
//         setLoading(false);
//         return;
//       }

//       // Store JWT token in localStorage
//       localStorage.setItem('jwt_token', data.token);
      
//       // Redirect to dashboard
//       router.push('/dashboard');
//     } catch (err) {
//       setError('An error occurred. Please try again.');
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSubmit(e as any);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
//             <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
//         </div>

//         <div className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyDown={handleKeyDown}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onKeyDown={handleKeyDown}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               placeholder="••••••••"
//             />
//           </div>

//           {error && (
//             <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
//               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <span className="text-sm">{error}</span>
//             </div>
//           )}

//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </div>

//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
//           <div className="space-y-1">
//             <p className="text-xs text-gray-600">
//               <strong>User 1:</strong> john@example.com / password123
//             </p>
//             <p className="text-xs text-gray-600">
//               <strong>User 2:</strong> jane@example.com / securePass456
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // File: app/dashboard/page.tsx
// // ============================================

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { User, Restaurant } from '@/types';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadData = async () => {
//       const token = localStorage.getItem('jwt_token');
      
//       if (!token) {
//         router.push('/login');
//         return;
//       }

//       try {
//         const response = await fetch('/api/restaurant', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           setError(data.error || 'Failed to load data');
//           setTimeout(() => router.push('/login'), 2000);
//           return;
//         }

//         setUser(data.user);
//         setRestaurant(data.restaurant);
//         setLoading(false);
//       } catch (err) {
//         setError('An error occurred while loading data');
//         setTimeout(() => router.push('/login'), 2000);
//       }
//     };

//     loadData();
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('jwt_token');
//     router.push('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow p-6 max-w-md">
//           <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="text-center text-red-700">{error}</p>
//           <p className="text-center text-gray-600 mt-2">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center gap-2">
//               <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center">
//                 <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//               </div>
//               <span className="text-xl font-bold text-gray-900">Restaurant Portal</span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-indigo-100 rounded-lg">
//                 <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-sm text-gray-600">Name</p>
//                 <p className="text-lg font-medium text-gray-900">{user?.name}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Email</p>
//                 <p className="text-lg font-medium text-gray-900">{user?.email}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">User ID</p>
//                 <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
//                   {user?.id}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900">Restaurant Details</h2>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-sm text-gray-600">Restaurant Name</p>
//                 <p className="text-lg font-medium text-gray-900">{restaurant?.name}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Location</p>
//                 <div className="flex items-start gap-2">
//                   <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                   <p className="text-gray-900">{restaurant?.location}</p>
//                 </div>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Restaurant ID</p>
//                 <p className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
//                   {restaurant?.id}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             <strong>Protected Route:</strong> This dashboard is only accessible with a valid JWT token. 
//             The token contains your user ID, email, and restaurant ID, and expires after 1 hour.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }

// // ============================================
// // File: middleware.ts (Optional - for additional route protection)
// // ============================================

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   // This middleware can be used for additional server-side route protection
//   // For client-side protection, we're using useEffect in the dashboard page
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/dashboard/:path*'],
// };

// // ============================================
// // File: package.json
// // ============================================

// /*
// {
//   "name": "nextjs-jwt-auth",
//   "version": "1.0.0",
//   "private": true,
//   "scripts": {
//     "dev": "next dev",
//     "build": "next build",
//     "start": "next start",
//     "lint": "next lint"
//   },
//   "dependencies": {
//     "next": "^14.0.0",
//     "react": "^18.2.0",
//     "react-dom": "^18.2.0",
//     "typescript": "^5.0.0",
//     "bcrypt": "^5.1.1",
//     "jsonwebtoken": "^9.0.2"
//   },
//   "devDependencies": {
//     "@types/node": "^20.0.0",
//     "@types/react": "^18.2.0",
//     "@types/react-dom": "^18.2.0",
//     "@types/bcrypt": "^5.0.2",
//     "@types/jsonwebtoken": "^9.0.5",
//     "tailwindcss": "^3.3.0",
//     "postcss": "^8.4.0",
//     "autoprefixer": "^10.4.0"
//   }
// }
// */

// // ============================================
// // File: .env.local
// // ============================================

// /*
// JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
// */

// // ============================================
// // IMPORTANT NOTES:
// // ============================================

// /*
// 1. PASSWORDS IN MOCK DATA:
//    - User 1 (john@example.com): "password123"
//    - User 2 (jane@example.com): "securePass456"

// 2. TO GENERATE REAL BCRYPT HASHES:
//    Run this in Node.js:
   
//    const bcrypt = require('bcrypt');
   
//    async function generateHash() {
//      const hash1 = await bcrypt.hash('password123', 10);
//      const hash2 = await bcrypt.hash('securePass456', 10);
//      console.log('Hash 1:', hash1);
//      console.log('Hash 2:', hash2);
//    }
   
//    generateHash();

// 3. PROJECT STRUCTURE:
//    nextjs-jwt-auth/
//    ├── app/
//    │   ├── api/
//    │   │   ├── auth/
//    │   │   │   └── login/
//    │   │   │       └── route.ts
//    │   │   └── restaurant/
//    │   │       └── route.ts
//    │   ├── login/
//    │   │   └── page.tsx
//    │   ├── dashboard/
//    │   │   └── page.tsx
//    │   └── layout.tsx
//    ├── lib/
//    │   └── mockData.ts
//    ├── types/
//    │   └── index.ts
//    ├── middleware.ts
//    ├── .env.local
//    ├── package.json
//    ├── tsconfig.json
//    └── tailwind.config.js

// 4. INSTALLATION:
//    npm install
//    npm run dev

// 5. SECURITY NOTES:
//    - Change JWT_SECRET in production
//    - Use HTTPS in production
//    - Consider using httpOnly cookies instead of localStorage for JWT storage
//    - Add rate limiting to login endpoint
//    - Add CSRF protection
//    - Implement refresh tokens for long-lived sessions
// */