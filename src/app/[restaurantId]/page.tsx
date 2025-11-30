'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiStar, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock,
  FiInstagram,
  FiFacebook,
  FiExternalLink,
  FiChevronRight,
  FiAward,
  FiDollarSign,
  FiArrowLeft,
  FiMenu,
  FiShare2
} from 'react-icons/fi';
import { db, Restaurant } from '@/lib/mock-data';

export default function RestaurantPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('');

  useEffect(() => {
    loadRestaurant();
    setActiveDay(getCurrentDay());
  }, [restaurantId]);

  const loadRestaurant = async () => {
    setLoading(true);
    const data = await db.getRestaurantById(restaurantId);
    setRestaurant(data);
    setLoading(false);
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const handleShare = async () => {
    if (navigator.share && restaurant) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: restaurant.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-8">The restaurant you're looking for doesn't exist.</p>
          <Link 
            href="/"
            className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Cover Image */}
      <div className="relative h-64 lg:h-96 w-full">
        <Image
          src={restaurant.coverImage}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Restaurant Info Overlay - Desktop Only */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto flex items-end space-x-6">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0">
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-white mb-4">
              <h1 className="text-5xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-sm">({restaurant.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {restaurant.cuisine.map((c, idx) => (
                    <span key={idx} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FiDollarSign />
                  <span>{restaurant.priceRange}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Restaurant Header - Below Cover Image */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-200 shadow-md flex-shrink-0">
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{restaurant.name}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {restaurant.cuisine.map((c, idx) => (
                  <span key={idx} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FiStar className="text-yellow-500 fill-yellow-500 w-4 h-4" />
                  <span className="font-semibold">{restaurant.rating}</span>
                </div>
                <span>•</span>
                <span>{restaurant.priceRange}</span>
                <span>•</span>
                <span>{restaurant.totalReviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Mobile View Menu Button - TOP POSITION */}
          <Link
            href={`/menu/${restaurant.id}`}
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all mb-4"
          >
            <FiMenu className="w-6 h-6" />
            <span>View Menu</span>
            <FiChevronRight className="w-5 h-5" />
          </Link>

          {/* Mobile Social Media Links - AFTER MENU */}
          <div className="flex items-center space-x-3">
            {restaurant.socialMedia.instagram && (
              <a
                href={restaurant.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold transition-all"
              >
                <FiInstagram className="w-5 h-5" />
                <span className="text-sm">Instagram</span>
              </a>
            )}

            {restaurant.socialMedia.facebook && (
              <a
                href={restaurant.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                <FiFacebook className="w-5 h-5" />
                <span className="text-sm">Facebook</span>
              </a>
            )}

            {restaurant.socialMedia.googleReviews && (
              <a
                href={restaurant.socialMedia.googleReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 text-white py-3 rounded-lg font-semibold transition-all"
              >
                <FiStar className="w-5 h-5" />
                <span className="text-sm">Reviews</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ADVERTISEMENT - TOP BANNER */}
      <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
        {/* <Advertisement position="top" /> */}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">About Us</h2>
              <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FiAward className="mr-3 text-orange-500" />
                Our Specialties
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {restaurant.specialties.map((specialty, idx) => (
                  <div 
                    key={idx}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 text-center"
                  >
                    <p className="font-semibold text-gray-800 text-sm lg:text-base">{specialty}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FiClock className="mr-3 text-orange-500" />
                Opening Hours
              </h2>
              <div className="space-y-3">
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div 
                    key={day}
                    className={`flex justify-between items-center p-3 lg:p-4 rounded-xl transition-all ${
                      activeDay === day 
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="font-semibold text-gray-800 capitalize text-sm lg:text-base">
                      {day}
                      {activeDay === day && (
                        <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                    <span className="text-gray-600 text-sm lg:text-base">
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Links (Desktop Only) */}
          <div className="hidden lg:block space-y-6">
            {/* Menu Button - Desktop */}
            <Link
              href={`/menu/${restaurant.id}`}
              className="block bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-center group"
            >
              <div className="text-3xl font-bold mb-2">View Menu</div>
              <div className="flex items-center justify-center text-sm opacity-90">
                <span>See all dishes</span>
                <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* ADVERTISEMENT - SIDEBAR */}
            {/* <Advertisement position="sidebar" /> */}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
              
              {/* Address */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <FiMapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Address</p>
                  <p className="text-sm text-gray-600">
                    {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                  </p>
                  {restaurant.address.mapLink && (
                    <a
                      href={restaurant.address.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm mt-2 font-medium"
                    >
                      View on Map <FiExternalLink className="ml-1 w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Phone */}
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <FiPhone className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Phone</p>
                  <p className="text-sm text-gray-600">{restaurant.phone}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${restaurant.email}`}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <FiMail className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Email</p>
                  <p className="text-sm text-gray-600">{restaurant.email}</p>
                </div>
              </a>
            </div>

            {/* Social Links & Reviews - Desktop */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Connect With Us</h3>
              <div className="space-y-3">
                {restaurant.socialMedia.instagram && (
                  <a
                    href={restaurant.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <FiInstagram className="w-6 h-6 text-pink-600" />
                      <span className="font-semibold text-gray-800">Instagram</span>
                    </div>
                    <FiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </a>
                )}

                {restaurant.socialMedia.facebook && (
                  <a
                    href={restaurant.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <FiFacebook className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-gray-800">Facebook</span>
                    </div>
                    <FiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </a>
                )}

                {restaurant.socialMedia.googleReviews && (
                  <a
                    href={restaurant.socialMedia.googleReviews}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <FiStar className="w-6 h-6 text-yellow-600" />
                      <span className="font-semibold text-gray-800">Google Reviews</span>
                    </div>
                    <FiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats - Desktop */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Rating</span>
                  <span className="text-xl font-bold">{restaurant.rating}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Total Reviews</span>
                  <span className="text-xl font-bold">{restaurant.totalReviews}+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Cuisines</span>
                  <span className="text-xl font-bold">{restaurant.cuisine.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Contact Section */}
        <div className="lg:hidden mt-6 space-y-4">
          {/* Contact Cards */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <FiMapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Address</p>
                  <p className="text-sm text-gray-600">
                    {restaurant.address.street}, {restaurant.address.city}
                  </p>
                  {restaurant.address.mapLink && (
                    <a
                      href={restaurant.address.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-600 text-sm mt-2 font-medium"
                    >
                      View on Map <FiExternalLink className="ml-1 w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Phone */}
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl active:bg-orange-50"
              >
                <FiPhone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Phone</p>
                  <p className="text-sm text-gray-600">{restaurant.phone}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${restaurant.email}`}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl active:bg-orange-50"
              >
                <FiMail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Email</p>
                  <p className="text-sm text-gray-600">{restaurant.email}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}