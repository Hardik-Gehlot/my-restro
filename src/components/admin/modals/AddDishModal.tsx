'use client';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Icons } from '@/lib/icons';

// Add Dish Modal Component
const AddDishModal = ({ onClose, onSave, restaurantId, categories }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        image: "",
        category: categories.length > 0 ? categories[0].name : "",
        isVeg: true,
        variations: [{ size: "small", price: 0 }]
    });

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addVariation = () => {
        setForm(prev => ({
            ...prev,
            variations: [...prev.variations, { size: "medium", price: 0 }]
        }));
    };

    const updateVariation = (index, field, value) => {
        const newVariations = [...form.variations];
        newVariations[index][field] = field === 'price' ? Number(value) : value;
        setForm(prev => ({ ...prev, variations: newVariations }));
    };

    const removeVariation = (index) => {
        setForm(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        if (!form.name || !form.image || form.variations.length === 0) {
            alert("Please fill all required fields");
            return;
        }
        onSave({
            ...form,
            id: `dish_${Date.now()}`,
            restaurantId
        });
    };

    return (
        <Transition.Root show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-y-full sm:translate-y-0 sm:translate-x-full"
                                enterTo="translate-y-0 sm:translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-y-0 sm:translate-x-0"
                                leaveTo="translate-y-full sm:translate-y-0 sm:translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="bg-gray-50 px-4 py-6 sm:px-6">
                                                <div className="flex items-start justify-between space-x-3">
                                                    <div className="space-y-1">
                                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                                            Add New Dish
                                                        </Dialog.Title>
                                                    </div>
                                                    <div className="flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="text-gray-400 hover:text-gray-500"
                                                            onClick={onClose}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <Icons.X className="h-6 w-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form */}
                                            <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Dish Name *</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            placeholder="Enter dish name"
                                                            value={form.name}
                                                            onChange={(e) => update("name", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Image URL *</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            placeholder="https://example.com/image.jpg"
                                                            value={form.image}
                                                            onChange={(e) => update("image", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <textarea
                                                            placeholder="Describe your dish"
                                                            value={form.description}
                                                            onChange={(e) => update("description", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500 min-h-[80px]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <select
                                                            value={form.category}
                                                            onChange={(e) => update("category", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        >
                                                            {categories.map((category) => (
                                                                <option key={category.id} value={category.name}>
                                                                    {category.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Type</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <select
                                                            value={form.isVeg}
                                                            onChange={(e) => update("isVeg", e.target.value === 'true')}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        >
                                                            <option value="true">Veg</option>
                                                            <option value="false">Non-Veg</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900">Price Variations *</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <button
                                                            onClick={addVariation}
                                                            className="text-orange-600 text-sm font-medium hover:text-orange-700"
                                                        >
                                                            + Add Size
                                                        </button>
                                                        {form.variations.map((variation, index) => (
                                                          <div key={index} className="flex gap-2 mb-2">
                                                              <select
                                                                  value={variation.size}
                                                                  onChange={(e) => updateVariation(index, 'size', e.target.value)}
                                                                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                                                              >
                                                                  <option value="small">Small</option>
                                                                  <option value="medium">Medium</option>
                                                                  <option value="large">Large</option>
                                                                  <option value="half">Half</option>
                                                                  <option value="full">Full</option>
                                                              </select>
                                                              <input
                                                                  type="number"
                                                                  placeholder="Price"
                                                                  value={variation.price}
                                                                  onChange={(e) => updateVariation(index, 'price', e.target.value)}
                                                                  className="flex-1 border border-gray-300 p-2 rounded-lg text-gray-900"
                                                              />
                                                              {form.variations.length > 1 && (
                                                                  <button
                                                                      onClick={() => removeVariation(index)}
                                                                      className="text-red-600 hover:text-red-700 px-2"
                                                                  >
                                                                      <Icons.Trash2 size={18} />
                                                                  </button>
                                                              )}
                                                          </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                    onClick={onClose}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                    onClick={handleSubmit}
                                                >
                                                    Add Dish
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
};

export default AddDishModal;