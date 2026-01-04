"use client";

import { useState } from "react";

export default function DishEditModal({ dish, onClose, onSave }: any) {
  const [form, setForm] = useState(dish);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">

        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Dish</h2>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", +e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option>Food</option>
            <option>Drinks</option>
            <option>Dessert</option>
          </select>
        </div>

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
