'use client';
import React, { useState, useEffect } from 'react';
import { Menu, User, Plus, Edit2, Trash2, LogOut, Search, Filter } from 'lucide-react';

// Mock data from the document
const mockRestaurants = [
  {
    id: "pizza_paradise_123",
    name: "Pizza Paradise",
    tagline: "Authentic Italian Pizzas & Pasta",
    mobileNo: "+91-9876543210",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Pizza+Paradise+Mumbai",
    googleRatingLink: "https://www.google.com/maps/search/Pizza+Paradise/@19.0760,72.8777,12z",
    aboutus: "We serve authentic Italian cuisine with passion",
  },
  {
    id: "spice_route_456",
    name: "Spice Route",
    tagline: "Royal Indian Cuisine",
    mobileNo: "+91-9123456789",
    logo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Spice+Route+Bangalore",
    googleRatingLink: "https://www.google.com/maps/search/Spice+Route/@12.9716,77.5946,12z",
    aboutus: "Experience royal Indian flavors",
  },
  {
    id: "burger_hub_789",
    name: "Burger Hub",
    tagline: "Gourmet Burgers & Shakes",
    mobileNo: "+91-9988776655",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop",
    googleMapLink: "https://maps.google.com/?q=Burger+Hub+Delhi",
    googleRatingLink: "https://www.google.com/maps/search/Burger+Hub/@28.7041,77.1025,12z",
    aboutus: "Best gourmet burgers in town",
  },
];

const initialDishes = [
  {
    id: "dish_001",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Margherita Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Pizza",
    description: "Classic Italian pizza with San Marzano tomatoes, fresh mozzarella, basil leaves",
    variations: [
      { size: "small", price: 249 },
      { size: "medium", price: 349 },
      { size: "large", price: 449 },
    ],
  },
  {
    id: "dish_002",
    restaurantId: "pizza_paradise_123",
    isVeg: false,
    name: "Pepperoni Feast",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Pizza",
    description: "Loaded with premium pepperoni slices, mozzarella cheese, oregano",
    variations: [
      { size: "small", price: 299 },
      { size: "medium", price: 449 },
      { size: "large", price: 549 },
    ],
  },
];

// Add Dish Modal Component
const AddDishModal = ({ onClose, onSave, restaurantId }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    category: "Pizza",
    isVeg: true,
    variations: [{ size: "small", price: 0 }]
  });

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addVariation = () => {
    setForm(prev => ({
      ...prev,
      variations: [...prev.variations, { size: "medium", price: 0 }]
    }));
  };

  const updateVariation = (index, field, value) => {
    const newVariations = [...form.variations];
    newVariations[index][field] = field === 'price' ? Number(value) : value;
    setForm(prev => ({ ...prev, variations: newVariations }));
  };

  const removeVariation = (index) => {
    setForm(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.image || form.variations.length === 0) {
      alert("Please fill all required fields");
      return;
    }
    onSave({
      ...form,
      id: `dish_${Date.now()}`,
      restaurantId
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Dish</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Dish Name *</label>
            <input
              placeholder="Enter dish name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Image URL *</label>
            <input
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
            <textarea
              placeholder="Describe your dish"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
              >
                <option>Pizza</option>
                <option>Pasta</option>
                <option>Burgers</option>
                <option>Sides</option>
                <option>Beverages</option>
                <option>Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Type</label>
              <select
                value={form.isVeg}
                onChange={(e) => update("isVeg", e.target.value === 'true')}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
              >
                <option value="true">Veg</option>
                <option value="false">Non-Veg</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-900">Price Variations *</label>
              <button
                onClick={addVariation}
                className="text-orange-600 text-sm font-medium hover:text-orange-700"
              >
                + Add Size
              </button>
            </div>
            {form.variations.map((variation, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={variation.size}
                  onChange={(e) => updateVariation(index, 'size', e.target.value)}
                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="half">Half</option>
                  <option value="full">Full</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={variation.price}
                  onChange={(e) => updateVariation(index, 'price', e.target.value)}
                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                />
                {form.variations.length > 1 && (
                  <button
                    onClick={() => removeVariation(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-900 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-lg bg-orange-600 text-white font-medium"
          >
            Add Dish
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Dish Modal Component
const DishEditModal = ({ dish, onClose, onSave }) => {
  const [form, setForm] = useState(dish);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateVariation = (index, field, value) => {
    const newVariations = [...form.variations];
    newVariations[index][field] = field === 'price' ? Number(value) : value;
    setForm(prev => ({ ...prev, variations: newVariations }));
  };

  const addVariation = () => {
    setForm(prev => ({
      ...prev,
      variations: [...prev.variations, { size: "medium", price: 0 }]
    }));
  };

  const removeVariation = (index) => {
    setForm(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Dish</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Dish Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Image URL</label>
            <input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
              >
                <option>Pizza</option>
                <option>Pasta</option>
                <option>Burgers</option>
                <option>Sides</option>
                <option>Beverages</option>
                <option>Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Type</label>
              <select
                value={form.isVeg}
                onChange={(e) => update("isVeg", e.target.value === 'true')}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
              >
                <option value="true">Veg</option>
                <option value="false">Non-Veg</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-900">Price Variations</label>
              <button
                onClick={addVariation}
                className="text-orange-600 text-sm font-medium hover:text-orange-700"
              >
                + Add Size
              </button>
            </div>
            {form.variations.map((variation, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={variation.size}
                  onChange={(e) => updateVariation(index, 'size', e.target.value)}
                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="half">Half</option>
                  <option value="full">Full</option>
                </select>
                <input
                  type="number"
                  value={variation.price}
                  onChange={(e) => updateVariation(index, 'price', e.target.value)}
                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                />
                {form.variations.length > 1 && (
                  <button
                    onClick={() => removeVariation(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-900 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-lg bg-orange-600 text-white font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Restaurant Edit Modal Component
const RestaurantEditModal = ({ restaurant, onClose, onSave }) => {
  const [form, setForm] = useState(restaurant);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Restaurant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Restaurant Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Mobile Number</label>
            <input
              value={form.mobileNo}
              onChange={(e) => update("mobileNo", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Logo URL</label>
            <input
              value={form.logo}
              onChange={(e) => update("logo", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Cover Image URL</label>
            <input
              value={form.coverImage}
              onChange={(e) => update("coverImage", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">About Us</label>
            <textarea
              value={form.aboutus}
              onChange={(e) => update("aboutus", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Google Maps Link</label>
            <input
              value={form.googleMapLink}
              onChange={(e) => update("googleMapLink", e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-900 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-lg bg-orange-600 text-white font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [currentRestaurant, setCurrentRestaurant] = useState(mockRestaurants[0]);
  const [dishes, setDishes] = useState(initialDishes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVeg, setFilterVeg] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  // Filter dishes
  const filteredDishes = dishes.filter(dish => {
    if (dish.restaurantId !== currentRestaurant.id) return false;
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory !== 'all' && dish.category !== filterCategory) return false;
    if (filterVeg === 'veg' && !dish.isVeg) return false;
    if (filterVeg === 'nonveg' && dish.isVeg) return false;
    return true;
  });

  const categories = ['all', ...new Set(dishes.filter(d => d.restaurantId === currentRestaurant.id).map(d => d.category))];

  const handleAddDish = (newDish) => {
    setDishes([...dishes, newDish]);
    setShowAddModal(false);
  };

  const handleEditDish = (updatedDish) => {
    setDishes(dishes.map(d => d.id === updatedDish.id ? updatedDish : d));
    setEditingDish(null);
  };

  const handleDeleteDish = (dishId) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      setDishes(dishes.filter(d => d.id !== dishId));
    }
  };

  const handleUpdateRestaurant = (updatedRestaurant) => {
    setCurrentRestaurant(updatedRestaurant);
    setEditingRestaurant(null);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={currentRestaurant.logo} 
              alt={currentRestaurant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{currentRestaurant.name}</h1>
              <p className="text-sm text-gray-700">{currentRestaurant.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'menu' ? (
        <div className="px-4 py-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ${
                    filterCategory === cat 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFilterVeg('all')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                  filterVeg === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVeg('veg')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                  filterVeg === 'veg' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                🟢 Veg
              </button>
              <button
                onClick={() => setFilterVeg('nonveg')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                  filterVeg === 'nonveg' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>

          {/* Add Dish Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold mb-4 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Add New Dish
          </button>

          {/* Dishes List */}
          <div className="space-y-3">
            {filteredDishes.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg font-medium">No dishes found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new dish</p>
              </div>
            ) : (
              filteredDishes.map(dish => (
                <div key={dish.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
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
                          <p className="text-xs text-gray-700 mb-1">{dish.category}</p>
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{dish.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {dish.variations.map((v, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
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
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Profile Tab
        <div className="px-4 py-4">
          {/* Restaurant Cover */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="relative h-40">
              <img 
                src={currentRestaurant.coverImage} 
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <img 
                  src={currentRestaurant.logo} 
                  alt={currentRestaurant.name}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{currentRestaurant.name}</h2>
                  <p className="text-sm text-white/90">{currentRestaurant.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Restaurant Name</label>
                <p className="text-base text-gray-900">{currentRestaurant.name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Tagline</label>
                <p className="text-base text-gray-900">{currentRestaurant.tagline}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Mobile Number</label>
                <p className="text-base text-gray-900">{currentRestaurant.mobileNo}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">About Us</label>
                <p className="text-base text-gray-900">{currentRestaurant.aboutus}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Google Maps</label>
                <a 
                  href={currentRestaurant.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>

            <button
              onClick={() => setEditingRestaurant(currentRestaurant)}
              className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Edit2 size={20} />
              Edit Restaurant Details
            </button>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {dishes.filter(d => d.restaurantId === currentRestaurant.id).length}
                </p>
                <p className="text-sm text-gray-700 mt-1">Total Dishes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {dishes.filter(d => d.restaurantId === currentRestaurant.id && d.isVeg).length}
                </p>
                <p className="text-sm text-gray-700 mt-1">Veg Dishes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {dishes.filter(d => d.restaurantId === currentRestaurant.id && !d.isVeg).length}
                </p>
                <p className="text-sm text-gray-700 mt-1">Non-Veg</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              activeTab === 'menu' 
                ? 'text-orange-600' 
                : 'text-gray-600'
            }`}
          >
            <Menu size={24} />
            <span className="text-xs font-medium mt-1">Menu</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              activeTab === 'profile' 
                ? 'text-orange-600' 
                : 'text-gray-600'
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium mt-1">Profile</span>
          </button>
        </div>
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

      {editingRestaurant && (
        <RestaurantEditModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={handleUpdateRestaurant}
        />
      )}
    </div>
  );
}