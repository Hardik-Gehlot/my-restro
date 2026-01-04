"use client";

import { useState } from "react";

export default function RestaurantEditModal({ restaurant, onClose, onSave }: any) {
  const [form, setForm] = useState(restaurant);

  const update = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Edit Restaurant Details
        </h2>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Restaurant Name"
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder="Image URL"
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Address"
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Phone Number"
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Description"
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={form.openHours}
            onChange={(e) => update("openHours", e.target.value)}
            placeholder="Open Hours"
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
