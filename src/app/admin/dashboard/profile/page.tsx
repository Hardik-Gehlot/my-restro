'use client';
import { useState, useEffect } from 'react';
import RestaurantEditModal from '@/components/admin/modals/RestaurantEditModal';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useToast } from '@/components/shared/CustomToast';
import { db } from '@/app/database';
import { ApiResponse, Dish, KEYS, Restaurant } from '@/types';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { whatsappLink } from '@/lib/common-data';
import { PLACEHOLDERS } from '@/lib/constants';
import FullscreenLoader from '@/components/shared/FullscreenLoader';
import { ProfileSkeleton } from '@/components/shared/Skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

    setEditingRestaurant(null);
    setIsSaving(true);

    const response = await db.updateRestaurant(token, updatedRestaurant);
    
    if (response.status === 'error') {
      showToast(response.message || "Failed to update restaurant details.", 'error');
      return;
    }

    setRestaurant(updatedRestaurant);
    showToast("Restaurant details updated successfully!", 'success');
  } catch (error) {
    console.error('Error updating restaurant:', error);
    showToast("Failed to update restaurant details.", 'error');
  } finally {
    setIsSaving(false);
  }
};

  if (!restaurant) {
    return (
      <div className="p-4 sm:p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  const isExpired = new Date(restaurant.plan_expiry || 0) <= new Date();

  return (
    <>
      <FullscreenLoader 
        isVisible={isSaving} 
        messages={["Updating restaurant details...", "Saving your changes...", "Almost done..."]} 
      />
      <div className="p-4 sm:p-6">
        {/* Restaurant Cover */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="relative h-48">
            <img 
              src={restaurant.cover_image || PLACEHOLDERS.RESTAURANT_COVER} 
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
              <img 
                src={restaurant.logo || PLACEHOLDERS.RESTAURANT_LOGO} 
                alt={restaurant.name}
                className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg"
              />
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{restaurant.name}</h2>
                <p className="text-md text-white/90 drop-shadow-sm">{restaurant.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Small Subscription Plan Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Icons.CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Active Plan</p>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {restaurant.active_plan || 'Free Plan'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Status & Expiry</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${!isExpired ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className={`text-sm font-bold ${!isExpired ? 'text-green-700' : 'text-red-700'}`}>
                    {!isExpired ? 'Valid' : 'Expired'}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm font-medium text-gray-700">
                    {restaurant.plan_expiry ? new Date(restaurant.plan_expiry).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {isExpired && (
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-md group"
              >
                <Icons.Phone className="w-4 h-4 group-hover:animate-bounce" />
                Contact Admin
              </a>
            )}
            
            {!isExpired && restaurant.plan_expiry && (
               <div className="bg-blue-50 px-3 py-1 rounded-full text-[10px] font-bold text-blue-700 uppercase">
                 {Math.ceil((new Date(restaurant.plan_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left
               </div>
            )}
          </div>
        </div>

        {/* Restaurant Information Card */}
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
              <p className="text-base text-gray-900">{restaurant.mobile_no}</p>
            </div>

                        {restaurant.google_map_link && (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Google Maps</label>
                            <a
                              href={restaurant.google_map_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.MapPin size={16} /> View on Google Maps
                            </a>
                          </div>
                        )}
            
                        {restaurant.google_rating_link && (
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Google Rating</label>
                            <a
                              href={restaurant.google_rating_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.Edit2 size={16} /> Rate on Google
                            </a>
                          </div>
                        )}
            
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1">About Us</label>
              <p className="text-base text-gray-900">{restaurant.about_us}</p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Social Media</h4>
            <div className="flex flex-wrap gap-4">
              {restaurant.instagram_link && (
                <a href={restaurant.instagram_link} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 flex items-center gap-2">
                  <Icons.Instagram size={24} />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {restaurant.facebook_link && (
                <a href={restaurant.facebook_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                  <Icons.Facebook size={24} />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
              {restaurant.twitter_link && (
                <a href={restaurant.twitter_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 flex items-center gap-2">
                  <Icons.Twitter size={24} />
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {restaurant.linkedin_link && (
                <a href={restaurant.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 flex items-center gap-2">
                  <Icons.Linkedin size={24} />
                  <span className="sr-only">LinkedIn</span>
                </a>
              )}
              {restaurant.youtube_link && (
                <a href={restaurant.youtube_link} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 flex items-center gap-2">
                  <Icons.Youtube size={24} />
                  <span className="sr-only">YouTube</span>
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => setEditingRestaurant(restaurant)}
            className="w-full mt-8 bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Icons.Edit2 size={20} />
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
    </>
  );
}