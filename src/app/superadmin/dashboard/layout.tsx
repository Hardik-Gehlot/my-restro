'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KEYS } from '@/types';
import jwt from 'jsonwebtoken';
import SuperadminSidebar from '@/components/superadmin/Sidebar';
import { Icons } from '@/lib/icons';
import { ToastProvider } from '@/components/shared/CustomToast';
import { WEBSITE_DETAILS } from '@/lib/common-data';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const payload = jwt.decode(token) as any;
        if (payload.role !== 'superadmin') {
          router.push('/admin/dashboard');
          return;
        }
        setIsAuthorized(true);
      } catch (e) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex bg-slate-950 items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <SuperadminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header (Mobile) */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
                  <WEBSITE_DETAILS.icon className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-white uppercase tracking-wider text-sm">{WEBSITE_DETAILS.name}</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
