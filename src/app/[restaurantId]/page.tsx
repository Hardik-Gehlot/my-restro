"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiPhone,
  FiMapPin,
  FiExternalLink,
  FiStar,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
} from "react-icons/fi";
import { BiSolidDish } from "react-icons/bi";
import Footer from "@/components/shared/Footer";
import { Restaurant } from "@/types";
import { db } from "@/app/database";
import { PLACEHOLDERS } from "@/lib/constants";
import { Icons } from "@/lib/icons";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    setLoading(true);
    
    // Detect if this is a page refresh
    const navigationHistory = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isRefresh = navigationHistory.length > 0 && navigationHistory[0].type === 'reload';
    
    const { restaurant } = await db.getRestaurantDataWithMenu(restaurantId, isRefresh);
    setRestaurant(restaurant);
    if (restaurant) {
      document.title = `${restaurant.name} | Special Menu`;
    }
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Restaurant Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Image Section */}
      <div className="relative h-56 bg-gray-900">
        <Image
          src={restaurant.coverImage || PLACEHOLDERS.RESTAURANT_COVER}
          alt={restaurant.name}
          fill
          className="object-cover opacity-90"
          priority
        />

        {/* Logo Floating at Bottom */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white">
            <Image
              src={restaurant.logo || PLACEHOLDERS.RESTAURANT_LOGO}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="absolute -bottom-16 right-6">
          <div className="flex items-center space-x-4 mb-4">
            {restaurant.instagramLink && (
              <a
                href={restaurant.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiInstagram className="w-6 h-6 text-pink-500 hover:text-pink-700 transition-colors" />
              </a>
            )}
            {restaurant.facebookLink && (
              <a
                href={restaurant.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFacebook className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors" />
              </a>
            )}
            {restaurant.twitterLink && (
              <a
                href={restaurant.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter className="w-6 h-6 text-blue-400 hover:text-blue-600 transition-colors" />
              </a>
            )}
            {restaurant.linkedinLink && (
              <a
                href={restaurant.linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiLinkedin className="w-6 h-6 text-blue-700 hover:text-blue-900 transition-colors" />
              </a>
            )}
            {restaurant.youtubeLink && (
              <a
                href={restaurant.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiYoutube className="w-6 h-6 text-red-600 hover:text-red-800 transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Info Section */}
      <div className="px-4 pt-20 pb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {restaurant.name}
          </h1>
          <p className="text-lg text-gray-600 mb-6">{restaurant.tagline}</p>

          <div className="flex gap-3 mb-6 flex-col md:flex-row">
            {restaurant.googleRatingLink && (
              <a
                href={restaurant.googleRatingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiStar className="w-5 h-5" />
                <span>Rate us on Google</span>
                <FiExternalLink className="w-4 h-4" />
              </a>
            )}

            <Link
              href={`/menu/${restaurant.id}`}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center group"
            >
              <div className="flex items-center justify-center space-x-3">
                <BiSolidDish className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>View Menu</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      {restaurant.mobileNo && restaurant.googleMapLink && (
        <div className="px-4 mb-6">
          <div className="bg-white/40 backdrop-blur-lg rounded-3xl border border-white/60 shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Contact Information
            </h2>

            <div className="space-y-3">
              {/* Phone */}
              {restaurant.mobileNo && (
                <a
                  href={`tel:${restaurant.mobileNo}`}
                  className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 hover:bg-white/70 transition-all group hover:scale-[1.02]"
                >
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                    <FiPhone className="w-5 h-5 text-white" />
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
              )}

              {/* Location */}
              {restaurant.googleMapLink && (
                <a
                  href={restaurant.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 hover:bg-white/70 transition-all group hover:scale-[1.02]"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                    <FiMapPin className="w-5 h-5 text-white" />
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      {restaurant.aboutus && (
        <div className="px-4 mb-6">
          <div className="bg-white/40 backdrop-blur-lg rounded-3xl border border-white/60 shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Welcome to{" "}
              <span className="font-semibold text-gray-900">
                {restaurant.name}
              </span>
              <br />
              {restaurant.aboutus}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
