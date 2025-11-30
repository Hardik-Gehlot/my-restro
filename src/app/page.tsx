'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiSearch, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiChevronRight
} from 'react-icons/fi';
import { db, Restaurant } from '@/lib/mock-data';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');

  const cuisineTypes = [
    'All',
    'Italian',
    'Indian',
    'Japanese',
    'American',
    'Chinese',
    'Mexican'
  ];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    const data = await db.getFeaturedRestaurants();
    setRestaurants(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadRestaurants();
      return;
    }
    setLoading(true);
    const results = await db.searchRestaurants(searchQuery);
    setRestaurants(results);
    setLoading(false);
  };

  const handleCuisineFilter = async (cuisine: string) => {
    setSelectedCuisine(cuisine.toLowerCase());
    setLoading(true);
    
    if (cuisine.toLowerCase() === 'all') {
      await loadRestaurants();
    } else {
      const results = await db.getRestaurantsByCuisine(cuisine);
      setRestaurants(results);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  MyRestro
                </h1>
                <p className="text-xs text-gray-500">Discover Great Food</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="#features" 
                className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                Features
              </Link>
              <Link 
                href="#contact" 
                className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                Contact
              </Link>
              <Link 
                href="#advertise" 
                className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                Advertise
              </Link>
              <Link 
                href="/admin/login"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-amber-100 opacity-50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 bg-clip-text text-transparent">
              Discover Amazing Restaurants
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Your gateway to the best dining experiences. Explore menus, discover cuisines, and find your next favorite spot.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative group">
                <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  className="w-full pl-16 pr-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-300 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            {[
              { icon: FiUsers, label: 'Restaurants', value: '500+' },
              { icon: FiStar, label: 'Reviews', value: '10K+' },
              { icon: FiAward, label: 'Cuisines', value: '25+' },
              { icon: FiTrendingUp, label: 'Users', value: '50K+' },
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-orange-100"
              >
                <stat.icon className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisine Filter */}
      <section className="py-8 px-4 bg-white border-y border-orange-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Cuisine:</h3>
          <div className="flex flex-wrap gap-3">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedCuisine === cuisine.toLowerCase()
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-bold text-gray-800">
              Featured Restaurants
            </h3>
            <div className="flex items-center text-orange-500 font-semibold cursor-pointer hover:text-orange-600 transition-colors">
              View All <FiChevronRight className="ml-1" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/${restaurant.id}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-orange-50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-sm">{restaurant.rating}</span>
                      <span className="text-xs text-gray-500">({restaurant.totalReviews})</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Image
                        src={restaurant.logo}
                        alt={restaurant.name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-orange-200"
                      />
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {restaurant.cuisine.map((c, idx) => (
                            <span key={idx} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {restaurant.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose MyRestro?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to discover and showcase amazing restaurants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FiSearch,
                title: 'Easy Discovery',
                description: 'Find restaurants by cuisine, location, or specialty with powerful search'
              },
              {
                icon: FiAward,
                title: 'Quality Verified',
                description: 'All restaurants are verified with genuine reviews and ratings'
              },
              {
                icon: FiUsers,
                title: 'Restaurant Owners',
                description: 'Simple dashboard to manage your menu and reach more customers'
              },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-orange-100"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advertise Section */}
      <section id="advertise" className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-4xl font-bold mb-6">
            Advertise Your Restaurant
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Reach thousands of food lovers and grow your business with MyRestro
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <p className="text-3xl font-bold mb-2">50K+</p>
              <p className="text-sm opacity-90">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <p className="text-3xl font-bold mb-2">10K+</p>
              <p className="text-sm opacity-90">Daily Visits</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <p className="text-3xl font-bold mb-2">500+</p>
              <p className="text-sm opacity-90">Partner Restaurants</p>
            </div>
          </div>
          <a
            href="#contact"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Today
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Get In Touch
            </h3>
            <p className="text-gray-600 text-lg">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl text-center border border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Email Us</h4>
              <p className="text-gray-600">contact@myrestro.com</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl text-center border border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiPhone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Call Us</h4>
              <p className="text-gray-600">+91 9876543210</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl text-center border border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiMapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Visit Us</h4>
              <p className="text-gray-600">Mumbai, Maharashtra</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                  <FiAward className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">MyRestro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your gateway to amazing dining experiences.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
                <li><Link href="#features" className="hover:text-orange-400 transition-colors">Features</Link></li>
                <li><Link href="#contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">For Business</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/admin/login" className="hover:text-orange-400 transition-colors">Restaurant Login</Link></li>
                <li><Link href="#advertise" className="hover:text-orange-400 transition-colors">Advertise</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 MyRestro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}