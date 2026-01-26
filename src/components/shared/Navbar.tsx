"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { WEBSITE_DETAILS } from "@/lib/common-data";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Icons.FiAward className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {WEBSITE_DETAILS.name}
              </h1>
              <p className="text-xs text-gray-500">Discover Great Food</p>
            </div>
          </Link>

          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
          >
            <Icons.FiArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
