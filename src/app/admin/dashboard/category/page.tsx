
'use client';
import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import { useToast } from '@/components/shared/CustomToast';
import { db } from '@/app/database';
import { Category, KEYS } from '@/types';
import { useRouter } from 'next/navigation';
import FullscreenLoader from '@/components/shared/FullscreenLoader';
import { DashboardSkeleton } from '@/components/shared/Skeleton';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
        
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await db.getCategories(token);
        
        if (response.status === 'error') {
          showToast(response.message || 'Failed to fetch categories', 'error');
          return;
        }

        setCategories(response.data?.categoriesData || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showToast('Failed to fetch categories', 'error');
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) return;

    setIsSaving(true);
    setSavingMessage('Adding category...');
    
    try {
      const response = await db.addCategory(token, categoryName);
      
      if (response.status === 'error') {
        showToast(response.message || 'Failed to add category', 'error');
        return;
      }

      setCategories([...categories, response.data!]);
      setShowAddModal(false);
      setCategoryName('');
      showToast('Category added successfully!', 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      showToast('An error occurred while adding category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim() || !editingCategory) {
      showToast('Please enter a category name', 'error');
      return;
    }

    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) return;

    setIsSaving(true);
    setSavingMessage('Updating category...');

    try {
      const response = await db.updateCategory(token, editingCategory.id, categoryName);
      
      if (response.status === 'error') {
        showToast(response.message || 'Failed to update category', 'error');
        return;
      }

      setCategories(categories.map(c => c.id === editingCategory.id ? response.data! : c));
      setEditingCategory(null);
      setCategoryName('');
      showToast('Category updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('An error occurred while updating category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) return;

    setIsSaving(true);
    setSavingMessage('Deleting category...');

    try {
      const response = await db.deleteCategory(token, categoryId);
      
      if (response.status === 'error') {
        showToast(response.message || 'Failed to delete category', 'error');
        return;
      }

      setCategories(categories.filter(c => c.id !== categoryId));
      showToast('Category deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('An error occurred while deleting category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <FullscreenLoader isVisible={isSaving} messages={[savingMessage]} />
      <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Manage your menu categories</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white 
                       font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Icons.Plus size={20} />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories && categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Icons.Plus size={28} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-6">Create your first category to organize your menu</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white 
                         font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Icons.Plus size={20} />
                Add First Category
              </button>
            </div>
          ) : (
            categories.filter(c => c).map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 
                                              hover:shadow-md hover:border-orange-200 transition-all">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit category"
                    >
                      <Icons.Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Icons.Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-gray-800">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icons.X size={24} />
              </button>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Starters, Main Course"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-3 p-4">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold 
                         rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="flex-1 px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg 
                         hover:bg-orange-700 transition-colors"
              >
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}