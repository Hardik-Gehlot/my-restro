"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { KEYS } from "@/types";
import { useToast } from "@/components/shared/CustomToast";
import { db } from "@/app/database";
import {
  generateCouponCode,
  getCouponStatus,
  formatCouponForDisplay,
  Coupon,
} from "@/utils/coupon-utils";

export default function CouponsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = sessionStorage.getItem(KEYS.JWT_TOKEN);

        if (!token) {
          router.push("/admin/login");
          return;
        }

        const response = await db.getCoupons(token);

        if (response.status === "error") {
          showToast(response.message || "Failed to fetch coupons", "error");
          return;
        }

        setCoupons(response.data?.coupons || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        showToast("Failed to fetch coupons", "error");
      }
    };

    fetchCoupons();
  }, [router, showToast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
    if (!token) return;

    try {
      const response = await db.deleteCoupon(token, id);

      if (response.status === "error") {
        showToast(response.message || "Failed to delete coupon", "error");
        return;
      }

      setCoupons(coupons.filter((c) => c.id !== id));
      showToast("Coupon deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showToast("An error occurred while deleting the coupon", "error");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleFormClose = (refreshData?: boolean) => {
    setShowForm(false);
    setEditingCoupon(null);

    if (refreshData) {
      // Refresh the coupons list
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (token) {
        db.getCoupons(token).then((response) => {
          if (response.status === "success") {
            setCoupons(response.data?.coupons || []);
          }
        });
      }
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.coupon_code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon);

    const badges = {
      active: "bg-green-100 text-green-800 border-green-200",
      expired: "bg-red-100 text-red-800 border-red-200",
      used: "bg-gray-100 text-gray-800 border-gray-200",
      inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    const labels = {
      active: "Active",
      expired: "Expired",
      used: "Fully Used",
      inactive: "Inactive",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-bold rounded-full border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (showForm) {
    return <CouponForm coupon={editingCoupon} onClose={handleFormClose} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage discount coupons for your restaurant
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <Icons.Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icons.FiTag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {searchQuery ? "No coupons found" : "No coupons yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery
              ? "Try a different search term"
              : "Create your first coupon to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-gray-900 font-mono">
                      {coupon.coupon_code}
                    </h3>
                    {getStatusBadge(coupon)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Discount
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        {formatCouponForDisplay(coupon)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Min Order
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{coupon.min_order_value}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Usage
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {coupon.current_usage_count} / {coupon.max_usage_count}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Valid Until
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(coupon.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Icons.Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Icons.Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Coupon Form Component
function CouponForm({
  coupon,
  onClose,
}: {
  coupon: Coupon | null;
  onClose: (refreshData?: boolean) => void;
}) {
  const { showToast } = useToast();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    coupon_code: coupon?.coupon_code || "",
    coupon_type: coupon?.coupon_type || "flat",
    discount_value: coupon?.discount_value?.toString() || "",
    max_discount_amount: coupon?.max_discount_amount?.toString() || "",
    min_order_value: coupon?.min_order_value?.toString() || "0",
    max_usage_count: coupon?.max_usage_count?.toString() || "1",
    start_date: coupon?.start_date
      ? new Date(coupon.start_date).toISOString().split("T")[0]
      : getTodayDate(),
    end_date: coupon?.end_date
      ? new Date(coupon.end_date).toISOString().split("T")[0]
      : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateCode = () => {
    const newCode = generateCouponCode();
    setFormData({ ...formData, coupon_code: newCode });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation for dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    // Only validate past start date for NEW coupons
    if (!coupon && startDate < today) {
      setError("Start date cannot be in the past");
      return;
    }

    if (endDate <= startDate) {
      setError("End date must be after start date");
      return;
    }

    setSaving(true);

    try {
      const token = sessionStorage.getItem(KEYS.JWT_TOKEN);
      if (!token) {
        setError("Authentication required. Please log in again.");
        setSaving(false);
        return;
      }

      const payload: any = {
        coupon_code: formData.coupon_code,
        coupon_type: formData.coupon_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_usage_count: parseInt(formData.max_usage_count) || 1,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      console.log("payload", payload);

      if (
        formData.coupon_type === "percentage" &&
        formData.max_discount_amount
      ) {
        payload.max_discount_amount = parseFloat(formData.max_discount_amount);
      }

      const response = coupon
        ? await db.updateCoupon(token, coupon.id, payload)
        : await db.addCoupon(token, payload);

      if (response.status === "error") {
        setError(response.message || "Failed to save coupon");
        return;
      }

      showToast(
        coupon
          ? "Coupon updated successfully!"
          : "Coupon created successfully!",
        "success",
      );
      onClose(true);
    } catch (error) {
      console.error("Error saving coupon:", error);
      setError("An error occurred while saving the coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </h1>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Coupon Code *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={formData.coupon_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coupon_code: e.target.value.toUpperCase(),
                  })
                }
                maxLength={15}
                required
                className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase"
                placeholder="Enter code or generate"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Generate Code
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated: 7 letters (A-Z). Manual: up to 15 alphanumeric
              characters.
            </p>
          </div>

          {/* Coupon Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, coupon_type: "flat" })
                }
                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  formData.coupon_type === "flat"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                Flat Amount
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, coupon_type: "percentage" })
                }
                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  formData.coupon_type === "percentage"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                Percentage
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.coupon_type === "flat"
                  ? "Discount Amount (₹) *"
                  : "Discount Percentage (%) *"}
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={formData.coupon_type === "flat" ? "100" : "20"}
              />
            </div>

            {formData.coupon_type === "percentage" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Discount Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_discount_amount: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional cap on discount
                </p>
              </div>
            )}
          </div>

          {/* Min Order & Max Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Order Value (₹) *
              </label>
              <input
                type="number"
                value={formData.min_order_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: e.target.value })
                }
                min="0"
                step="0.01"
                required
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Usage Count *
              </label>
              <input
                type="number"
                value={formData.max_usage_count}
                onChange={(e) =>
                  setFormData({ ...formData, max_usage_count: e.target.value })
                }
                min="1"
                required
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                min={
                  coupon
                    ? formData.start_date < getTodayDate()
                      ? formData.start_date
                      : getTodayDate()
                    : getTodayDate()
                }
                required
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                min={formData.start_date || getTodayDate()}
                required
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Icons.Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : coupon ? (
                "Update Coupon"
              ) : (
                "Create Coupon"
              )}
            </button>
            <button
              type="button"
              onClick={() => onClose()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
