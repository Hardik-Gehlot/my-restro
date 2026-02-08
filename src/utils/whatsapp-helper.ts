import { CartItem, Restaurant } from "@/types";

export const generateRecieptMessage = (
  restaurant: Restaurant,
  cart: CartItem[],
  orderType: string,
  customerDetails: {
    name: string;
    phone: string;
    address?: string;
    tableNo?: string;
  },
  totals: {
    subtotal: number;
    cgst: number;
    sgst: number;
    deliveryCharge: number;
    total: number;
  },
  coupon?: {
    code: string;
    discount: number;
  }
) => {
  let message = `--------------------------\n`;
  message += `*Type:* ${orderType.toUpperCase()}\n`;

  if (orderType === 'dinein') {
    message += `*Table:* ${customerDetails.tableNo}\n`;
  } else {
    message += `*Customer:* ${customerDetails.name}\n`;
    message += `*Phone:* ${customerDetails.phone}\n`;
    if (orderType === 'delivery') {
      message += `*Address:* ${customerDetails.address}\n`;
    }
  }

  message += `--------------------------\n`;
  message += `*Items:*\n`;
  cart.forEach(item => {
    message += `• ${item.name} (${item.variationSize}) x ${item.quantity} - ₹${item.price * item.quantity}\n`;
  });

  message += `--------------------------\n`;
  message += `*Subtotal:* ₹${totals.subtotal.toFixed(2)}\n`;

  if (restaurant.gst_no) {
    message += `*CGST (${restaurant.cgst_rate}%):* ₹${totals.cgst.toFixed(2)}\n`;
    message += `*SGST (${restaurant.sgst_rate}%):* ₹${totals.sgst.toFixed(2)}\n`;
  }


  if (orderType === 'delivery') {
    message += `*Delivery Charges:* ₹${totals.deliveryCharge}\n`;
  }

  if (coupon && coupon.discount > 0) {
    message += `*Coupon (${coupon.code}):* -₹${coupon.discount.toFixed(2)}\n`;
    message += `*Total Before Discount:* ₹${totals.total.toFixed(2)}\n`;
    message += `*Total Amount:* ₹${(totals.total - coupon.discount).toFixed(2)}\n`;
  } else {
    message += `*Total Amount:* ₹${totals.total.toFixed(2)}\n`;
  }

  if (orderType === 'delivery' && restaurant.delivery_instruction) {
    message += `--------------------------\n`;
    message += `*Notes:* ${restaurant.delivery_instruction}\n`;
  }

  message += `--------------------------\n`;
  message += `_Thank you for ordering!_`;

  return message; // Return raw message
};

export const openWhatsApp = (phone: string, message: string) => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};
