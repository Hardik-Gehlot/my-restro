'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiShare2,
  FiPhone,
  FiMapPin,
  FiExternalLink,
  FiStar,
  FiMenu,
  FiInstagram
} from 'react-icons/fi';
import { db, Restaurant, Advertisement as AdType } from '@/lib/mock-data';
import Advertisement from '@/components/shared/Advertisement';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch restaurant and ads together
    const [restaurantData, adsData] = await Promise.all([
      db.getRestaurantById(restaurantId),
      db.getAdvertisements()
    ]);
    
    setRestaurant(restaurantData);
    setAds(adsData);
    setLoading(false);
  };

  const handleShare = async () => {
    if (navigator.share && restaurant) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: restaurant.tagline,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const handleCall = () => {
    if (restaurant) {
      window.location.href = `tel:${restaurant.mobileNo}`;
    }
  };

  // Get ad for specific position
  const getAdForPosition = (position: string) => {
    return ads.find(ad => ad.position === position);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-56 bg-gray-200"></div>
          <div className="px-4 py-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Not Found</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Get position-specific ads
  const topAd = getAdForPosition('rest-1');
  const midAd = getAdForPosition('rest-2');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Advertisement Section - Top (rest-1) */}
      {topAd && (
        <div className="px-4 pt-4 mb-6">
          <Advertisement ad={topAd} variant="banner" />
        </div>
      )}
      
      {/* Header Image Section */}
      <div className="relative h-56 bg-gray-900">
        <Image
          src={restaurant.coverImage}
          alt={restaurant.name}
          fill
          className="object-cover opacity-90"
          priority
        />
        
        {/* Header Overlay with Share */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-end p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button 
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
          >
            <FiShare2 className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Logo Floating at Bottom */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white">
            <Image
              src={restaurant.logo}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Restaurant Info Section */}
      <div className="px-4 pt-16 pb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {restaurant.name}
          </h1>
          <p className="text-base text-gray-600 mb-3">
            {restaurant.tagline}
          </p>

          {/* Google Rating */}
          <a
            href={restaurant.googleRatingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-white border-2 border-gray-200 px-4 py-2 rounded-lg hover:border-orange-300 transition-all"
          >
            <FiStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-800">Rate us on Google</span>
            <FiExternalLink className="w-4 h-4 text-gray-500" />
          </a>
        </div>

        {/* View Menu Button - PRIMARY CTA */}
        <Link
          href={`/menu/${restaurant.id}`}
          className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all text-center mb-4 group"
        >
          <div className="flex items-center justify-center space-x-3">
            <FiMenu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>View Full Menu</span>
          </div>
        </Link>

        {/* Social Media Links */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <a
            href={restaurant.googleRatingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <FiInstagram className="w-5 h-5" />
            <span>Instagram</span>
          </a>
        </div>
      </div>

      {/* Advertisement Section - Mid (rest-2) */}
      {midAd && (
        <div className="px-4 mb-6">
          <Advertisement ad={midAd} variant="banner" />
        </div>
      )}

      {/* Contact Information Card */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            {/* Phone */}
            <a
              href={`tel:${restaurant.mobileNo}`}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <FiPhone className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Phone Number
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {restaurant.mobileNo}
                </p>
              </div>
            </a>

            {/* Location */}
            <a
              href={restaurant.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FiMapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-base font-semibold text-gray-800">
                  View on Google Maps
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  Get directions
                  <FiExternalLink className="w-3 h-3 ml-1" />
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">About Us</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Welcome to <span className="font-semibold text-gray-800">{restaurant.name}</span>! {restaurant.tagline}. 
            We are committed to providing you with the best dining experience. 
            Our menu features a wide variety of delicious dishes made with fresh, quality ingredients.
          </p>
        </div>
      </div>

      {/* Quick Actions - Sticky Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl lg:hidden z-40">
        <div className="flex items-center">
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center space-x-2 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            <FiPhone className="w-5 h-5" />
            <span>Call</span>
          </button>
          
          <Link
            href={`/menu/${restaurant.id}`}
            className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <FiMenu className="w-5 h-5" />
            <span>View Menu</span>
          </Link>
        </div>
      </div>

      {/* Bottom Spacer for Sticky Bar */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
}