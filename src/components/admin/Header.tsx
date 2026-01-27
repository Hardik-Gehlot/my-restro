'use client';

import { FiMenu } from 'react-icons/fi';

import { Restaurant } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
  restaurant: Restaurant | null;
}

const Header = ({ onMenuClick, restaurant }: HeaderProps) => {
  return (
    <header className="bg-white sticky shadow-sm lg:hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-4 text-lg font-bold text-gray-900">{restaurant?.name}</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
