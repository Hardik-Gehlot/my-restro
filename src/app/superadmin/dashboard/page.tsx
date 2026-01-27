'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/database';
import { KEYS, ApiResponse } from '@/types';
import { Icons } from '@/lib/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) return;

      const response = await db.getSuperStats(token);
      if (response.status === 'success' && response.data) {
        setStats(response.data.stats);
        setRestaurants(response.data.restaurants);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const statCards = [
    { name: 'Total Revenue', value: stats?.totalRevenue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), icon: Icons.CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { name: 'Total Restaurants', value: stats?.totalRestaurants, icon: Icons.Store, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time statistics & global restaurant performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-2xl border ${card.border} ${card.bg} backdrop-blur-md relative overflow-hidden group hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon className="w-16 h-16" />
            </div>
            <div className={`p-2 w-fit rounded-lg ${card.bg.replace('/10', '/20')} ${card.color} mb-4`}>
                <card.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">{card.name}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main List Table */}
        <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Recent Expiring Plans</h2>
                    <Link href="/superadmin/dashboard/restaurants" className="text-cyan-400 text-sm font-bold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Restaurant</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {restaurants.slice(0, 5).map((rest) => {
                                const isExpired = new Date(rest.plan_expiry) <= new Date();
                                return (
                                    <tr key={rest.id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={rest.logo} alt={rest.name} className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 object-cover" />
                                                <div>
                                                    <p className="text-white font-bold group-hover:text-cyan-400 transition-colors">{rest.name}</p>
                                                    <p className="text-xs text-slate-500">{rest.mobile_no}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                rest.active_plan === 'complete' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                rest.active_plan === 'basic' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                                            }`}>
                                                {rest.active_plan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-300 font-medium">
                                                {new Date(rest.plan_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${!isExpired ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                <span className={`text-xs font-bold ${!isExpired ? 'text-green-500' : 'text-red-500'}`}>
                                                    {!isExpired ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Plan Breakdown Chart/Cards */}
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-6">Plan Breakdown</h2>
                <div className="space-y-4">
                    {Object.entries(stats?.plans || {}).map(([plan, count]: [string, any]) => (
                        <div key={plan} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="capitalize text-slate-300 font-medium">{plan}</span>
                                <span className="text-white font-bold">{count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / stats!.totalRestaurants) * 100}%` }}
                                    className={`h-full ${
                                        plan === 'complete' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                                        plan === 'basic' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                        'bg-slate-600'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-800">
                     <div className="flex items-center gap-4 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                         <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                             <Icons.Clock className="w-5 h-5 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                         </div>
                         <div>
                             <p className="text-xs font-bold text-cyan-400 uppercase tracking-tight">System Status</p>
                             <p className="text-sm text-slate-300">All systems operational</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
