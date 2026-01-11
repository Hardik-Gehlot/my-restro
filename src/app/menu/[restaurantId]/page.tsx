'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiSearch,
  FiFilter,
  FiArrowLeft,
  FiX,
  FiCheck,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Restaurant, Dish } from '@/lib/mock-data';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

// ====================================================================
// Header Component
// ====================================================================
const MenuHeader = ({
  restaurantName,
  searchQuery,
  setSearchQuery,
  onFilterClick,
  activeFiltersCount,
}) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition <= 50) {
        setIsScrolled(false);
      } else if (scrollPosition > 50 && !isScrolled) {
        setIsScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    if (!isScrolled && !isSearchOpen && searchQuery) {
      setSearchQuery('');
    }
  }, [isScrolled, isSearchOpen, searchQuery, setSearchQuery]);


  const showSearchBar = isSearchOpen || isScrolled;

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 h-16 transition-all relative overflow-hidden">
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          animate={{
            opacity: showSearchBar ? 0.5 : 1,
            scale: showSearchBar ? 0.95 : 1,
          }}
        >
          <FiArrowLeft className="w-6 h-6 text-gray-700" />
        </motion.button>

        {/* Restaurant Name */}
        <motion.h1
          className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800 truncate"
          animate={{
            y: showSearchBar ? 20 : 0,
            opacity: showSearchBar ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {restaurantName}
        </motion.h1>

        {/* Action Icons */}
        <div className="flex items-center space-x-1 z-10">
          <AnimatePresence>
            {!showSearchBar && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiSearch className="w-6 h-6 text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={onFilterClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <FiFilter className="w-6 h-6 text-gray-700" />
            {activeFiltersCount > 0 && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-orange-500 border-2 border-white" />
            )}
          </button>
        </div>

        {/* Search Bar Container */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              key="search-bar"
              initial={{
                scaleX: 0,
                opacity: 0,
                transformOrigin: '100% 50%',
              }}
              animate={{
                scaleX: 1,
                opacity: 1,
                transformOrigin: '100% 50%',
              }}
              exit={{
                scaleX: 0,
                opacity: 0,
                transformOrigin: '100% 50%',
              }}
              transition={{
                duration: 0.35,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="absolute top-0 left-12 sm:left-16 right-12 sm:right-16 h-full bg-white flex items-center origin-right"
            >
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-10 pr-8 py-2.5 text-base bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400 placeholder-gray-600 text-gray-800"
                  autoFocus
                />
                {isSearchOpen && !isScrolled && (
                  <button
                    onClick={closeSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-gray-800 rounded-full hover:bg-gray-100"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};



// ====================================================================
// Main Page Component
// ====================================================================
export default function MenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [restaurantData, dishesData] = await Promise.all([
        db.getRestaurantById(restaurantId),
        db.getDishesByRestaurant(restaurantId),
      ]);
      setRestaurant(restaurantData);
      setDishes(dishesData);
      setLoading(false);
    };
    loadData();
  }, [restaurantId]);

  const getMinPrice = useCallback((dish: Dish): number => {
    return Math.min(...dish.variations.map((v) => v.price));
  }, []);

  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.category.toLowerCase().includes(query)
      );
    }

    if (showVegOnly) {
      result = result.filter((dish) => dish.isVeg);
    }

    if (showAvailableOnly) {
      result = result.filter((dish) => true); // Placeholder
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return getMinPrice(a) - getMinPrice(b);
        case 'price-desc':
          return getMinPrice(b) - getMinPrice(a);
        default:
          return 0;
      }
    });

    return result;
  }, [dishes, searchQuery, sortBy, showVegOnly, showAvailableOnly, getMinPrice]);

  const activeFiltersCount = [showVegOnly, showAvailableOnly].filter(Boolean)
    .length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white shadow-md"></div>
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!restaurant) return <div>Not found</div> // Simplified for brevity

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MenuHeader
        restaurantName={restaurant.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={() => setShowFilterModal(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Dishes Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDishes.length}{' '}
          {filteredDishes.length === 1 ? 'dish' : 'dishes'}
        </div>

        {filteredDishes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <FiSearch className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No dishes found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Dish Image */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover"
                    />
                    {/* Veg/Non-Veg Badge */}
                    <div className="absolute top-2 left-2">
                      <div
                        className={`w-6 h-6 border-2 ${
                          dish.isVeg ? 'border-green-600' : 'border-red-600'
                        } flex items-center justify-center bg-white rounded`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            dish.isVeg ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Dish Info */}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-bold text-gray-800 line-clamp-1">
                        {dish.name}
                      </h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                        {dish.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {dish.description}
                    </p>

                    {/* Price Variations */}
                    <div className="flex flex-wrap items-center gap-2">
                      {dish.variations.map((variation, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 px-2.5 py-1 rounded-lg"
                        >
                          <span className="text-xs font-semibold text-gray-700 capitalize">
                            {variation.size}
                          </span>
                          <span className="text-xs font-bold text-orange-600 ml-1">
                            ₹{variation.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Veg Only Filter */}
              <button
                onClick={() => setShowVegOnly(!showVegOnly)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  showVegOnly
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 border-2 border-green-600 flex items-center justify-center rounded">
                    <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      Vegetarian Only
                    </p>
                    <p className="text-sm text-gray-600">
                      Show only veg dishes
                    </p>
                  </div>
                </div>
                {showVegOnly && (
                  <FiCheck className="w-6 h-6 text-green-600" />
                )}
              </button>

              {/* Available Only Filter */}
              <button
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  showAvailableOnly
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    Available Only
                  </p>
                  <p className="text-sm text-gray-600">
                    Hide out of stock items
                  </p>
                </div>
                {showAvailableOnly && (
                  <FiCheck className="w-6 h-6 text-orange-600" />
                )}
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => {
                  setShowVegOnly(false);
                  setShowAvailableOnly(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}