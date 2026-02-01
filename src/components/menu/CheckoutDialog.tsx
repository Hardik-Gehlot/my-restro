"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icons } from "@/lib/icons";
import { CartItem, Restaurant } from "@/types";
import { generateWhatsAppMessage, openWhatsApp } from "@/utils/whatsapp-helper";
import { generateInvoicePDF } from "@/utils/invoice-generator";
import { FiPlus, FiMinus } from "react-icons/fi";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  restaurant: Restaurant;
  clearCart: () => void;
  updateCartQuantity: (
    dishId: string,
    variationSize: string,
    delta: number,
  ) => void;
}

const CheckoutDialog = ({
  isOpen,
  onClose,
  cart,
  restaurant,
  clearCart,
  updateCartQuantity,
}: CheckoutDialogProps) => {
  const [serviceType, setServiceType] = useState<
    "dinein" | "takeaway" | "delivery"
  >("dinein");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    tableNo: "",
  });

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cgst = (subtotal * (restaurant.cgst_rate || 0)) / 100;
  const sgst = (subtotal * (restaurant.sgst_rate || 0)) / 100;

  let deliveryCharge = 0;
  if (serviceType === "delivery") {
    if (restaurant.delivery_charges_type === "fixed") {
      deliveryCharge = restaurant.delivery_charge_fixed || 0;
    }
  }

  const totals = {
    subtotal,
    cgst,
    sgst,
    deliveryCharge,
    total: subtotal + cgst + sgst + deliveryCharge,
  };

  const minTotal =
    subtotal + cgst + sgst + (restaurant.delivery_charge_min || 0);
  const maxTotal =
    subtotal + cgst + sgst + (restaurant.delivery_charge_max || 0);

  const enabledServices = (() => {
    try {
      return JSON.parse(
        restaurant.enabled_services || '["dinein", "takeaway", "delivery"]',
      );
    } catch {
      return ["dinein", "takeaway", "delivery"];
    }
  })();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const phoneRegex = /^[6-9]\d{9}$/;

  const isPhoneValid = formData.phone === "" || phoneRegex.test(formData.phone);
  const isAddressValid =
    formData.address === "" || formData.address.length >= 10;
  const isNameValid = formData.name === "" || formData.name.length >= 3;
  const isTableValid =
    formData.tableNo === "" || formData.tableNo.trim() !== "";

  const isFormValid = () => {
    if (serviceType === "dinein") {
      return formData.tableNo.trim() !== "";
    } else if (serviceType === "takeaway") {
      return (
        isNameValid && formData.name !== "" && phoneRegex.test(formData.phone)
      );
    } else if (serviceType === "delivery") {
      return (
        isNameValid &&
        formData.name !== "" &&
        phoneRegex.test(formData.phone) &&
        isAddressValid &&
        formData.address !== ""
      );
    }
    return false;
  };

  const handleConfirm = async () => {
    if (!isFormValid()) return;

    // 1. Generate PDF
    const pdfBlob = generateInvoicePDF(
      restaurant,
      cart,
      serviceType,
      formData,
      totals,
    );

    // 2. Generate WhatsApp Message Text
    const rawMessage = generateWhatsAppMessage(
      restaurant,
      cart,
      serviceType,
      formData,
      totals,
    );
    const decodedMessage = decodeURIComponent(rawMessage);

    // 3. Try sharing using Web Share API (Best for sending files to WhatsApp)
    if (navigator.share) {
      try {
        const file = new File(
          [pdfBlob],
          `Invoice-${restaurant.name.replace(/\s+/g, "-")}.pdf`,
          { type: "application/pdf" },
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Order from ${restaurant.name}`,
            text: decodedMessage,
          });

          // Cleanup
          clearCart();
          onClose();
          return;
        }
      } catch (err) {
        console.error("Sharing failed:", err);
        // Fallback to text message if share was cancelled or failed
      }
    }

    // 4. Fallback: Text-only message directly to restaurant number
    // (PDF download is avoided as per request)
    openWhatsApp(restaurant.mobile_no, rawMessage);

    // Cleanup
    clearCart();
    onClose();
  };

  const handleQuantityUpdate = (
    e: React.MouseEvent,
    dishId: string,
    variationSize: string,
    delta: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(dishId, variationSize, delta);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white shadow-xl rounded-t-3xl overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Icons.FiShoppingCart className="w-4 h-4 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Checkout
                        </h2>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Icons.FiX className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                      {/* Service Selection */}
                      <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Choose Service
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {enabledServices.map((service: string) => (
                            <button
                              key={service}
                              onClick={() => {
                                setServiceType(service as any);
                                // Reset form if switching to dinein (as it only needs tableNo)
                                // Not strictly necessary but can be cleaner
                              }}
                              className={`relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all text-xs font-bold capitalize overflow-hidden ${
                                serviceType === service
                                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600"
                                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {serviceType === service && (
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-500/30 to-orange-400/20 animate-shimmer"
                                  style={{ backgroundSize: "200% 100%" }}
                                />
                              )}
                              <div
                                className={`p-1.5 rounded-lg relative z-10 ${serviceType === service ? "bg-orange-200" : "bg-gray-100"}`}
                              >
                                {service === "dinein" && (
                                  <Icons.BiSolidDish className="w-3.5 h-3.5" />
                                )}
                                {service === "takeaway" && (
                                  <Icons.Store className="w-3.5 h-3.5" />
                                )}
                                {service === "delivery" && (
                                  <Icons.MapPin className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="relative z-10">
                                {service.replace("dinein", "Dine In")}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Customer Details Form */}
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Customer Details
                          </h3>
                          <span className="text-[10px] text-orange-500 font-bold uppercase">
                            * Required
                          </span>
                        </div>

                        {serviceType === "dinein" ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                                Table Number *
                              </label>
                              <input
                                type="text"
                                name="tableNo"
                                required
                                value={formData.tableNo}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-800 ${
                                  !isTableValid
                                    ? "border-red-500 focus:ring-red-500 bg-red-50/50"
                                    : "border-gray-200"
                                }`}
                                placeholder="e.g., T12"
                              />
                              {!isTableValid && (
                                <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">
                                  Table number required
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  required
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-800 ${
                                    !isNameValid && formData.name !== ""
                                      ? "border-red-500 focus:ring-red-500 bg-red-50/50"
                                      : formData.name === ""
                                        ? "border-orange-100"
                                        : "border-gray-200"
                                  }`}
                                  placeholder="John Doe"
                                />
                                {!isNameValid && formData.name !== "" && (
                                  <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">
                                    Name too short (min 3 chars)
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                                  Phone Number *
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  required
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-800 ${
                                    !isPhoneValid && formData.phone !== ""
                                      ? "border-red-500 focus:ring-red-500 bg-red-50/50"
                                      : formData.phone === ""
                                        ? "border-orange-100"
                                        : "border-gray-200"
                                  }`}
                                  placeholder="9876543210"
                                />
                                {!isPhoneValid && formData.phone !== "" && (
                                  <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">
                                    Valid 10-digit number required
                                  </p>
                                )}
                              </div>
                            </div>

                            {serviceType === "delivery" && (
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                                  Address *
                                </label>
                                <textarea
                                  name="address"
                                  required
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  rows={2}
                                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-800 ${
                                    !isAddressValid && formData.address !== ""
                                      ? "border-red-500 focus:ring-red-500 bg-red-50/50"
                                      : formData.address === ""
                                        ? "border-orange-100"
                                        : "border-gray-200"
                                  }`}
                                  placeholder="House No, Street, Landmark..."
                                />
                                {!isAddressValid && formData.address !== "" && (
                                  <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">
                                    Address too short (min 10 chars)
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </section>

                      {/* Order Summary */}
                      <section className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Order Summary
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-3 divide-y divide-gray-200">
                          {cart.map((item, idx) => (
                            <div
                              key={`${item.dishId}-${idx}`}
                              className="py-2 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <p className="text-[10px] text-gray-500">
                                    ₹{item.price} ({item.variationSize})
                                  </p>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-sm">
                                <button
                                  onClick={(e) =>
                                    handleQuantityUpdate(
                                      e,
                                      item.dishId,
                                      item.variationSize,
                                      -1,
                                    )
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-90"
                                >
                                  <FiMinus className="w-2.5 h-2.5 text-gray-700" />
                                </button>
                                <span className="w-6 text-center text-xs font-black text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={(e) =>
                                    handleQuantityUpdate(
                                      e,
                                      item.dishId,
                                      item.variationSize,
                                      1,
                                    )
                                  }
                                  className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors active:scale-90 shadow-sm shadow-orange-500/20"
                                >
                                  <FiPlus className="w-2.5 h-2.5 text-white" />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-gray-900 w-14 text-right">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Bill Details */}
                      <section className="bg-orange-50 rounded-xl p-4 space-y-2 border border-orange-100 shadow-sm">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            ₹{subtotal.toFixed(2)}
                          </span>
                        </div>
                        {(restaurant.cgst_rate || 0) > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>CGST ({restaurant.cgst_rate}%)</span>
                            <span className="font-semibold text-gray-900">
                              ₹{cgst.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {(restaurant.sgst_rate || 0) > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>SGST ({restaurant.sgst_rate}%)</span>
                            <span className="font-semibold text-gray-900">
                              ₹{sgst.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {serviceType === "delivery" && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery Charges</span>
                            <span className="font-semibold text-gray-900">
                              {restaurant.delivery_charges_type === "fixed"
                                ? `₹${deliveryCharge.toFixed(2)}`
                                : `₹${restaurant.delivery_charge_min}–₹${restaurant.delivery_charge_max}`}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-orange-200 flex justify-between items-center">
                          <span className="text-base font-bold text-gray-900">
                            Total Bill
                          </span>
                          <div className="text-right">
                            {serviceType === "delivery" &&
                            restaurant.delivery_charges_type === "variable" ? (
                              <span className="text-lg font-black text-orange-600">
                                ₹{minTotal.toFixed(0)} – ₹{maxTotal.toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-xl font-black text-orange-600">
                                ₹{totals.total.toFixed(2)}
                              </span>
                            )}
                            {serviceType === "delivery" &&
                              restaurant.delivery_charges_type ===
                                "variable" && (
                                <p className="text-[9px] text-orange-400 font-bold uppercase mt-0.5">
                                  + Includes Delivery Range
                                </p>
                              )}
                          </div>
                        </div>
                      </section>

                      {serviceType === "delivery" &&
                        restaurant.delivery_instruction && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
                            <Icons.Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-blue-900">
                                Delivery Instructions
                              </p>
                              <p className="text-[10px] text-blue-700 mt-0.5">
                                {restaurant.delivery_instruction}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t sticky bottom-0 z-10">
                      <button
                        onClick={handleConfirm}
                        disabled={!isFormValid()}
                        className={`w-full py-3.5 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                          isFormValid()
                            ? "bg-black text-white hover:bg-gray-900 shadow-black/10"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                      >
                        {isFormValid()
                          ? "Confirm Order"
                          : "Please Complete Fields"}
                        <Icons.FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CheckoutDialog;
