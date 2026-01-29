'use client';
import { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/database';
import { KEYS, ApiResponse } from '@/types';
import { Icons } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { pricingSection } from '@/lib/common-data';
import { useToast } from '@/components/shared/CustomToast';
import { PLACEHOLDERS } from '@/lib/constants';
import FullscreenLoader from '@/components/shared/FullscreenLoader';
import { SuperAdminSkeleton } from '@/components/shared/Skeleton';

interface SuperadminRestaurant {
  id: string;
  name: string;
  mobile_no: string;
  logo: string | null;
  active_plan: string;
  plan_expiry: string;
  planAmount: number;
  createdAt: string;
}

interface PlanFormState {
  plan: string;
  expiryOption: string;
  amount: string; // Keep as string for text input
}

interface CreateFormState {
  name: string;
  mobile_no: string;
  email: string;
  password: string;
}

interface DishPayload {
  name?: string;
  dishName?: string;
  category?: string;
  description?: string;
  price?: string | number;
  size?: string;
  image?: string;
  isVeg?: boolean | string;
}

export default function SuperadminRestaurants() {
  const [restaurants, setRestaurants] = useState<SuperadminRestaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<SuperadminRestaurant | null>(null);
  const [bulkDishData, setBulkDishData] = useState<DishPayload[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');
  
  const { showToast } = useToast();

  // Form States
  const [planForm, setPlanForm] = useState<PlanFormState>({ plan: 'basic', expiryOption: '1_year', amount: '1999' });
  const [pwdForm, setPwdForm] = useState({ newPassword: '' });
  const [createForm, setCreateForm] = useState<CreateFormState>({ name: '', mobile_no: '', email: '', password: '' });

  const fetchRestaurants = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) return;
    const response = await db.getSuperStats(token);
    if (response.status === 'success' && response.data) {
      setRestaurants(response.data.restaurants);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleDownloadSample = () => {
    const headers = [
      ['name', 'category', 'description', 'price', 'size', 'image', 'isVeg']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dishes_Template");
    XLSX.writeFile(wb, "my-restro-dish-template.xlsx");
    showToast('Template download started', 'info');
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as DishPayload[];
        setBulkDishData(data);
        showToast(`Parsed ${data.length} dishes`, 'success');
      } catch (err) {
        showToast('Failed to parse Excel file', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleBulkInsert = async () => {
    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token || !selectedRestaurant || bulkDishData.length === 0) return;

    setIsSaving(true);
    setSavingMessage(`Uploading ${bulkDishData.length} dishes...`);
    
    try {
      const res = await db.bulkUploadDishes(token, selectedRestaurant.id, bulkDishData);
      if (res.status === 'success') {
        showToast(res.message || 'Bulk upload successful', 'success');
        setBulkDishData([]);
        setIsBulkModalOpen(false);
      } else {
        showToast(res.message || 'Bulk upload failed', 'error');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      showToast('An error occurred during bulk upload', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlan = async () => {
    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token || !selectedRestaurant) return;

    let durationDays = 365;
    if (planForm.expiryOption === '3_days') durationDays = 3;
    if (planForm.expiryOption === '0_days') durationDays = 0;
    if (planForm.expiryOption === '3_month') durationDays = 90;
    if (planForm.expiryOption === '6_month') durationDays = 180;
    if (planForm.expiryOption === '9_month') durationDays = 270;
    if (planForm.expiryOption === '1_year') durationDays = 365;

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + durationDays);

    const amountNum = parseFloat(planForm.amount) || 0;

    const res = await db.updateRestaurantPlan(token, selectedRestaurant.id, planForm.plan, newExpiry.toISOString(), amountNum);
    
    setIsSaving(true);
    setSavingMessage('Updating restaurant plan...');
    
    try {
      const res = await db.updateRestaurantPlan(token, selectedRestaurant.id, planForm.plan, newExpiry.toISOString(), amountNum);
      if (res.status === 'success') {
        showToast('Plan and amount updated successfully', 'success');
        fetchRestaurants();
        setIsEditModalOpen(false);
      } else {
        showToast(res.message || 'Plan update failed', 'error');
      }
    } catch (error) {
      console.error('Update plan error:', error);
      showToast('An error occurred while updating the plan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token || !selectedRestaurant || !pwdForm.newPassword) {
          showToast('Please enter a new password', 'warning');
          return;
      }
      
      setIsSaving(true);
      setSavingMessage('Resetting password...');
      
      try {
        const res = await db.resetRestaurantPassword(token, selectedRestaurant.id, pwdForm.newPassword);
        if (res.status === 'success') {
            showToast('Password reset successfully', 'success');
            setPwdForm({ newPassword: '' });
        } else {
            showToast(res.message || 'Password reset failed', 'error');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        showToast('An error occurred while resetting password', 'error');
      } finally {
        setIsSaving(false);
      }
  };

  const handleCreateSingle = async () => {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token || !createForm.name || !createForm.mobile_no || !createForm.email || !createForm.password) {
          showToast('Please fill all fields', 'warning');
          return;
      }

      setIsSaving(true);
      setSavingMessage('Creating new restaurant...');
      
      try {
        const res = await db.createRestaurant(token, createForm.name, createForm.mobile_no, createForm.email, createForm.password);
        if (res.status === 'success') {
            showToast('Restaurant created successfully!', 'success');
            setIsCreateModalOpen(false);
            setCreateForm({ name: '', mobile_no: '', email: '', password: '' });
            fetchRestaurants();
        } else {
            showToast(res.message || 'Failed to create restaurant', 'error');
        }
      } catch (error) {
        console.error('Create restaurant error:', error);
        showToast('An error occurred while creating the restaurant', 'error');
      } finally {
        setIsSaving(false);
      }
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.mobile_no && r.mobile_no.includes(searchQuery))
    );
  }, [restaurants, searchQuery]);

  return (
    <>
      <FullscreenLoader isVisible={isSaving} messages={[savingMessage]} />
      {isLoading && restaurants.length === 0 ? (
        <SuperAdminSkeleton />
      ) : (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Restaurants</h1>
              <p className="text-slate-400 mt-1">Manage all restaurants and their subscriptions.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl transition-all text-sm font-bold shadow-xl shadow-cyan-900/20 active:scale-95"
              >
                <Icons.Plus className="w-4 h-4" />
                Add New Restaurant
              </button>
            </div>
          </div>

          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search restaurants by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-2xl backdrop-blur-sm"
            />
            <Icons.Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-6 h-6 group-focus-within:text-cyan-400 transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredRestaurants.map((rest, idx) => (
               <motion.div
                 key={rest.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/40 rounded-[2.5rem] p-7 relative overflow-hidden group transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-md"
               >
                 <div className="absolute top-0 right-0 p-5 flex gap-3">
                    <button 
                        onClick={() => {
                            setSelectedRestaurant(rest);
                            setBulkDishData([]);
                            setIsBulkModalOpen(true);
                        }}
                        title="Upload Menu"
                        className="p-3 bg-slate-800/80 hover:bg-blue-600/30 text-blue-400 rounded-2xl transition-all border border-slate-700/50 active:scale-90"
                    >
                        <Icons.FileText className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedRestaurant(rest);
                            setPlanForm({ 
                                plan: rest.active_plan || 'basic', 
                                expiryOption: '1_year', 
                                amount: (rest.planAmount || 0).toString() 
                            });
                            setIsEditModalOpen(true);
                        }}
                        className="p-3 bg-slate-800/80 hover:bg-cyan-600/30 text-cyan-400 rounded-2xl transition-all border border-slate-700/50 active:scale-90"
                    >
                        <Icons.Edit2 className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-800/50 p-2 border border-slate-700 flex items-center justify-center overflow-hidden">
                        <img src={rest.logo || PLACEHOLDERS.RESTAURANT_LOGO} alt={rest.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-xl tracking-tight leading-tight">{rest.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1 opacity-70">{rest.mobile_no || 'No mobile'}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-950/40 rounded-3xl p-4 border border-slate-800/50">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            Current Plan
                        </p>
                        <p className="text-sm font-bold text-cyan-400 capitalize bg-cyan-400/5 w-fit px-2 py-0.5 rounded-lg border border-cyan-400/10">{rest.active_plan}</p>
                    </div>
                    <div className="bg-slate-950/40 rounded-3xl p-4 border border-slate-800/50">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-white rounded-full" />
                            Expiry Date
                        </p>
                        <p className="text-sm font-bold text-white">
                            {new Date(rest.plan_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-5 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                        <div className={`w-2.5 h-2.5 rounded-full ${new Date(rest.plan_expiry) > new Date() ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                        <span className={new Date(rest.plan_expiry) > new Date() ? 'text-emerald-500 px-2 py-0.5 bg-emerald-500/5 rounded-md' : 'text-rose-500 px-2 py-0.5 bg-rose-500/5 rounded-md'}>
                             {new Date(rest.plan_expiry) > new Date() ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">{new Date(rest.createdAt).getFullYear()} Entry</span>
                 </div>
               </motion.div>
             ))}
          </div>

      {/* Modals Implementation */}
      <AnimatePresence>
          {isBulkModalOpen && selectedRestaurant && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsBulkModalOpen(false)} />
                  <motion.div 
                    initial={{scale:0.9, opacity:0}} 
                    animate={{scale:1, opacity:1}} 
                    exit={{scale:0.9, opacity:0}} 
                    className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 w-full max-w-xl relative z-10 shadow-3xl max-h-full overflow-y-auto custom-scrollbar"
                  >
                      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Menu File Upload</h2>
                      <p className="text-sm text-slate-500 mb-8 font-medium italic select-none">Restaurant: <span className="text-cyan-400 font-bold not-italic font-mono">{selectedRestaurant.name}</span></p>
                      
                      {bulkDishData.length === 0 ? (
                        <>
                          <div className="border-[3px] border-dashed border-slate-800 rounded-[2.5rem] p-16 text-center hover:border-cyan-500/30 transition-all group cursor-pointer relative bg-slate-950/30">
                              <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                              <Icons.Download className="w-16 h-16 text-slate-800 group-hover:text-cyan-500 mx-auto mb-6 transition-all transform group-hover:-translate-y-2" />
                              <p className="text-slate-500 font-bold text-lg group-hover:text-slate-300 transition-colors">Select Excel Menu File</p>
                              <p className="text-[11px] text-slate-700 mt-4 uppercase tracking-[0.2em] font-black">Dishes • Price • Category • Image</p>
                          </div>
                          <div className="mt-10 grid grid-cols-2 gap-4">
                              <button onClick={handleDownloadSample} className="flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 py-4 rounded-2xl border border-slate-800 font-bold transition-all active:scale-95">
                                  <Icons.Download className="w-5 h-5" />
                                  Download Template
                              </button>
                              <button onClick={() => setIsBulkModalOpen(false)} className="bg-slate-900/50 hover:bg-slate-800 text-slate-600 hover:text-white py-4 rounded-2xl border border-slate-800 font-bold transition-all active:scale-95">Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-8">
                            <div className="bg-slate-950/50 rounded-[2.5rem] p-8 border border-slate-800/50 max-h-72 overflow-auto custom-scrollbar">
                                <p className="text-emerald-400 font-black mb-5 flex items-center gap-3 tracking-wide uppercase text-xs">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                    {bulkDishData.length} Dishes Found
                                </p>
                                <div className="space-y-4">
                                    {bulkDishData.slice(0, 10).map((dish, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/30 last:border-0">
                                            <span className="text-sm font-bold text-slate-300">{dish.name || dish.dishName}</span>
                                            <span className="text-[10px] font-mono p-1 bg-slate-800 rounded-md text-slate-500 uppercase">{dish.category || 'GENERAL'}</span>
                                        </div>
                                    ))}
                                    {bulkDishData.length > 10 && <p className="text-xs text-slate-600 font-bold text-center pt-4 tracking-widest">+ {bulkDishData.length - 10} MORE ITEMS</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setBulkDishData([])} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all border border-slate-700 active:scale-95 uppercase text-xs tracking-widest">Clear</button>
                                <button onClick={handleBulkInsert} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-5 rounded-2xl transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-widest">
                                    <Icons.FileText className="w-5 h-5" />
                                    Upload Menu
                                </button>
                            </div>
                        </div>
                      )}
                  </motion.div>
              </div>
          )}

          {isEditModalOpen && selectedRestaurant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)} />
                  <motion.div 
                    initial={{scale:0.9, opacity:0}} 
                    animate={{scale:1, opacity:1}} 
                    exit={{scale:0.9, opacity:0}} 
                    className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 w-full max-w-2xl relative z-10 overflow-hidden shadow-3xl max-h-full overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-2 flex items-center justify-center">
                            <img src={selectedRestaurant.logo || PLACEHOLDERS.RESTAURANT_LOGO} alt={selectedRestaurant.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Update Restaurant</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">{selectedRestaurant.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Plan Update Section */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.25em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                                Manage Plan
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-600 ml-1">PLAN TYPE</label>
                                    <select 
                                        value={planForm.plan} 
                                        onChange={(e) => setPlanForm({...planForm, plan: e.target.value})}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-bold appearance-none"
                                    >
                                        <option value="basic">Basic Plan</option>
                                        {pricingSection.plans.filter(p => p.id !== 'basic').map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-600 ml-1">RENEWAL PERIOD</label>
                                    <select 
                                        value={planForm.expiryOption} 
                                        onChange={(e) => setPlanForm({...planForm, expiryOption: e.target.value})}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-bold appearance-none"
                                    >
                                        <option value="1_month">1 Month</option>
                                        <option value="3_month">3 Months</option>
                                        <option value="6_month">6 Months</option>
                                        <option value="1_year">1 Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-600 ml-1">RENEWAL AMOUNT (INR)</label>
                                    <input 
                                        type="text" 
                                        placeholder="0.00"
                                        value={planForm.amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*\.?\d*$/.test(val)) {
                                                setPlanForm({...planForm, amount: val});
                                            }
                                        }}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-bold font-mono placeholder-slate-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white font-bold py-4 rounded-xl border border-slate-800 transition-all text-[11px] tracking-widest uppercase active:scale-95">Cancel</button>
                                    <button onClick={handleUpdatePlan} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-cyan-900/40 text-[11px] tracking-widest uppercase active:scale-95">Save Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* Password Reset Section */}
                        <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-800 pt-8 md:pt-0 md:pl-10">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.25em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                Reset Password
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-600 ml-1">NEW PASSWORD</label>
                                    <div className="relative group">
                                        <input 
                                            type="password" 
                                            placeholder="••••••••••••"
                                            value={pwdForm.newPassword}
                                            onChange={(e) => setPwdForm({newPassword: e.target.value})}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all font-mono"
                                        />
                                        <Icons.Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
                                    </div>
                                </div>
                                <button onClick={handleResetPassword} className="w-full bg-rose-600/5 hover:bg-rose-600/10 text-rose-500 border border-rose-500/20 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] hover:border-rose-500/40 active:scale-95">Reset Password Now</button>
                                <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                                    <p className="text-[10px] text-rose-400 font-bold leading-relaxed tracking-tight italic select-none">
                                        Note: This will change the administrator password for this restaurant immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </motion.div>
            </div>
          )}

          {isCreateModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsCreateModalOpen(false)} />
                  <motion.div 
                    initial={{scale:0.9, opacity:0}} 
                    animate={{scale:1, opacity:1}} 
                    exit={{scale:0.9, opacity:0}} 
                    className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 w-full max-w-lg relative z-10 shadow-3xl max-h-full overflow-y-auto custom-scrollbar"
                  >
                      <div className="flex items-center gap-4 mb-10">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                              <Icons.Plus className="w-6 h-6 text-blue-400" />
                          </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Add New Restaurant</h2>
                      </div>
                      <div className="space-y-5">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600 ml-1 tracking-widest uppercase">Restaurant Name</label>
                              <input 
                                placeholder="Enter restaurant name..."
                                value={createForm.name}
                                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold placeholder-slate-800"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600 ml-1 tracking-widest uppercase">Phone Number</label>
                              <input 
                                placeholder="Enter 10-digit number..."
                                value={createForm.mobile_no}
                                onChange={(e) => setCreateForm({...createForm, mobile_no: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold placeholder-slate-800"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600 ml-1 tracking-widest uppercase">Admin Email</label>
                              <input 
                                placeholder="admin@restaurant.com"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold placeholder-slate-800"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600 ml-1 tracking-widest uppercase">Password</label>
                              <input 
                                type="password"
                                placeholder="Set password..."
                                value={createForm.password}
                                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono placeholder-slate-800"
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-8">
                              <button onClick={() => setIsCreateModalOpen(false)} className="bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white font-bold py-5 rounded-[1.5rem] border border-slate-800 transition-all text-xs tracking-[0.2em] uppercase active:scale-95">Cancel</button>
                              <button onClick={handleCreateSingle} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-[1.5rem] transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] text-xs tracking-[0.2em] uppercase active:scale-95 flex items-center justify-center gap-2">
                                  {isLoading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                              </button>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
      )}
    </>
  );
}
