'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FiExternalLink, FiTrendingUp } from 'react-icons/fi';
import { db, Advertisement as AdType } from '@/lib/mock-data';

interface AdvertisementProps {
  ad: AdType;
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export default function Advertisement({ 
  ad,
  variant = 'banner',
  className = '' 
}: AdvertisementProps) {

  useEffect(() => {
    // Track impression when ad is displayed
    const timer = setTimeout(() => {
      db.trackAdImpression(ad.id);
    }, 1000); // Track after 1 second of visibility
    
    return () => clearTimeout(timer);
  }, [ad.id]);

  const handleAdClick = async () => {
    try {
      await db.trackAdClick(ad.id);
      window.open(ad.ctaLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  // BANNER VARIANT (Horizontal - Full Width)
  if (variant === 'banner') {
    return (
      <div className={`relative group ${className}`}>
        {/* Sponsored Label */}
        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
          <FiTrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium">Sponsored</span>
        </div>

        {/* Ad Content */}
        <div 
          onClick={handleAdClick}
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left flex-1">
              <h3 className="text-xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                {ad.title}
              </h3>
              <p className="text-sm md:text-base opacity-95 max-w-2xl drop-shadow">
                {ad.description}
              </p>
            </div>

            <button className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 group-hover:scale-105 transform duration-300 flex-shrink-0">
              <span>{ad.ctaText}</span>
              <FiExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CARD VARIANT (Vertical - Card Style)
  if (variant === 'card') {
    return (
      <div className={`relative group ${className}`}>
        {/* Sponsored Label */}
        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
          <FiTrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium">Ad</span>
        </div>

        {/* Ad Content */}
        <div 
          onClick={handleAdClick}
          className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
              {ad.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {ad.description}
            </p>
            
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
              <span>{ad.ctaText}</span>
              <FiExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT VARIANT (Horizontal - Compact)
  if (variant === 'compact') {
    return (
      <div className={`relative group ${className}`}>
        {/* Sponsored Label */}
        <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <FiTrendingUp className="w-3 h-3" />
          <span className="text-xs">Ad</span>
        </div>

        {/* Ad Content */}
        <div 
          onClick={handleAdClick}
          className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="text-white flex-1 mr-4">
              <h3 className="text-sm md:text-base font-bold mb-1">
                {ad.title}
              </h3>
              <p className="text-xs opacity-90 line-clamp-1">
                {ad.description}
              </p>
            </div>

            <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow flex items-center space-x-1 flex-shrink-0">
              <span className="hidden sm:inline">{ad.ctaText}</span>
              <span className="sm:hidden">Go</span>
              <FiExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}