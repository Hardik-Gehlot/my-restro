'use client';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Restaurant } from '@/types';

interface RestaurantEditModalProps {
    restaurant: Restaurant;
    onClose: () => void;
    onSave: (restaurant: Restaurant) => void;
}

const RestaurantEditModal = ({ restaurant, onClose, onSave }: RestaurantEditModalProps) => {
    const [form, setForm] = useState(restaurant);
    const [errors, setErrors] = useState<{ name?: string; mobileNo?: string }>({});

    const update = (key: keyof Restaurant, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Clear error for this field when user starts typing
        if (errors[key as 'name' | 'mobileNo']) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string; mobileNo?: string } = {};

        // Validate restaurant name
        if (!form.name || form.name.trim() === '') {
            newErrors.name = 'Restaurant name is required';
        }

        // Validate mobile number
        if (!form.mobileNo || form.mobileNo.trim() === '') {
            newErrors.mobileNo = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(form.mobileNo.trim())) {
            newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(form);
        }
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
                                                            Edit Restaurant Details
                                                        </Dialog.Title>
                                                    </div>
                                                    <div className="flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="text-gray-400 hover:text-gray-500"
                                                            onClick={onClose}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <X className="h-6 w-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form */}
                                            <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Restaurant Name</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.name}
                                                            onChange={(e) => update("name", e.target.value)}
                                                            className={`w-full border p-3 rounded-lg text-gray-900 ${
                                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors.name && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Tagline</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.tagline}
                                                            onChange={(e) => update("tagline", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Mobile Number</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.mobileNo}
                                                            onChange={(e) => update("mobileNo", e.target.value)}
                                                            className={`w-full border p-3 rounded-lg text-gray-900 ${
                                                                errors.mobileNo ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="10 digit mobile number"
                                                        />
                                                        {errors.mobileNo && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.mobileNo}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Logo URL</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.logo}
                                                            onChange={(e) => update("logo", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Cover Image URL</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.coverImage}
                                                            onChange={(e) => update("coverImage", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">About Us</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <textarea
                                                            value={form.aboutus}
                                                            onChange={(e) => update("aboutus", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 min-h-[100px]"
                                                        />
                                                    </div>
                                                </div>
                                                                                                 <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                                                                    <div>
                                                                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Google Maps Link</label>
                                                                                                    </div>
                                                                                                    <div className="sm:col-span-2">
                                                                                                        <input
                                                                                                            value={form.googleMapLink}
                                                                                                            onChange={(e) => update("googleMapLink", e.target.value)}
                                                                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                                                                    <div>
                                                                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Google Rating Link</label>
                                                                                                    </div>
                                                                                                    <div className="sm:col-span-2">
                                                                                                        <input
                                                                                                            value={form.googleRatingLink}
                                                                                                            onChange={(e) => update("googleRatingLink", e.target.value)}
                                                                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                                                                    <div>
                                                                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Instagram Link</label>
                                                                                                    </div>
                                                                                                    <div className="sm:col-span-2">
                                                                                                        <input
                                                                                                            value={form.instagramLink}
                                                                                                            onChange={(e) => update("instagramLink", e.target.value)}
                                                                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Facebook Link</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.facebookLink}
                                                            onChange={(e) => update("facebookLink", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">Twitter Link</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.twitterLink}
                                                            onChange={(e) => update("twitterLink", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">LinkedIn Link</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.linkedinLink}
                                                            onChange={(e) => update("linkedinLink", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-1">YouTube Link</label>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            value={form.youtubeLink}
                                                            onChange={(e) => update("youtubeLink", e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
                                                        />
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
                                                    Save Changes
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
export default RestaurantEditModal;