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
import { smoothScrollTo } from "@/utils/helpers";
import Footer from "@/components/shared/Footer";
import FilterModel from "@/components/shared/FilterModel";
import { Dish, Restaurant } from "@/types";
import { db } from "@/app/database";
import { PLACEHOLDERS } from "@/lib/constants";
import { MenuPageSkeleton } from "@/components/shared/Skeleton";

interface MenuHeaderProp {
  restaurantName: string;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  activeFiltersCount: number;
  onFilterClick: () => void;
}
const MenuHeader = ({
  restaurantName,
  searchQuery,
  setSearchQuery,
  onFilterClick,
  activeFiltersCount,
}: MenuHeaderProp) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY > 50) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // useEffect(() => {
  //   if (!isSearchOpen && searchQuery) {
  //     setSearchQuery("");
  //   }
  // }, [isSearchOpen, searchQuery]);

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
    <div className={`sticky top-0 z-40 transition-all duration-200 ${
      isScrolled && !isSearchOpen
        ? "bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-lg" 
        : "bg-white border-b border-gray-100 shadow-none"
    }`}>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 h-16 transition-all relative overflow-hidden">
        <motion.button
          onClick={() => router.back()}
          className={`p-2 rounded-lg transition-colors z-10 ${
            isSearchOpen ? "bg-white" : "hover:bg-black/5"
          }`}
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
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <FiSearch className="w-6 h-6 text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={onFilterClick}
            className={`p-2 rounded-lg transition-colors relative z-10 ${
              isSearchOpen ? "bg-white" : "hover:bg-black/5"
            }`}
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
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              style={{ transformOrigin: "right" }}
              className="absolute top-0 left-0 right-0 h-full bg-white flex items-center px-12 sm:px-16"
            >
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  ref={searchInputRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in menu..."
                  className="w-full pl-10 pr-8 py-2.5 text-base text-gray-800 placeholder-gray-600 rounded-full focus:outline-none bg-gray-100 border border-gray-200"
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

interface DishDescriptionProps {
  description: string;
}

function DishDescription({ description }: DishDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      setShowMore(el.scrollHeight > el.clientHeight);
    }
  }, [description]);

  return (
    <p className="relative text-sm text-gray-600 mt-1">
      <span
        ref={textRef}
        className={expanded ? "" : "line-clamp-2"}
      >
        {description}
      </span>

      {!expanded && showMore && (
        <button
          onClick={() => setExpanded(true)}
          className="absolute bottom-0 right-1 pl-2 bg-white ml-1 text-orange-500 font-medium hover:underline"
        >
          more
        </button>
      )}
    </p>
  );
}

export default function MenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const loadData = useCallback(async () => {
    setLoading(true);

    // Detect if this is a page refresh
    const navigationHistory = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isRefresh = navigationHistory.length > 0 && navigationHistory[0].type === 'reload';

    const { restaurant: restaurantData, menu: menuData } =
      await db.getRestaurantDataWithMenu(restaurantId, isRefresh);
    setRestaurant(restaurantData);
    setDishes(menuData ?? []);
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
          dish.description.toLowerCase().includes(query) ||
          dish.category.toLowerCase().includes(query),
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

    return filtered.reduce(
      (acc, dish) => {
        const category = dish.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(dish);
        return acc;
      },
      {} as { [key: string]: Dish[] },
    );
  }, [dishes, searchQuery, dietFilter, showAvailableOnly]);

  const categories = Object.keys(groupedAndFilteredDishes);

  useEffect(() => {
    const initialOpenState = categories.reduce(
      (acc, category) => {
        acc[category] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    setOpenCategories(initialOpenState);
  }, [dishes]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleCategoryClick = (category: string) => {
    setIsCategoryModalOpen(false);
    setOpenCategories((prev) => ({ ...prev, [category]: true }));
    setTimeout(() => {
      const element = categoryRefs.current[category];
      if (element) {
        const yOffset = -80;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        smoothScrollTo(y, 300);
      }
    }, 300);
  };

  const activeFiltersCount = [dietFilter !== "all", showAvailableOnly].filter(
    Boolean,
  ).length;

  const handleBackdropClick = () => {
    setIsCategoryModalOpen(false);
  };

  if (loading) return <MenuPageSkeleton />;
  if (!restaurant) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              ref={(el) => { categoryRefs.current[category] = el; }}
              className="mb-4 bg-white/40 backdrop-blur-lg rounded-xl shadow-xl border border-white/60 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/30 transition-colors"
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
                            ? "border-b border-white/40"
                            : ""
                        } ${dish.isAvailable === false ? "opacity-60 grayscale-[0.3]" : ""}`}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="flex-wrap text-base font-bold text-gray-800 flex items-center gap-2">
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-600 border border-red-200 animate-pulse">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                                Unavailable
                              </span>
                            )}
                          </h4>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {dish.variations.map((v, i) => (
                              <div
                                key={i}
                                className="bg-gray-200 px-1 py-0.3 rounded"
                              >
                                <span className="text-xs font-semibold text-gray-700 capitalize">
                                  {v.size}:
                                </span>
                                <span className="text-xs font-bold text-orange-600 ml-1">
                                  ₹{v.price}
                                </span>
                              </div>
                            ))}
                          </div>
                          <DishDescription description={dish.description} />

                        </div>
                        <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                           <Image
                             src={dish.image || PLACEHOLDERS.DISH_IMAGE}
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
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end p-4"
              onClick={handleBackdropClick}
              style={{ touchAction: "none" }}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{
                type: "tween",
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="bg-white fixed z-50 bottom-20 right-6 rounded-lg shadow-xl w-full max-w-xs h-fit overflow-y-auto"
            >
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
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {searchQuery === "" && dishes?.length > 0 && (
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

      <FilterModel
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        dietFilter={dietFilter}
        setDietFilter={setDietFilter}
        showAvailableOnly={showAvailableOnly}
        setShowAvailableOnly={setShowAvailableOnly}
      />

      {dishes?.length > 0 && <Footer />}
    </div>
  );
}
