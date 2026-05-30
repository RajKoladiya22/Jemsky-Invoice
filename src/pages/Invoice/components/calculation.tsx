// ─── Calculation Helpers ────────────────────────────────────────────────────────

import type { InvoiceItem, InvoiceData } from "../../../types";

export function r2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calcItem(item: InvoiceItem) {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const tax = Number(item.tax) || 0;
  const discount = Number(item.discount) || 0;
  const labour = Number(item.labour) || 0;
  const netW = Number(item.netWeight) || 0;
  const grossW = Number(item.grossWeight) || 0;

  // If jewelry weight fields are used, subtotal is netWeight * rate + labour
  // Otherwise it is qty * rate
  let subtotal = 0;
  if (netW > 0 || grossW > 0 || labour > 0) {
    subtotal = r2((netW || qty) * rate + labour);
  } else {
    subtotal = r2(qty * rate);
  }

  const discountAmt = r2(subtotal * (discount / 100));
  const taxable = r2(subtotal - discountAmt);
  const taxAmt = r2(taxable * (tax / 100));
  const total = r2(taxable + taxAmt);

  return {
    subtotal,
    discountAmt,
    taxable,
    taxAmt,
    total,
  };
}

export function calcTotals(
  items: InvoiceItem[],
  invoiceDiscountPercent = 0,
  shippingCharges = 0,
  additionalCharges = 0,
  cgstRate = 0,
  sgstRate = 0,
  igstRate = 0
) {
  let subtotal = 0;
  let totalDiscount = 0;
  let itemTaxSum = 0;

  items.forEach((item) => {
    const c = calcItem(item);
    subtotal += c.subtotal;
    totalDiscount += c.discountAmt;
    itemTaxSum += c.taxAmt;
  });

  const taxableAmountBeforeInvoiceDiscount = r2(subtotal - totalDiscount);
  const invoiceDiscountAmount = r2(taxableAmountBeforeInvoiceDiscount * (invoiceDiscountPercent / 100));
  const netTaxableAmount = r2(taxableAmountBeforeInvoiceDiscount - invoiceDiscountAmount);

  // If explicit invoice GST rates are provided, calculate based on netTaxableAmount
  // Otherwise, fallback to summing up individual item taxes
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalTax = 0;

  if (cgstRate > 0 || sgstRate > 0 || igstRate > 0) {
    cgstAmount = r2(netTaxableAmount * (cgstRate / 100));
    sgstAmount = r2(netTaxableAmount * (sgstRate / 100));
    igstAmount = r2(netTaxableAmount * (igstRate / 100));
    totalTax = r2(cgstAmount + sgstAmount + igstAmount);
  } else {
    // If no explicit CGST/SGST/IGST rates are configured on the invoice,
    // we split the itemTaxSum into CGST/SGST or IGST based on whether IGST is preferred
    // For local billing, we split it 50-50 between CGST and SGST
    totalTax = r2(itemTaxSum);
    // Assume intra-state split (CGST+SGST) by default if no IGST rate
    cgstAmount = r2(totalTax / 2);
    sgstAmount = r2(totalTax / 2);
    igstAmount = 0;
  }

  const grandTotalBeforeRoundOff = r2(netTaxableAmount + totalTax + Number(shippingCharges) + Number(additionalCharges));
  const grandTotal = Math.round(grandTotalBeforeRoundOff);
  const roundOff = r2(grandTotal - grandTotalBeforeRoundOff);

  return {
    subtotal: r2(subtotal),
    totalDiscount: r2(totalDiscount),
    invoiceDiscountAmount,
    taxableAmount: netTaxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    grossTotal: r2(subtotal - totalDiscount + totalTax),
    grandTotalBeforeRoundOff,
    roundOff,
    grandTotal,
  };
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

// Convert numbers to words (Rupees/Dollars)
export function numberToWords(num: number, currency = "INR"): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numToWordsHundreds(n: number): string {
    if (n === 0) return "";
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  if (intPart === 0) return "Zero";

  let words = "";

  if (currency === "INR") {
    // Indian numbering system (Lakh, Crore)
    let temp = intPart;
    const crores = Math.floor(temp / 10000000);
    temp %= 10000000;
    const lakhs = Math.floor(temp / 100000);
    temp %= 100000;
    const thousands = Math.floor(temp / 1000);
    temp %= 1000;

    if (crores > 0) {
      words += numToWordsHundreds(crores) + " Crore ";
    }
    if (lakhs > 0) {
      words += numToWordsHundreds(lakhs) + " Lakh ";
    }
    if (thousands > 0) {
      words += numToWordsHundreds(thousands) + " Thousand ";
    }
    if (temp > 0) {
      words += numToWordsHundreds(temp) + " ";
    }

    words = "Rupees " + words.trim();
    if (decPart > 0) {
      words += " and " + numToWordsHundreds(decPart) + " Paise";
    }
    words += " Only";
  } else {
    // Western system (Million, Billion)
    let temp = intPart;
    const billions = Math.floor(temp / 1000000000);
    temp %= 1000000000;
    const millions = Math.floor(temp / 1000000);
    temp %= 1000000;
    const thousands = Math.floor(temp / 1000);
    temp %= 1000;

    if (billions > 0) {
      words += numToWordsHundreds(billions) + " Billion ";
    }
    if (millions > 0) {
      words += numToWordsHundreds(millions) + " Million ";
    }
    if (thousands > 0) {
      words += numToWordsHundreds(thousands) + " Thousand ";
    }
    if (temp > 0) {
      words += numToWordsHundreds(temp) + " ";
    }

    const curName = currency === "USD" ? "Dollars" : currency === "EUR" ? "Euros" : currency === "GBP" ? "Pounds" : "Units";
    const subName = currency === "USD" ? "Cents" : currency === "EUR" ? "Cents" : currency === "GBP" ? "Pence" : "Subunits";

    words = words.trim() + " " + curName;
    if (decPart > 0) {
      words += " and " + numToWordsHundreds(decPart) + " " + subName;
    }
    words += " Only";
  }

  return words;
}