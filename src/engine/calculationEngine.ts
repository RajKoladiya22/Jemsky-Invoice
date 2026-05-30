// ─── Calculation Engine ─────────────────────────────────────────────────────
// Per-category item amount calculation.
// Extends the existing calcItem/calcTotals to support all 20 business categories.

import type { InvoiceItem } from "../types";
import type { CalculationMode } from "../data/categorySchema";
import { getCategoryCalculationMode } from "./columnEngine";

function r2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate the subtotal (before discount) for a single line item,
 * using the appropriate formula for the given business category.
 */
export function categoryItemSubtotal(
  item: InvoiceItem,
  categoryId?: string
): number {
  const mode: CalculationMode = categoryId
    ? getCategoryCalculationMode(categoryId)
    : detectCalculationMode(item);

  switch (mode) {
    case "jewelry": {
      const netW = Number(item.netWeight) || 0;
      const rate = Number(item.rate) || 0;
      const making = Number(item.makingCharge) || Number(item.labour) || 0;
      const stoneCharge = Number(item.stoneWeight) || 0; // If used as a charge value
      return r2(netW * rate + making + stoneCharge);
    }

    case "labor": {
      const workers = Number(item.numberOfWorkers) || 1;
      const days = Number(item.daysWorked) || 1;
      const ratePerDay = Number(item.rate) || 0;
      return r2(workers * days * ratePerDay);
    }

    case "transport": {
      const weight = Number(item.weight) || 0;
      const distance = Number(item.distance) || 0;
      const rate = Number(item.rate) || 0;
      // If both weight and distance are provided, multiply all three.
      // If only one is provided, use qty × rate fallback.
      if (weight > 0 && distance > 0) {
        return r2(weight * distance * rate);
      }
      if (weight > 0) {
        return r2(weight * rate);
      }
      // Fallback to standard
      return r2((Number(item.quantity) || 1) * rate);
    }

    case "service": {
      const hours = Number(item.hours) || Number(item.quantity) || 1;
      const rate = Number(item.rate) || 0;
      return r2(hours * rate);
    }

    case "wholesale": {
      const cartons = Number(item.cartons) || 1;
      const unitsPerCarton = Number(item.unitsPerCarton) || 1;
      const rate = Number(item.rate) || 0;
      return r2(cartons * unitsPerCarton * rate);
    }

    case "standard":
    default: {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const netW = Number(item.netWeight) || 0;
      const labour = Number(item.labour) || Number(item.makingCharge) || 0;

      // Backward compatibility: if jewelry fields are used without explicit category
      if (netW > 0 || labour > 0) {
        return r2((netW || qty) * rate + labour);
      }
      return r2(qty * rate);
    }
  }
}

/**
 * Full item calculation: subtotal → discount → taxable → tax → total
 */
export function calcItemForCategory(
  item: InvoiceItem,
  categoryId?: string
) {
  const subtotal = categoryItemSubtotal(item, categoryId);
  const discount = Number(item.discount) || 0;
  const tax = Number(item.tax) || 0;

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
    amount: taxable, // Pre-tax amount for display
  };
}

/**
 * Calculate the display amount for an item (used by the store's recalculate function).
 * This replaces the inline calculation in invoiceStore.ts.
 */
export function getItemDisplayAmount(
  item: InvoiceItem,
  categoryId?: string
): number {
  const subtotal = categoryItemSubtotal(item, categoryId);
  const discount = Number(item.discount) || 0;
  const discountAmt = r2(subtotal * (discount / 100));
  return r2(subtotal - discountAmt);
}

/**
 * Auto-detect calculation mode from item fields (backward compatibility).
 * Used when no explicit category is set.
 */
function detectCalculationMode(item: InvoiceItem): CalculationMode {
  if ((Number(item.netWeight) || 0) > 0 || (Number(item.makingCharge) || Number(item.labour) || 0) > 0) {
    return "jewelry";
  }
  if ((Number(item.numberOfWorkers) || 0) > 0 && (Number(item.daysWorked) || 0) > 0) {
    return "labor";
  }
  if ((Number(item.weight) || 0) > 0 && (Number(item.distance) || 0) > 0) {
    return "transport";
  }
  if ((Number(item.hours) || 0) > 0) {
    return "service";
  }
  if ((Number(item.cartons) || 0) > 0) {
    return "wholesale";
  }
  return "standard";
}
