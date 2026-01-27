'use client';
import { useState, useEffect } from 'react';
import { Edit2, Instagram, Facebook, Twitter, Linkedin, Youtube, MapPin } from 'lucide-react';
import RestaurantEditModal from '@/components/admin/modals/RestaurantEditModal';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useToast } from '@/components/shared/CustomToast';
import { db } from '@/app/database';
import { ApiResponse, Dish, KEYS, Restaurant } from '@/types';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
        
        if (!token || token.length === 0) {
          console.log('No token found in menu page, redirecting to login');
          router.push('/admin/login');
          return;
        }
        
        const data: ApiResponse = await db.getAdminRestaurantDataWithMenu(token);
        console.log('Fetched restaurant data admin profile:', data);
        if (data.status === 'error') {
          if (typeof data?.message === 'string') {
            showToast(data.message, 'error');
          } else {
            showToast("Failed to fetch restaurant data.", 'error');
          }
          sessionStorage.removeItem(KEYS.JWT_TOKEN);
          router.push('/admin/login');
          return;
        }
        
        if (data.data) {
          setRestaurant(data.data.restaurantData);
          setIsLoading(false);
        } else {
          showToast("No data received from server.", 'error');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast("Failed to fetch restaurant data.", 'error');
        sessionStorage.removeItem(KEYS.JWT_TOKEN);
        router.push('/admin/login');
      }
    };
    
    fetchData();
  }, []);

  const handleUpdateRestaurant = async (updatedRestaurant: Restaurant) => {
  try {
    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) {
      showToast("Authentication required. Please login again.", 'error');
      router.push('/admin/login');
      return;
    }

    const response = await db.updateRestaurant(token, updatedRestaurant);
    
    if (response.status === 'error') {
      showToast(response.message || "Failed to update restaurant details.", 'error');
      return;
    }

    setRestaurant(updatedRestaurant);
    setEditingRestaurant(null);
    showToast("Restaurant details updated successfully!", 'success');
  } catch (error) {
    console.error('Error updating restaurant:', error);
    showToast("Failed to update restaurant details.", 'error');
  }
};

  if (!restaurant) {
    return (
      <div>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 sm:p-6">
        {/* Restaurant Cover */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="relative h-48">
            <img 
              src={restaurant.coverImage} 
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
              <img 
                src={restaurant.logo} 
                alt={restaurant.name}
                className="w-20 h-20 rounded-full border-4 border-white object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{restaurant.name}</h2>
                <p className="text-md text-white/90">{restaurant.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Restaurant Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Restaurant Name</label>
              <p className="text-base text-gray-900">{restaurant.name}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Tagline</label>
              <p className="text-base text-gray-900">{restaurant.tagline}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Mobile Number</label>
              <p className="text-base text-gray-900">{restaurant.mobileNo}</p>
            </div>

                        {restaurant.googleMapLink && (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Google Maps</label>
                            <a
                              href={restaurant.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <MapPin size={16} /> View on Google Maps
                            </a>
                          </div>
                        )}
            
                        {restaurant.googleRatingLink && (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Google Rating</label>
                            <a
                              href={restaurant.googleRatingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Edit2 size={16} /> Rate on Google
                            </a>
                          </div>
                        )}
            
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1">About Us</label>
              <p className="text-base text-gray-900">{restaurant.aboutus}</p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Social Media</h4>
            <div className="flex flex-wrap gap-4">
              {restaurant.instagramLink && (
                <a href={restaurant.instagramLink} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 flex items-center gap-2">
                  <Instagram size={24} />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {restaurant.facebookLink && (
                <a href={restaurant.facebookLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                  <Facebook size={24} />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
              {restaurant.twitterLink && (
                <a href={restaurant.twitterLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 flex items-center gap-2">
                  <Twitter size={24} />
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {restaurant.linkedinLink && (
                <a href={restaurant.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 flex items-center gap-2">
                  <Linkedin size={24} />
                  <span className="sr-only">LinkedIn</span>
                </a>
              )}
              {restaurant.youtubeLink && (
                <a href={restaurant.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 flex items-center gap-2">
                  <Youtube size={24} />
                  <span className="sr-only">YouTube</span>
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => setEditingRestaurant(restaurant)}
            className="w-full mt-8 bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Edit2 size={20} />
            Edit Restaurant Details
          </button>
        </div>

        {editingRestaurant && (
          <RestaurantEditModal
            restaurant={editingRestaurant}
            onClose={() => setEditingRestaurant(null)}
            onSave={handleUpdateRestaurant}
          />
        )}
      </div>
    </div>
  );
}