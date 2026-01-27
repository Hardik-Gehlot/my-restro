'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiAlertCircle, FiAward } from 'react-icons/fi';
import { db } from '@/app/database';
import { KEYS } from '@/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      setError('');
      setLoading(true);
      try {
        const response = await db.login(email,password);
  
        if (response.status==='error') {
          setError(response.data || 'Login failed');
          setLoading(false);
          return;
        }
        sessionStorage.setItem(KEYS.JWT_TOKEN, response.data);
        
        // Decode token to check role
        try {
          const parts = response.data.split('.');
          const payload = JSON.parse(atob(parts[1]));
          
          if (payload.role === 'superadmin') {
            router.push('/superadmin/dashboard');
          } else {
            router.push('/admin/dashboard/menu');
          }
        } catch (e) {
          router.push('/admin/dashboard/menu');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg mb-4">
            <FiAward className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Restaurant Admin</h1>
          <p className="text-gray-600">Sign in to manage your restaurant</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restaurant.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-800"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-800"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Pizza Paradise:</p>
                <p>Email: admin@pizzaparadise.com</p>
                <p>Password: pizza123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Spice Route:</p>
                <p>Email: admin@spiceroute.com</p>
                <p>Password: spice123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700">Burger Hub:</p>
                <p>Email: admin@burgerhub.com</p>
                <p>Password: burger123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help? Contact support at support@myrestro.com
        </p>
      </div>
    </div>
  );
}