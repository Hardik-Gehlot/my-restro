'use client';
import { useState } from 'react';
import { useToast } from '@/components/shared/CustomToast';
import { db } from '@/app/database';
import { KEYS } from '@/types';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      setLoading(false);
      return;
    }

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
        showToast('Password changed successfully', 'success');
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
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-100 rounded-lg">
                <Icons.IoIosSettings className="w-6 h-6 text-orange-600" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account preferences</p>
             </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icons.Lock className="w-5 h-5 text-gray-500" />
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 bg-orange-600 text-white 
                         font-semibold rounded-lg transition-colors
                         ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-700'}`}
              >
                {loading ? (
                  <>
                    <Icons.Loader2 className="animate-spin w-5 h-5" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
