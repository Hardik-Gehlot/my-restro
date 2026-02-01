// ===========================================
// Modern PDF Invoice Generator
// lib/generateInvoicePDF.ts
// ===========================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem, Restaurant } from '@/types';

export const generateInvoicePDF = (
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
    }
) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [255, 107, 0]; // Orange color
    const lightGray = [245, 245, 245];
    const darkGray = [60, 60, 60];

    // Helper function for rupee symbol
    const formatCurrency = (amount: number): string => {
        return `Rs. ${amount.toFixed(2)}`;
    };

    // =============================
    // HEADER SECTION - Modern Design
    // =============================

    // Background banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Restaurant Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurant.name.toUpperCase(), pageWidth / 2, 15, { align: 'center' });

    // Tagline
    if (restaurant.tagline) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(restaurant.tagline, pageWidth / 2, 22, { align: 'center' });
    }

    // Contact Information
    doc.setFontSize(9);
    doc.text(`Phone: ${restaurant.mobile_no}`, pageWidth / 2, 28, { align: 'center' });

    // GST Number
    if (restaurant.gst_no) {
        doc.setFontSize(8);
        doc.text(`GSTIN: ${restaurant.gst_no}`, pageWidth / 2, 34, { align: 'center' });
    }

    // Invoice Badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 50, 38, 40, 10, 2, 2, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth - 30, 44, { align: 'center' });

    // =============================
    // INVOICE DETAILS SECTION
    // =============================

    let currentY = 55;

    // Two column layout for invoice details
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    // Left column - Date & Order Type
    doc.text('Date & Time:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }), 20, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Order Type:', 20, currentY + 12);
    doc.setFont('helvetica', 'normal');

    // Order type badge
    const orderTypeText = orderType.toUpperCase();
    const badgeWidth = doc.getTextWidth(orderTypeText) + 8;
    doc.setFillColor(...lightGray);
    doc.roundedRect(19, currentY + 14, badgeWidth, 6, 1, 1, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(orderTypeText, 23, currentY + 18);

    // Right column - Customer Details
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');

    if (orderType === 'dinein') {
        doc.text('Table Number:', pageWidth - 70, currentY);
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text(customerDetails.tableNo || 'N/A', pageWidth - 70, currentY + 8);
    } else {
        doc.setFontSize(9);
        doc.text('Customer Details:', pageWidth - 70, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        doc.text(customerDetails.name, pageWidth - 70, currentY + 5);
        doc.text(customerDetails.phone, pageWidth - 70, currentY + 10);

        if (orderType === 'delivery' && customerDetails.address) {
            const addressLines = doc.splitTextToSize(customerDetails.address, 65);
            doc.setFontSize(8);
            doc.text(addressLines, pageWidth - 70, currentY + 15);
            currentY += addressLines.length * 4;
        }
    }

    currentY += 30;

    // =============================
    // ITEMS TABLE - Modern Design
    // =============================

    const tableData = cart.map((item, index) => [
        (index + 1).toString(),
        item.name,
        (item.variationSize.toLowerCase() === 'price' ? '-' : item.variationSize),
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['#', 'Item Description', 'Size', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: darkGray,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: lightGray,
            textColor: darkGray,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 70, halign: 'left' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' },
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        margin: { left: 20, right: 20 }
    });

    // =============================
    // TOTALS SECTION - Modern Design
    // =============================

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals box with border
    const totalsBoxX = pageWidth - 90;
    const totalsBoxY = finalY;
    const totalsBoxWidth = 70;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(totalsBoxX, totalsBoxY, totalsBoxWidth,
        (restaurant.gst_no ? 35 : 20) + (orderType === 'delivery' ? 5 : 0) + 15, 2, 2);

    currentY = totalsBoxY + 8;

    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text('Subtotal:', totalsBoxX + 5, currentY);
    doc.text(formatCurrency(totals.subtotal), totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });

    // GST Section
    if (restaurant.gst_no && (totals.cgst > 0 || totals.sgst > 0)) {
        currentY += 6;
        doc.text(`CGST (${restaurant.cgst_rate}%):`, totalsBoxX + 5, currentY);
        doc.text(formatCurrency(totals.cgst), totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });

        currentY += 6;
        doc.text(`SGST (${restaurant.sgst_rate}%):`, totalsBoxX + 5, currentY);
        doc.text(formatCurrency(totals.sgst), totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });
    }

    // Delivery Charge
    if (orderType === 'delivery') {
        currentY += 6;
        doc.text('Delivery Charge:', totalsBoxX + 5, currentY);

        if (restaurant.delivery_charges_type === 'variable') {
            const rangeStr = `Rs. ${restaurant.delivery_charge_min} – ${restaurant.delivery_charge_max}`;
            doc.text(rangeStr, totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });
        } else {
            doc.text(formatCurrency(totals.deliveryCharge), totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });
        }
    }

    // Divider line
    currentY += 4;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsBoxX + 5, currentY, totalsBoxX + totalsBoxWidth - 5, currentY);

    // Grand Total
    currentY += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL:', totalsBoxX + 5, currentY);

    if (orderType === 'delivery' && restaurant.delivery_charges_type === 'variable') {
        const minTotal = totals.subtotal + totals.cgst + totals.sgst + (restaurant.delivery_charge_min || 0);
        const maxTotal = totals.subtotal + totals.cgst + totals.sgst + (restaurant.delivery_charge_max || 0);
        const rangeTotalStr = `Rs. ${minTotal.toFixed(2)} – ${maxTotal.toFixed(2)}`;
        doc.text(rangeTotalStr, totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });
    } else {
        doc.text(formatCurrency(totals.total), totalsBoxX + totalsBoxWidth - 5, currentY, { align: 'right' });
    }

    // =============================
    // FOOTER SECTION
    // =============================

    currentY = doc.internal.pageSize.getHeight() - 30;

    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(20, currentY, pageWidth - 20, currentY);

    // Thank you message
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Thank you for your order!', pageWidth / 2, currentY, { align: 'center' });

    // Computer generated message
    currentY += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('This is a computer generated invoice and does not require a signature',
        pageWidth / 2, currentY, { align: 'center' });

    // Powered by message (optional)
    currentY += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`,
        pageWidth / 2, currentY, { align: 'center' });

    return doc.output('blob');
};

// ===========================================
// ALTERNATIVE: Thermal Receipt Style (58mm)
// For small thermal printers
// ===========================================

export const generateThermalReceipt = (
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
    }
) => {
    // 58mm thermal receipt = 58mm / 25.4mm per inch * 72 points per inch ≈ 164 points
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [58, 297] // 58mm width, auto height
    });

    const pageWidth = 58;
    let currentY = 5;

    const formatCurrency = (amount: number): string => {
        return `Rs. ${amount.toFixed(2)}`;
    };

    // Restaurant name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurant.name.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    // Tagline
    if (restaurant.tagline) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(restaurant.tagline, pageWidth / 2, currentY, { align: 'center' });
        currentY += 4;
    }

    // Contact
    doc.setFontSize(7);
    doc.text(restaurant.mobile_no, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;

    // GST
    if (restaurant.gst_no) {
        doc.text(`GSTIN: ${restaurant.gst_no}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 4;
    }

    // Divider
    doc.setLineWidth(0.2);
    doc.line(2, currentY, pageWidth - 2, currentY);
    currentY += 4;

    // Invoice details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(new Date().toLocaleString('en-IN'), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;

    doc.text(`Order: ${orderType.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    // Customer details
    if (orderType === 'dinein') {
        doc.setFont('helvetica', 'bold');
        doc.text(`Table: ${customerDetails.tableNo}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;
    } else {
        doc.text(`${customerDetails.name}`, 2, currentY);
        currentY += 3;
        doc.setFont('helvetica', 'normal');
        doc.text(`Ph: ${customerDetails.phone}`, 2, currentY);
        currentY += 5;
    }

    // Items
    doc.setLineWidth(0.2);
    doc.line(2, currentY, pageWidth - 2, currentY);
    currentY += 4;

    cart.forEach(item => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(item.name, 2, currentY);
        currentY += 3;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const itemLine = `  ${item.variationSize} x ${item.quantity} @ ${formatCurrency(item.price)}`;
        doc.text(itemLine, 2, currentY);
        doc.text(formatCurrency(item.price * item.quantity), pageWidth - 2, currentY, { align: 'right' });
        currentY += 5;
    });

    // Totals
    doc.setLineWidth(0.2);
    doc.line(2, currentY, pageWidth - 2, currentY);
    currentY += 4;

    doc.setFontSize(7);
    doc.text('Subtotal:', 2, currentY);
    doc.text(formatCurrency(totals.subtotal), pageWidth - 2, currentY, { align: 'right' });
    currentY += 3;

    if (restaurant.gst_no && totals.cgst > 0) {
        doc.text(`CGST (${restaurant.cgst_rate}%):`, 2, currentY);
        doc.text(formatCurrency(totals.cgst), pageWidth - 2, currentY, { align: 'right' });
        currentY += 3;

        doc.text(`SGST (${restaurant.sgst_rate}%):`, 2, currentY);
        doc.text(formatCurrency(totals.sgst), pageWidth - 2, currentY, { align: 'right' });
        currentY += 3;
    }

    if (orderType === 'delivery') {
        doc.text('Delivery:', 2, currentY);
        if (restaurant.delivery_charges_type === 'variable') {
            doc.text(`${restaurant.delivery_charge_min}-${restaurant.delivery_charge_max}`, pageWidth - 2, currentY, { align: 'right' });
        } else if (totals.deliveryCharge > 0) {
            doc.text(formatCurrency(totals.deliveryCharge), pageWidth - 2, currentY, { align: 'right' });
        } else {
            doc.text(formatCurrency(0), pageWidth - 2, currentY, { align: 'right' });
        }
        currentY += 3;
    }

    currentY += 2;
    doc.setLineWidth(0.3);
    doc.line(2, currentY, pageWidth - 2, currentY);
    currentY += 4;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 2, currentY);

    if (orderType === 'delivery' && restaurant.delivery_charges_type === 'variable') {
        const minTotal = totals.subtotal + totals.cgst + totals.sgst + (restaurant.delivery_charge_min || 0);
        const maxTotal = totals.subtotal + totals.cgst + totals.sgst + (restaurant.delivery_charge_max || 0);
        doc.text(`${minTotal.toFixed(0)}-${maxTotal.toFixed(0)}`, pageWidth - 2, currentY, { align: 'right' });
    } else {
        doc.text(formatCurrency(totals.total), pageWidth - 2, currentY, { align: 'right' });
    }

    currentY += 8;
    doc.setLineWidth(0.2);
    doc.line(2, currentY, pageWidth - 2, currentY);
    currentY += 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you! Visit again', pageWidth / 2, currentY, { align: 'center' });

    return doc.output('blob');
};