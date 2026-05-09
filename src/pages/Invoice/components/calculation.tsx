// ─── Calculation Helpers ────────────────────────────────────────────────────────

import type { InvoiceItem } from "../../../types";

export function calcItem(item: InvoiceItem) {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const tax = Number(item.tax) || 0;
    const discount = Number(item.discount) || 0;
    const subtotal = qty * rate;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = afterDiscount * (tax / 100);
    return { subtotal, discountAmt, taxAmt, total: afterDiscount + taxAmt };
}

export function calcTotals(items: InvoiceItem[]) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;
    items.forEach((item) => {
        const c = calcItem(item);
        subtotal += c.subtotal;
        totalDiscount += c.discountAmt;
        totalTax += c.taxAmt;
        grandTotal += c.total;
    });
    return { subtotal, totalDiscount, totalTax, grandTotal };
}

export function fmt(sym: string, val: number) {
    return `${sym}${val.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function generateInvoiceNumber() {
    const now = new Date();
    const yr = now.getFullYear().toString().slice(2);
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${yr}${mo}-${rand}`;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}