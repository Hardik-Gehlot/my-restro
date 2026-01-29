'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

// Base skeleton component with shimmer effect
export const Skeleton = ({ className = '', dark = false }: SkeletonProps & { dark?: boolean }) => {
  return (
    <div
      className={`relative overflow-hidden ${dark ? 'bg-slate-800' : 'bg-gray-200'} rounded-lg ${className}`}
    >
      <motion.div
        className={`absolute inset-0 ${dark ? 'bg-gradient-to-r from-transparent via-slate-700/40 to-transparent' : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'}`}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// Dish card skeleton for menu loading
export const DishCardSkeleton = () => {
  return (
    <div className="flex p-4 border-b border-white/40">
      <div className="flex-1 min-w-0 pr-4">
        {/* Title with veg indicator */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Price variations */}
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        {/* Description */}
        <div className="mt-2 space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      {/* Image placeholder */}
      <Skeleton className="w-28 h-28 flex-shrink-0 rounded-lg" />
    </div>
  );
};

// Category skeleton for category list
export const CategorySkeleton = () => {
  return (
    <div className="mb-4 bg-white/40 backdrop-blur-lg rounded-xl shadow-xl border border-white/60 overflow-hidden">
      {/* Category header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-6 h-6 rounded" />
      </div>
      {/* Dish items */}
      <div>
        <DishCardSkeleton />
        <DishCardSkeleton />
        <DishCardSkeleton />
      </div>
    </div>
  );
};

// Profile page skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Cover image */}
      <Skeleton className="w-full h-48 rounded-xl" />
      
      {/* Logo and name */}
      <div className="flex items-center gap-4 -mt-12 ml-6">
        <Skeleton className="w-24 h-24 rounded-full border-4 border-white" />
        <div className="pt-12 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard stats skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Menu page loading skeleton
export const MenuPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-white/40 backdrop-blur-lg border-b border-white/60 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="max-w-6xl mx-auto py-4">
        <CategorySkeleton />
        <CategorySkeleton />
      </div>
    </div>
  );
};

// Superadmin restaurants skeleton
export const SuperAdminSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" dark />
          <Skeleton className="h-4 w-64" dark />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl" dark />
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" dark />

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-7 space-y-6">
            <div className="flex items-center gap-5">
              <Skeleton className="w-16 h-16 rounded-[1.25rem]" dark />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" dark />
                <Skeleton className="h-3 w-24" dark />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-3xl" dark />
              <Skeleton className="h-16 rounded-3xl" dark />
            </div>
            <div className="flex justify-between items-center pt-5 border-t border-slate-800/50">
              <Skeleton className="h-4 w-20" dark />
              <Skeleton className="h-3 w-16" dark />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
