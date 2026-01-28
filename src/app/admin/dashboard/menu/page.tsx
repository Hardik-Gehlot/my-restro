"use client";
import { useState, useEffect, useRef } from "react";
import { Icons } from "@/lib/icons";
import AddDishModal from "@/components/admin/modals/AddDishModal";
import DishEditModal from "@/components/admin/modals/DishEditModal";
import { Disclosure, Transition } from "@headlessui/react";
import { useToast } from "@/components/shared/CustomToast";
import { db } from "@/app/database";
import { ApiResponse, Dish, KEYS, Restaurant, Category } from "@/types";
import { useRouter } from "next/navigation";
import { PLACEHOLDERS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface DishesByCategory {
  [category: string]: Dish[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);

        if (!token || token.length === 0) {
          console.log("No token found in menu page, redirecting to login");
          router.push("/admin/login");
          return;
        }

        const data: ApiResponse =
          await db.getAdminRestaurantDataWithMenu(token);

        if (data.status === "error") {
          if (typeof data?.message === "string") {
            showToast(data.message, "error");
          } else {
            showToast("Failed to fetch restaurant data.", "error");
          }
          sessionStorage.removeItem(KEYS.JWT_TOKEN);
          router.push("/admin/login");
          return;
        }

        if (data.data) {
          setCurrentRestaurant(data.data.restaurantData);
          setDishes(data.data.menuData || []);
          setCategories(data.data.categoriesData || []);
          setIsLoading(false);
        } else {
          showToast("No data received from server.", "error");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Failed to fetch restaurant data.", "error");
        sessionStorage.removeItem(KEYS.JWT_TOKEN);
        router.push("/admin/login");
      }
    };

    fetchData();
  }, []);

  // Removed manual scroll listener in favor of Framer Motion useScroll

  const dishesByCategory: DishesByCategory = dishes.reduce(
    (acc: DishesByCategory, dish: Dish) => {
      const category = dish.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dish);
      return acc;
    },
    {} as DishesByCategory,
  );

  const handleAddDish = async (newDish: Omit<Dish, 'id'> & { id?: string }) => {
    try {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) return;

      const addedDish = await db.addDish(token, newDish);
      if (addedDish) {
        setDishes([...dishes, addedDish]);
        setShowAddModal(false);
        showToast("Dish added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding dish:", error);
      showToast("Failed to add dish.", "error");
    }
  };

  const handleEditDish = async (updatedDish: Dish) => {
    try {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) return;

      const editedDish = await db.updateDish(token, updatedDish.id, updatedDish);
      if (!editedDish) {
        showToast("Failed to update dish.", "error");
        return;
      }
      setDishes(dishes.map((d) => (d.id === editedDish.id ? editedDish : d)));
      setEditingDish(null);
      showToast("Dish updated successfully!", "success");
    } catch (error) {
      console.error("Error updating dish:", error);
      showToast("Failed to update dish.", "error");
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    if (confirm("Are you sure you want to delete this dish?")) {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
        if (!token) return;

        await db.deleteDish(token, dishId);
        setDishes(dishes.filter((d) => d.id !== dishId));
        showToast("Dish deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting dish:", error);
        showToast("Failed to delete dish.", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative">
            <Icons.Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <input
              type="text"
              placeholder="Search dishes by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-100/50 border-2 border-transparent 
                     rounded-xl text-gray-900 placeholder-gray-500
                     focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10
                     transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 hover:bg-gray-200 p-1 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto lg:px-8 py-4">
        <div className="space-y-2">
          {Object.keys(dishesByCategory).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Icons.Plus size={28} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No dishes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your menu by adding your first dish
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white 
                       font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Icons.Plus size={20} />
                Add First Dish
              </button>
            </div>
          ) : (
            Object.keys(dishesByCategory).map((category) => {
              const filteredDishes = dishesByCategory[category].filter(
                (dish) => {
                  const lowerCaseQuery = searchQuery.toLowerCase();
                  return (
                    dish.name.toLowerCase().includes(lowerCaseQuery) ||
                    dish.category.toLowerCase().includes(lowerCaseQuery) ||
                    dish.description.toLowerCase().includes(lowerCaseQuery)
                  );
                },
              );

              if (searchQuery && filteredDishes.length === 0) {
                return null;
              }

              return (
                <Disclosure
                  key={category}
                  as="div"
                  className="bg-white rounded-xl shadow-sm"
                  defaultOpen={true}
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className="w-full flex justify-between items-center px-4 py-4 
                                                  text-left hover:bg-gray-50 transition-colors rounded-xl"
                      >
                        <span className="text-lg font-bold text-gray-900">
                          {category}
                        </span>
                        <Icons.ChevronUp
                          className={`${
                            open ? "" : "transform rotate-180"
                          } w-5 h-5 text-orange-600 transition-transform`}
                        />
                      </Disclosure.Button>

                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel
                          as={motion.div}
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { 
                              transition: { staggerChildren: 0.1 } 
                            }
                          }}
                          className="px-4 pb-4 space-y-3"
                        >
                          {filteredDishes.map((dish) => (
                            <motion.div
                              key={dish.id}
                              variants={{
                                hidden: { opacity: 0, scale: 0.95, y: 10 },
                                visible: { opacity: 1, scale: 1, y: 0 }
                              }}
                              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 
                                                       hover:border-orange-200 hover:shadow-md transition-all group/dish"
                            >
                              <div className="flex gap-3 p-3">
                                <img
                                  src={dish.image || PLACEHOLDERS.DISH_IMAGE}
                                  alt={dish.name}
                                  className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">
                                          <div
                                            className={`w-4 h-4 border ${
                                              dish.isVeg
                                                ? "border-green-600"
                                                : "border-red-600"
                                            } flex items-center justify-center`}
                                          >
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                dish.isVeg
                                                  ? "bg-green-600"
                                                  : "bg-red-600"
                                              }`}
                                            ></div>
                                          </div>
                                        </span>
                                        <h3 className="font-bold text-gray-900 truncate">
                                          {dish.name}
                                        </h3>
                                      </div>
                                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                        {dish.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {dish.variations.map((v, i) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-orange-100 text-orange-900 px-2 py-1 rounded font-medium"
                                          >
                                            {v.size}: ₹{v.price}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex border-t">
                                <button
                                  onClick={() => setEditingDish(dish)}
                                  className="flex-1 flex items-center justify-center gap-2 py-3 
                                         text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                                >
                                  <Icons.Edit2 size={18} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDish(dish.id)}
                                  className="flex-1 flex items-center justify-center gap-2 py-3 
                                         text-red-600 hover:bg-red-50 transition-colors border-l font-medium"
                                >
                                  <Icons.Trash2 size={18} />
                                  Delete
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              );
            })
          )}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-600 text-white rounded-xl shadow-2xl flex items-center justify-center p-2 hover:bg-orange-700 transition-colors group"
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Icons.Plus size={24} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold tracking-wide">
              Add Dish
            </span>
          </div>
        </motion.button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDishModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDish}
          restaurantId={currentRestaurant?.id || ""}
          categories={categories}
        />
      )}
      {editingDish && (
        <DishEditModal
          dish={editingDish}
          onClose={() => setEditingDish(null)}
          onSave={handleEditDish}
          categories={categories}
        />
      )}
    </div>
  );
}
