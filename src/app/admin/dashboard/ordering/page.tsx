"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useToast } from "@/components/shared/CustomToast";
import { db } from "@/app/database";
import { ApiResponse, KEYS, Restaurant } from "@/types";
import { idb } from "@/lib/indexeddb";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import FullscreenLoader from "@/components/shared/FullscreenLoader";
import { ProfileSkeleton } from "@/components/shared/Skeleton";

export default function OrderingSettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Restaurant>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
        console.log("[Ordering Page] Token check:", { hasToken: !!token });

        if (!token) {
          console.log("[Ordering Page] No token, redirecting to login");
          router.push("/admin/login");
          return;
        }

        // Try to get cached data first
        const cachedData = await idb.get(KEYS.ADMIN_RESTAURANT_DATA);
        console.log("[Ordering Page] Cached data:", {
          hasCachedData: !!cachedData,
          hasRestaurantData: !!cachedData?.restaurantData,
        });

        if (cachedData?.restaurantData) {
          // Use cached restaurant data
          const rest = cachedData.restaurantData;
          console.log(
            "[Ordering Page] Using cached restaurant data:",
            rest.name,
          );
          setRestaurant(rest);
          setFormData({
            cgst_rate: rest.cgst_rate ?? 0,
            sgst_rate: rest.sgst_rate ?? 0,
            gst_no: rest.gst_no ?? "",
            delivery_charges_type: rest.delivery_charges_type ?? "fixed",
            delivery_charge_fixed: rest.delivery_charge_fixed ?? 0,
            delivery_charge_min: rest.delivery_charge_min ?? 0,
            delivery_charge_max: rest.delivery_charge_max ?? 0,
            delivery_instruction: rest.delivery_instruction ?? "",
            enabled_services: rest.enabled_services ?? '["dinein"]',
          });
          setIsLoading(false);
        } else {
          // Fetch from API if no cache
          console.log("[Ordering Page] No cache, fetching from API");
          const data: ApiResponse =
            await db.getAdminRestaurantDataWithMenu(token);
          console.log("[Ordering Page] API response:", {
            status: data.status,
            hasData: !!data.data,
          });

          if (data.status === "success" && data.data) {
            const rest = data.data.restaurantData;
            setRestaurant(rest);
            setFormData({
              cgst_rate: rest.cgst_rate ?? 0,
              sgst_rate: rest.sgst_rate ?? 0,
              gst_no: rest.gst_no ?? "",
              delivery_charges_type: rest.delivery_charges_type ?? "fixed",
              delivery_charge_fixed: rest.delivery_charge_fixed ?? 0,
              delivery_charge_min: rest.delivery_charge_min ?? 0,
              delivery_charge_max: rest.delivery_charge_max ?? 0,
              delivery_instruction: rest.delivery_instruction ?? "",
              enabled_services:
                rest.enabled_services ?? '["dinein", "takeaway", "delivery"]',
            });
            setIsLoading(false);
          } else {
            console.error("[Ordering Page] API failed, redirecting to login");
            showToast("Failed to fetch restaurant data.", "error");
            router.push("/admin/login");
          }
        }
      } catch (error) {
        console.error("[Ordering Page] Error:", error);
        showToast("An error occurred.", "error");
      }
    };
    fetchData();
  }, [router, showToast]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    try {
      let currentServices: string[] = JSON.parse(
        formData.enabled_services || "[]",
      );
      if (currentServices.includes(service)) {
        currentServices = currentServices.filter((s) => s !== service);
      } else {
        currentServices.push(service);
      }
      setFormData((prev) => ({
        ...prev,
        enabled_services: JSON.stringify(currentServices),
      }));
    } catch (e) {
      console.error("Error parsing services", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setIsSaving(true);
    try {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const updatedRestaurant: Restaurant = {
        ...restaurant,
        ...formData,
      } as Restaurant;

      const response = await db.updateRestaurant(token, updatedRestaurant);
      if (response.status === "success") {
        setRestaurant(updatedRestaurant);
        showToast("Ordering settings updated successfully!", "success");
      } else {
        showToast(response.message || "Failed to update settings.", "error");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast("An error occurred.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );

  const enabledServicesList = JSON.parse(formData.enabled_services || "[]");
  const isDeliveryEnabled = enabledServicesList.includes("delivery");

  return (
    <div>
      <FullscreenLoader
        isVisible={isSaving}
        messages={[
          "Saving settings...",
          "Updating ordering configuration...",
          "Almost done...",
        ]}
      />
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icons.FiShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Ordering & Billing
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure GST, delivery charges, and services
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GST Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-gray-500" />
                GST Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgst_rate"
                    value={formData.cgst_rate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="sgst_rate"
                    value={formData.sgst_rate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                    placeholder="2.5"
                  />
                </div>
              </div>
            </div>

            {/* Services Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icons.Store className="w-5 h-5 text-gray-500" />
                Enabled Services
              </h2>
              <div className="flex flex-wrap gap-4">
                {["dinein", "takeaway", "delivery"].map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleServiceToggle(service)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-semibold capitalize ${
                      enabledServicesList.includes(service)
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {service === "dinein" && (
                      <Icons.BiSolidDish className="w-5 h-5" />
                    )}
                    {service === "takeaway" && (
                      <Icons.Store className="w-5 h-5" />
                    )}
                    {service === "delivery" && (
                      <Icons.MapPin className="w-5 h-5" />
                    )}
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Charges - Only shown when delivery is enabled */}
            {isDeliveryEnabled && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Icons.MapPin className="w-5 h-5 text-gray-500" />
                  Delivery Configuration
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Charge Type
                    </label>
                    <select
                      name="delivery_charges_type"
                      value={formData.delivery_charges_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 bg-white"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="variable">Variable Range (Min-Max)</option>
                    </select>
                  </div>

                  {formData.delivery_charges_type === "fixed" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fixed Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        name="delivery_charge_fixed"
                        value={formData.delivery_charge_fixed}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                        placeholder="40"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Charge (₹)
                        </label>
                        <input
                          type="number"
                          name="delivery_charge_min"
                          value={formData.delivery_charge_min}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Charge (₹)
                        </label>
                        <input
                          type="number"
                          name="delivery_charge_max"
                          value={formData.delivery_charge_max}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                          placeholder="60"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instruction Text
                    </label>
                    <textarea
                      name="delivery_instruction"
                      value={formData.delivery_instruction}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                      placeholder="e.g., Delivery within 5km only. Contact for details."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Telegram Notification Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icons.FaTelegram className="w-5 h-5 text-blue-500" />
                Order Notifications
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Chat ID
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="telegram_chat_id"
                    value={formData.telegram_chat_id || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                    placeholder="e.g., 123456789"
                  />
                  <p className="text-xs text-gray-500">
                    To get your Chat ID: 1. Open Telegram and search for your
                    bot. 2. Send{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                      /start
                    </code>{" "}
                    command. 3. Copy the numeric ID sent by the bot and paste it
                    here.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-8 py-3 bg-orange-600 text-white 
                         font-bold rounded-xl transition-all shadow-lg
                         ${isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98]"}`}
              >
                <Icons.Check className="w-5 h-5" />
                Save Ordering Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}