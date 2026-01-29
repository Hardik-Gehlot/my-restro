'use client';
import { useState } from 'react';
import { useToast } from '@/components/shared/CustomToast';
import { db } from '@/app/database';
import { KEYS } from '@/types';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';
import FullscreenLoader from '@/components/shared/FullscreenLoader';
import { WEBSITE_DETAILS } from '@/lib/common-data';

export default function SuperadminSettingsContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await db.changePassword(
        token,
        formData.currentPassword,
        formData.newPassword
      );

      if (response.status === 'success') {
        showToast('SuperAdmin password updated successfully', 'success');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        sessionStorage.setItem(KEYS.JWT_TOKEN, response.data.token);
      } else {
        showToast(response.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('An error occurred during password update', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FullscreenLoader 
        isVisible={loading} 
        messages={["Securing SuperAdmin panel...", "Updating credentials...", "Finishing up..."]}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
              <Icons.Settings className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
              <p className="text-slate-400">Manage SuperAdmin security and preferences.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-4">Security Overview</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Updating your password regularly helps maintain the security of the entire {WEBSITE_DETAILS.name} ecosystem.
              </p>
              <div className="mt-6 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                <p className="text-xs text-cyan-400 font-medium">
                  Last login detected from this session. Ensure your credentials remain private.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Icons.Lock className="w-6 h-6 text-slate-500" />
                Administrator Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    Current Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono placeholder-slate-800"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                    >
                      {showCurrentPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono placeholder-slate-800"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                      >
                        {showNewPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono placeholder-slate-800"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                      >
                        {showConfirmPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icons.Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Secure Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
