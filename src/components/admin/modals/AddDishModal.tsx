"use client";

import { useState } from "react";

export default function AddDishModal({ onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Food",
  });

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">

        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Dish</h2>

        <div className="space-y-3">
          <input
            placeholder="Dish Name"
            onChange={(e) => update("name", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <input
            placeholder="Image URL"
            onChange={(e) => update("image", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <input
            placeholder="Price"
            type="number"
            onChange={(e) => update("price", +e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            placeholder="Description"
            onChange={(e) => update("description", e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <select
            onChange={(e) => update("category", e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option>Food</option>
            <option>Drinks</option>
            <option>Dessert</option>
          </select>
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
            Add Dish
          </button>
        </div>

      </div>
    </div>
  );
}
