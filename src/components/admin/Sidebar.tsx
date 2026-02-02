'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Icons } from '@/lib/icons';
import { db } from '@/app/database';
import { PLACEHOLDERS } from '@/lib/constants';

import { Restaurant } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import FullscreenLoader from '../shared/FullscreenLoader';

interface SidebarProps {
  restaurant: Restaurant | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ restaurant, open, setOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { href: '/admin/dashboard/profile', icon: Icons.FiUser, label: 'Profile' },
    { href: '/admin/dashboard/menu', icon: Icons.BiSolidDish, label: 'Menu' },
    { href: '/admin/dashboard/category', icon: Icons.HiMiniRectangleStack, label: 'Category' },
    { 
      href: '/admin/dashboard/ordering', 
      icon: Icons.FiShoppingCart, 
      label: 'Ordering & Billing',
      visible: restaurant?.active_plan && restaurant.active_plan !== 'menu'
    },
    { href: '/admin/dashboard/setting', icon: Icons.IoIosSettings, label: 'Settings' },
  ].filter(link => link.visible !== false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      // Close sidebar first as per user request
      setOpen(false);
      
      // Start logout loading state
      setIsLoggingOut(true);
      
      try {
        await db.logout();
        // Use a small delay for a smoother transition
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 800);
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoggingOut(false);
      }
    }
  };

  const sidebarContent = (
    <div className="bg-white h-full flex flex-col shadow-lg overflow-y-auto">
      <div className="p-6 text-center border-b">
        <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-2 border-orange-200">
          <img 
            src={restaurant?.logo || PLACEHOLDERS.RESTAURANT_LOGO}
            alt={restaurant?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{restaurant?.name}</h2>
        <p className="text-sm text-gray-600">{restaurant?.tagline}</p>
      </div>

      <nav className="flex-1 mt-6">
        <ul>
          {navLinks.map((link) => (
            <li key={link.href} className="px-4 mb-2">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium relative group ${
                  pathname.startsWith(link.href)
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {pathname.startsWith(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.2 }}
                  className="relative z-10"
                >
                  <link.icon className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-red-600 bg-red-50 hover:bg-red-100"
        >
          <Icons.FiLogOut className="w-6 h-6" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <FullscreenLoader 
        isVisible={isLoggingOut} 
        messages={["Logging out safely...", "Clearing your session...", "Redirecting to login..."]} 
      />
      
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[100] lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <Icons.FiX className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
                {sidebarContent}
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-[100]">
        <div className="flex flex-col w-64">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
