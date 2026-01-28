'use client';

import { FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Restaurant } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
  restaurant: Restaurant | null;
}

const Header = ({ onMenuClick, restaurant }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:z-10 shadow-sm border-b border-gray-100">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </motion.button>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-2 text-lg font-bold text-gray-900 truncate"
            >
              {restaurant?.name}
            </motion.h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
