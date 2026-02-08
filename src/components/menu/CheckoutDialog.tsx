import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icons } from "@/lib/icons";
import { CartItem, Restaurant } from "@/types";
import { generateRecieptMessage } from "@/utils/whatsapp-helper";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import FullscreenLoader from "../shared/FullscreenLoader";

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
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [serviceType, setServiceType] = useState<
    "dinein" | "takeaway" | "delivery"
  >("dinein");
  const searchParams = useSearchParams();
  const tableNoParam = searchParams.get("tableNo");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    tableNo: tableNoParam || "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount: number;
    minOrder: number;
    type: "flat" | "percentage";
    value: number;
    maxAmount?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cgst = (subtotal * (restaurant.cgst_rate || 0)) / 100;
  const sgst = (subtotal * (restaurant.sgst_rate || 0)) / 100;

  let deliveryCharge = 0;
  if (serviceType === "delivery") {
    deliveryCharge = restaurant.delivery_price || 0;
  }

  const baseTotal = subtotal + cgst + sgst + deliveryCharge;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = baseTotal - discountAmount;

  // Recalculate coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (baseTotal < appliedCoupon.minOrder) {
        setAppliedCoupon(null);
        setCouponError(
          `Coupon removed: Min order ₹${appliedCoupon.minOrder} required`,
        );
      } else {
        // Recalculate discount amount
        let newDiscount = 0;
        if (appliedCoupon.type === "flat") {
          newDiscount = Math.min(appliedCoupon.value, baseTotal);
        } else {
          newDiscount = (baseTotal * appliedCoupon.value) / 100;
          if (appliedCoupon.maxAmount && appliedCoupon.maxAmount > 0) {
            newDiscount = Math.min(newDiscount, appliedCoupon.maxAmount);
          }
        }

        if (newDiscount !== appliedCoupon.discount) {
          setAppliedCoupon({
            ...appliedCoupon,
            discount: newDiscount,
          });
        }
      }
    }
  }, [baseTotal, appliedCoupon?.id]);

  const totals = {
    subtotal,
    cgst,
    sgst,
    deliveryCharge,
    total: baseTotal,
  };

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
      return true; // Table no is optional/handled via URL
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon_code: couponCode,
          restaurant_id: restaurant.id,
          order_total: baseTotal,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setAppliedCoupon({
          id: data.data.id,
          code: data.data.coupon_code,
          discount: data.data.discount_amount,
          minOrder: data.data.min_order_value,
          type: data.data.coupon_type,
          value: data.data.discount_value,
          maxAmount: data.data.max_discount_amount,
        });
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // ... existing code ...
  // ... existing code ...
  const [orderStatus, setOrderStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [orderResult, setOrderResult] = useState<{
    orderNumber: number;
    totalAmount: number;
    receipt: string;
  } | null>(null);

  const placeOrder = async () => {
    if (!isFormValid()) return;
    setIsPlacingOrder(true);
    setOrderStatus("idle");

    try {
      const receipt = generateRecieptMessage(
        restaurant,
        cart,
        serviceType,
        formData,
        totals,
        appliedCoupon
          ? { code: appliedCoupon.code, discount: appliedCoupon.discount }
          : undefined,
      );

      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          receipt,
          total_amount: finalTotal,
          coupon_code: appliedCoupon?.code,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        clearCart();
        setOrderResult({
          orderNumber: data.orderNumber,
          totalAmount: finalTotal,
          receipt: receipt,
        });
        setOrderStatus("success");
        setAppliedCoupon(null);
        setCouponCode("");
      } else {
        console.error("Order failed:", data.error);
        setOrderStatus("error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderStatus("error");
    } finally {
      setIsPlacingOrder(false);
    }
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

  const closeDialog = () => {
    // If order was successful, fully close and reset state
    if (orderStatus === "success") {
      onClose(); // This should close the parent dialog logic
      // Reset internal state after a delay or immediately if this component unmounts
      setTimeout(() => {
        setOrderStatus("idle");
        setOrderResult(null);
      }, 500);
    } else {
      onClose();
    }
  };

  return (
    <div>
      <FullscreenLoader
        isVisible={isPlacingOrder}
        messages={[
          "Cooking something delicious...",
          "Please wait while we send your order to the kitchen.",
        ]}
      />
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
                  enter="transform transition ease-out duration-200 sm:duration-300"
                  enterFrom="translate-y-full"
                  enterTo="translate-y-0"
                  leave="transform transition ease-in duration-150 sm:duration-200"
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
                              <p className="text-sm text-gray-500 italic">
                                {formData.tableNo
                                  ? `Ordering for Table ${formData.tableNo}`
                                  : "Ordering for Dine-in"}
                              </p>
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
                                  {!isAddressValid &&
                                    formData.address !== "" && (
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

                        {/* Coupon Section */}
                        <section className="space-y-2">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Have a Coupon?
                          </h3>
                          {!appliedCoupon ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase());
                                  setCouponError("");
                                }}
                                placeholder="Enter coupon code"
                                maxLength={15}
                                className="flex-1 text-black px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase font-mono"
                              />
                              <button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {couponLoading ? (
                                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Apply"
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icons.Check className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-bold text-green-900">
                                    {appliedCoupon.code}
                                  </p>
                                  <p className="text-xs text-green-700">
                                    You saved ₹
                                    {appliedCoupon.discount.toFixed(2)}!
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={handleRemoveCoupon}
                                className="p-1 hover:bg-green-100 rounded transition-colors"
                              >
                                <Icons.X className="w-4 h-4 text-green-700" />
                              </button>
                            </div>
                          )}
                          {couponError && (
                            <p className="text-xs text-red-600 font-semibold">
                              {couponError}
                            </p>
                          )}
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
                                ₹{deliveryCharge.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {appliedCoupon && (
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Discount ({appliedCoupon.code})</span>
                              <span className="font-semibold">
                                -₹{appliedCoupon.discount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-orange-200 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">
                              Total Bill
                            </span>
                            <div className="text-right">
                              {appliedCoupon && (
                                <div className="text-xs text-gray-500 line-through">
                                  ₹{baseTotal.toFixed(2)}
                                </div>
                              )}
                              <span className="text-xl font-black text-orange-600">
                                ₹{finalTotal.toFixed(2)}
                              </span>
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

                      <div className="p-4 bg-white border-t sticky bottom-0 z-10 flex flex-col gap-3">
                        <button
                          onClick={placeOrder}
                          disabled={!isFormValid() || isPlacingOrder}
                          className={`w-full py-3.5 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                            isFormValid() && !isPlacingOrder
                              ? "bg-black text-white hover:bg-gray-900 shadow-black/10"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                          }`}
                        >
                          {isPlacingOrder ? (
                            <>
                              <Icons.Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : isFormValid() ? (
                            <>
                              Place Order
                              <Icons.FiChevronRight className="w-5 h-5" />
                            </>
                          ) : (
                            "Please Complete Fields"
                          )}
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

      {/* Success/Error Overlay */}
      <Transition.Root
        show={orderStatus === "success" || orderStatus === "error"}
        as={Fragment}
      >
        <Dialog as="div" className="relative z-[150]" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {orderStatus === "success" && orderResult ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                        <Icons.Check className="w-10 h-10 text-green-600" />
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-black text-gray-900 mb-2"
                      >
                        Order Placed!
                      </Dialog.Title>
                      <p className="text-gray-500 mb-6">
                        Your order has been sent to the restaurant.
                      </p>

                      <div className="bg-orange-50 rounded-xl p-4 w-full mb-6 border border-orange-100">
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">
                          Order Number
                        </p>
                        <p className="text-4xl font-black text-orange-600">
                          #{orderResult.orderNumber}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 w-full mb-6 text-left border border-gray-100">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Receipt Details
                        </div>
                        <div className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">
                          {orderResult.receipt}
                        </div>
                      </div>

                      <button
                        onClick={closeDialog}
                        className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                      >
                        Got it, Thanks!
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Icons.FiAlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-black text-gray-900 mb-2"
                      >
                        Order Failed
                      </Dialog.Title>
                      <p className="text-gray-500 mb-6">
                        Something went wrong while placing your order. Please
                        try again.
                      </p>
                      <button
                        onClick={() => setOrderStatus("idle")}
                        className="w-full py-3.5 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      >
                        Close and Try Again
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default CheckoutDialog;
