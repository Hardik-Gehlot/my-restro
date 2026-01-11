'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronUp } from 'lucide-react';
import { db } from '@/lib/mock-data';
import AddDishModal from '@/components/admin/modals/AddDishModal';
import DishEditModal from '@/components/admin/modals/DishEditModal';
import { Disclosure, Transition } from '@headlessui/react';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { fetchAllRestaurantData } from '@/lib/common-data';
import { useToast } from '@/components/shared/CustomToast';

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch restaurant and dishes data
    const fetchData = async () => {
      try {
        // In a real app, you'd get the logged-in user's restaurant ID
        const restaurantId = "pizza_paradise_123";
        const data = await fetchAllRestaurantData(restaurantId);
        setCurrentRestaurant(data.restaurant);
        setDishes(data.dishes);
      } catch (error) {
        showToast("Failed to fetch restaurant data.", 'error');
      }
    };
    fetchData();
  }, []);

  // Group dishes by category
  const dishesByCategory = dishes.reduce((acc, dish) => {
    const category = dish.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dish);
    return acc;
  }, {});

  const handleAddDish = async (newDish) => {
    try {
      const addedDish = await db.addDish(newDish);
      setDishes([...dishes, addedDish]);
      setShowAddModal(false);
      showToast("Dish added successfully!", 'success');
    } catch (error) {
      showToast("Failed to add dish.", 'error');
    }
  };

  const handleEditDish = async (updatedDish) => {
    try {
      const editedDish = await db.updateDish(updatedDish.id, updatedDish);
      setDishes(dishes.map(d => d.id === editedDish.id ? editedDish : d));
      setEditingDish(null);
      showToast("Dish updated successfully!", 'success');
    } catch (error) {
      showToast("Failed to update dish.", 'error');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      try {
        await db.deleteDish(dishId);
        setDishes(dishes.filter(d => d.id !== dishId));
        showToast("Dish deleted successfully!", 'success');
      } catch (error) {
        showToast("Failed to delete dish.", 'error');
      }
    }
  };
  
  if (!currentRestaurant) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6">
        {/* Search and Add Dish */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search dishes by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Dish</span>
              </button>
          </div>
        </div>

        {/* Dishes List by Category */}
        <div className="space-y-4">
          {Object.keys(dishesByCategory).map(category => {
              const filteredDishes = dishesByCategory[category].filter(dish => {
                  const lowerCaseQuery = searchQuery.toLowerCase();
                  return (
                      dish.name.toLowerCase().includes(lowerCaseQuery) ||
                      dish.category.toLowerCase().includes(lowerCaseQuery) ||
                      dish.description.toLowerCase().includes(lowerCaseQuery)
                  );
              });

              if (searchQuery && filteredDishes.length === 0) {
                  return null;
              }

              return (
                  <Disclosure key={category} as="div" className="bg-white rounded-xl shadow-sm" defaultOpen={true}>
                  {({ open }) => (
                      <>
                      <Disclosure.Button className="w-full flex justify-between items-center px-4 py-4 text-left text-lg font-bold text-gray-900">
                          <span>{category}</span>
                          <ChevronUp
                          className={`${
                              open ? '' : 'transform rotate-180'
                          } w-5 h-5 text-orange-600`}
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
                          <Disclosure.Panel as="div" className="px-4 pb-4 space-y-3">
                          {filteredDishes.map(dish => (
                              <div key={dish.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                  <div className="flex gap-3 p-3">
                                  <img 
                                      src={dish.image} 
                                      alt={dish.name}
                                      className="w-24 h-24 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                          <span className="text-lg">{dish.isVeg ? '🟢' : '🔴'}</span>
                                          <h3 className="font-bold text-gray-900 truncate">{dish.name}</h3>
                                          </div>
                                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{dish.description}</p>
                                          <div className="flex flex-wrap gap-1">
                                          {dish.variations.map((v, i) => (
                                              <span key={i} className="text-xs bg-gray-200 text-gray-900 px-2 py-1 rounded">
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
                                      className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                                  >
                                      <Edit2 size={18} />
                                      Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeleteDish(dish.id)}
                                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 transition-colors border-l font-medium"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                                  </div>
                              </div>
                              ))}
                          </Disclosure.Panel>
                      </Transition>
                      </>
                  )}
                  </Disclosure>
              );
          })}
          </div>


        {/* Modals */}
        {showAddModal && (
          <AddDishModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddDish}
            restaurantId={currentRestaurant.id}
          />
        )}
        {editingDish && (
          <DishEditModal
            dish={editingDish}
            onClose={() => setEditingDish(null)}
            onSave={handleEditDish}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}