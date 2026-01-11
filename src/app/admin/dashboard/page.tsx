'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/menu');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  );
}
