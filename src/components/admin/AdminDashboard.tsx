'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminDashboard({ restaurant, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar restaurant={restaurant} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} restaurant={restaurant} />
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}