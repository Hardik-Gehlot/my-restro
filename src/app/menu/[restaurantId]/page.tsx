"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiSearch,
  FiFilter,
  FiArrowLeft,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { BiSolidDish } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { db, Restaurant, Dish } from "@/lib/mock-data";
import { smoothScrollTo } from "@/utils/helpers";


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
const searchInputRef = useRef<HTMLInputElement>(null);


useEffect(() => {
  const handleScroll = () => {
    setIsSearchOpen(true);
    setIsScrolled(window.scrollY > 50);
    searchInputRef.current?.blur();
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  useEffect(() => {
    if (!isScrolled && !isSearchOpen && searchQuery) {
      setSearchQuery("");
    }
  }, [isScrolled, isSearchOpen, searchQuery, setSearchQuery]);

  const showSearchBar = isSearchOpen;


  const openSearch = () => {
  setIsSearchOpen(true);
  requestAnimationFrame(() => {
    searchInputRef.current?.focus();
  });
};

const closeSearch = () => {
  setIsSearchOpen(false);
  setSearchQuery("");
  searchInputRef.current?.blur();
};

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 h-16 transition-all relative overflow-hidden">
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

        <motion.h1
          className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800 truncate"
          animate={{
            y: showSearchBar ? 20 : 0,
            opacity: showSearchBar ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {restaurantName}
        </motion.h1>

        <div className="flex items-center space-x-1 z-10">
          <AnimatePresence>
            {!showSearchBar && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={openSearch}
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

        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              key="search-bar"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              style={{ transformOrigin: "100% 50%" }}
              className="absolute top-0 left-12 sm:left-16 right-12 sm:right-16 h-full bg-white flex items-center"
            >
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  ref={searchInputRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in menu..."
                  className="w-full pl-10 pr-8 py-2.5 text-base text-gray-800 placeholder-gray-600 bg-gray-100 border border-gray-200 rounded-full focus:outline-none"
                />
                {isSearchOpen && (
                  <button
                    onClick={closeSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-gray-900 rounded-full"
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

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filter Modal
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Refs for scrolling
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const [restaurantData, dishesData] = await Promise.all([
      db.getRestaurantById(restaurantId),
      db.getDishesByRestaurant(restaurantId),
    ]);
    setRestaurant(restaurantData);
    setDishes(dishesData);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedAndFilteredDishes = useMemo(() => {
    let filtered = [...dishes];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.description.toLowerCase().includes(query)
      );
    }
    if (dietFilter === "veg") {
      filtered = filtered.filter((dish) => dish.isVeg);
    } else if (dietFilter === "nonveg") {
      filtered = filtered.filter((dish) => !dish.isVeg);
    }
    if (showAvailableOnly) {
      filtered = filtered.filter((dish) => dish.isAvailable !== false);
    }

    return filtered.reduce((acc, dish) => {
      const category = dish.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dish);
      return acc;
    }, {} as { [key: string]: Dish[] });
  }, [dishes, searchQuery, dietFilter, showAvailableOnly]);

  const categories = Object.keys(groupedAndFilteredDishes);

  useEffect(() => {
    const initialOpenState = categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setOpenCategories(initialOpenState);
  }, [dishes]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleCategoryClick = (category: string) => {
    setIsCategoryModalOpen(false);
    setTimeout(() => {
      const element = categoryRefs.current[category];
      if (element) {
        const yOffset = -80; // height of header + some margin
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        smoothScrollTo(y, 300);
      }
    }, 300);
  };

  const activeFiltersCount = [
    dietFilter !== "all",
    showAvailableOnly,
  ].filter(Boolean).length;

  if (loading) return <div>Loading...</div>;
  if (!restaurant) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        restaurantName={restaurant.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={() => setShowFilterModal(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="max-w-6xl mx-auto py-4">
        {categories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FiSearch className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">
              No dishes found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category}
              id={category}
              ref={(el) => (categoryRefs.current[category] = el)}
              className="mb-4 bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                <motion.div
                  animate={{ rotate: openCategories[category] ? 180 : 0 }}
                >
                  <FiChevronDown className="w-6 h-6 text-gray-600" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openCategories[category] && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="overflow-hidden"
                  >
                    {groupedAndFilteredDishes[category].map((dish, index) => (
                      <div
                        key={dish.id}
                        className={`flex p-4 ${
                          index < groupedAndFilteredDishes[category].length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <div
                              className={`w-4 h-4 border ${
                                dish.isVeg
                                  ? "border-green-600"
                                  : "border-red-600"
                              } flex items-center justify-center`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  dish.isVeg ? "bg-green-600" : "bg-red-600"
                                }`}
                              ></div>
                            </div>
                            {dish.name}
                            {dish.isAvailable === false && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-300/50 text-gray-600 border border-gray-300">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Unavailable
                              </span>
                            )}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {dish.variations.map((v, i) => (
                              <div
                                key={i}
                                className="bg-gray-100 px-2 py-0.5 rounded"
                              >
                                <span className="text-xs font-semibold text-gray-700 capitalize">
                                  {v.size}
                                </span>
                                <span className="text-xs font-bold text-orange-600 ml-1">
                                  ₹{v.price}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {dish.description}
                          </p>
                        </div>
                        <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
        <div className="h-24" /> {/* Spacer for FAB */}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end p-4"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white fixed bottom-20 right-6 rounded-lg shadow-xl w-full max-w-xs h-fit overflow-y-auto"
            >
              {/* No Heading */}
              <div className="p-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex justify-between items-center text-left py-2 px-3 rounded-lg text-gray-800 hover:text-black transition-colors"
                  >
                    <span className="font-semibold">{category}</span>
                    <span className="font-semibold">
                      {groupedAndFilteredDishes[category].length}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {searchQuery === "" && (
        <button
          onClick={() => setIsCategoryModalOpen(!isCategoryModalOpen)}
          className="fixed bottom-6 right-6 bg-black text-white rounded-lg shadow-lg z-50 flex items-center justify-center px-3 py-2 text-sm"
        >
          <AnimatePresence mode="wait">
            {isCategoryModalOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                <FiX className="w-5 h-5" />
                <span>Close</span>
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: -90, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                <BiSolidDish className="w-5 h-5" />
                <span>Menu</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Enhanced Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Diet Preference Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Diet Preference
                  </h3>
                  <div className="flex gap-3">
                    {/* Veg Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("veg")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "veg"
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "veg" ? "animate-bounce" : ""
                          }`}
                        >
                          🌿
                        </div>
                        <span className="text-sm font-semibold">Veg</span>
                      </div>
                      {dietFilter === "veg" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Both Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("all")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "all"
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "all" ? "animate-bounce" : ""
                          }`}
                        >
                          🍽️
                        </div>
                        <span className="text-sm font-semibold">Both</span>
                      </div>
                      {dietFilter === "all" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Non-Veg Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("nonveg")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "nonveg"
                          ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "nonveg" ? "animate-bounce" : ""
                          }`}
                        >
                          🍗
                        </div>
                        <span className="text-sm font-semibold">Non-Veg</span>
                      </div>
                      {dietFilter === "nonveg" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Availability Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Availability
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    className={`w-full relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                      showAvailableOnly
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">✨</div>
                        <span className="font-semibold">
                          Show Available Only
                        </span>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                          showAvailableOnly
                            ? "bg-white/30"
                            : "bg-gray-300/50"
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: showAvailableOnly ? 24 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full ${
                            showAvailableOnly
                              ? "bg-white"
                              : "bg-white"
                          } shadow-md`}
                        />
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDietFilter("all");
                      setShowAvailableOnly(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-white/80 backdrop-blur-md border border-gray-200/50 hover:bg-white transition-all"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
