"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiPlus, FiMinus } from "react-icons/fi";
import { Dish } from "@/types";

interface VariationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
  onAddToCart: (dish: Dish, variationIdx: number, quantity: number) => void;
  currentQuantities: { [variationSize: string]: number };
}

const VariationSelectorModal = ({
  isOpen,
  onClose,
  dish,
  onAddToCart,
  currentQuantities,
}: VariationSelectorModalProps) => {
  const [quantities, setQuantities] = useState<{
    [variationIdx: number]: number;
  }>({});

  useEffect(() => {
    if (isOpen && dish) {
      // Sync with current cart quantities
      const initialQuantities: { [variationIdx: number]: number } = {};
      dish.variations.forEach((v, idx) => {
        const currentQty = currentQuantities[v.size] || 0;
        if (currentQty > 0) {
          initialQuantities[idx] = currentQty;
        }
      });
      setQuantities(initialQuantities);
    }
  }, [isOpen, dish, currentQuantities]);

  if (!dish) return null;

  const updateQuantity = (idx: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[idx] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [idx]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [idx]: newValue };
    });
  };

  const handleConfirm = () => {
    // For each variation, calculate the delta compared to what's currently in cart
    dish.variations.forEach((v, idx) => {
      const newQty = quantities[idx] || 0;
      const initialQty = currentQuantities[v.size] || 0;
      const delta = newQty - initialQty;

      if (delta !== 0) {
        onAddToCart(dish, idx, delta);
      }
    });
    onClose();
  };

  const totalItems = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0,
  );
  const initialTotalItems = Object.values(currentQuantities).reduce(
    (sum, qty) => sum + qty,
    0,
  );

  const totalPrice = dish.variations.reduce((sum, variation, idx) => {
    return sum + variation.price * (quantities[idx] || 0);
  }, 0);

  const canConfirm = totalItems > 0 || initialTotalItems > 0;
  const isRemoving = totalItems === 0 && initialTotalItems > 0;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[90]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-full opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-full opacity-0"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-[2.5rem] sm:rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative p-5 border-b bg-gradient-to-r from-orange-50 to-white">
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 hover:bg-white rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 pr-10">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Select quantities for each size
                  </p>
                </div>

                {/* Variations */}
                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  {dish.variations.map((variation, idx) => {
                    const currentQty = quantities[idx] || 0;
                    const cartQty = currentQuantities[variation.size] || 0;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-orange-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-bold text-gray-900 capitalize text-sm">
                              {variation.size}
                            </span>
                            {cartQty > 0 && (
                              <span className="ml-2 text-xs text-orange-600 font-semibold">
                                ({cartQty} in cart)
                              </span>
                            )}
                          </div>
                          <span className="text-base font-black text-orange-600">
                            ₹{variation.price}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Quantity
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">
                              {quantities[idx] || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50 border-t space-y-3">
                  {totalItems > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Total: {totalItems} item{totalItems > 1 ? "s" : ""}
                      </span>
                      <span className="font-black text-orange-600">
                        ₹{totalPrice}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemoving
                      ? "Remove from Cart"
                      : totalItems > 0
                        ? `Update Cart (${totalItems})`
                        : "Select Quantities"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default VariationSelectorModal;