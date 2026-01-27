'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { WEBSITE_DETAILS } from '@/lib/common-data';
import { motion } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const menuItems = [
  { name: 'Dashboard', icon: Icons.Layout, path: '/superadmin/dashboard' },
  { name: 'Restaurants', icon: Icons.Store, path: '/superadmin/dashboard/restaurants' },
];

export default function SuperadminSidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64
        bg-slate-950 border-r border-slate-800
        transition-transform duration-300 transform
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <WEBSITE_DETAILS.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                {WEBSITE_DETAILS.name}
              </h1>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none">SuperAdmin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}
                  `}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-500 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/admin/login';
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
            >
              <Icons.LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
