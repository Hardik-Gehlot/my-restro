'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { KEYS, Restaurant } from '@/types';
import { db } from '@/app/database';
import { useRouter } from 'next/navigation';
import { useToast } from '../shared/CustomToast';

export default function AdminDashboard({ children }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurant,setRestaurant] = useState<Restaurant|null>(null);
  const {showToast} = useToast();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(()=>{
    const loadData = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
        console.log('Fetched token:', token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/admin/login');
          return;
        }

        const { status, data, message } = await db.getAdminRestaurantDataWithMenu(token);
        
        if (status === 'error') {
          console.log('AdminDashboard Error fetching restaurant data:', message);
          showToast(message || 'Failed to fetch restaurant data.', 'error');
          sessionStorage.removeItem(KEYS.JWT_TOKEN);
          router.push('/admin/login');
          return;
        }

        if (data?.restaurantData) {
          setRestaurant(data.restaurantData);
          setIsLoading(false);
        } else {
          console.log('No restaurant data found');
          showToast('Failed to load restaurant data.', 'error');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        showToast('An error occurred while loading data.', 'error');
        sessionStorage.removeItem(KEYS.JWT_TOKEN);
        router.push('/admin/login');
      }
    };

    loadData();
  }, [router, showToast]); 
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar restaurant={restaurant} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} restaurant={restaurant} />
        <main className="flex-1">
          <div className="mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}