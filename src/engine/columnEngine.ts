// ─── Column Engine ─────────────────────────────────────────────────────────
// Maps business category → columns, item fields, invoice extra fields, PDF defs.
// This is the central brain powering both the UI editor and the PDF output.

import {
  getCategoryById,
  getColumnDef,
  BUSINESS_CATEGORIES,
  type ColumnKey,
  type ColumnDef,
  type InvoiceExtraField,
  type CategoryTerminology,
  type CalculationMode,
  type CategoryTemplate,
} from "../data/categorySchema";
import type { InvoiceItem } from "../types";

// ─── Column Key → InvoiceItem field mapping ─────────────────────────────────

export const COLUMN_ITEM_FIELD_MAP: Partial<Record<ColumnKey, keyof InvoiceItem>> = {
  itemCode:        "itemCode",
  itemName:        "name",
  description:     "description",
  batchNo:         "batchNo",
  expiryDate:      "expiryDate",
  lotNumber:       "lotNumber",
  purity:          "purity",
  grossWeight:     "grossWeight",
  stoneWeight:     "stoneWeight",
  netWeight:       "netWeight",
  ratePerGram:     "rate",
  makingCharge:    "makingCharge",
  hsn:             "hsn",
  qty:             "quantity",
  unit:            "unit",
  rate:            "rate",
  discount:        "discount",
  tax:             "tax",
  amount:          "amount",
  cartons:         "cartons",
  unitsPerCarton:  "unitsPerCarton",
  wholesaleRate:   "rate",
  hours:           "hours",
  ratePerHour:     "rate",
  workerType:      "workerType",
  numberOfWorkers: "numberOfWorkers",
  daysWorked:      "daysWorked",
  ratePerDay:      "rate",
  workItem:        "name",
  workUnit:        "workUnit",
  vehicleNo:       "vehicleNo",
  route:           "route",
  weight:          "weight",
  distance:        "distance",
  treatment:       "name",
  doctor:          "doctor",
  color:           "color",
  size:            "size",
  cropType:        "cropType",
  farmDetails:     "farmDetails",
};

// ─── Enriched column definition (with item field binding) ───────────────────

export interface BoundColumnDef extends ColumnDef {
  itemField: keyof InvoiceItem | null;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get the ordered column definitions for a category's item table.
 * Each column is bound to its InvoiceItem field.
 */
export function getCategoryColumns(categoryId: string): BoundColumnDef[] {
  const cat = getCategoryById(categoryId);
  if (!cat) return getDefaultColumns();

  return cat.columns.map((key) => ({
    ...getColumnDef(key),
    itemField: COLUMN_ITEM_FIELD_MAP[key] ?? null,
  }));
}

/**
 * Get invoice-level extra fields for a category (e.g. Patient ID, Vehicle No).
 */
export function getCategoryExtraFields(categoryId: string): InvoiceExtraField[] {
  const cat = getCategoryById(categoryId);
  return cat?.invoiceExtraFields ?? [];
}

/**
 * Get industry-specific terminology for labels and PDF titles.
 */
export function getCategoryTerminology(categoryId: string): CategoryTerminology {
  const cat = getCategoryById(categoryId);
  return cat?.terminology ?? {
    invoiceTitle: "INVOICE",
    customerLabel: "Bill To",
    itemTableTitle: "Items",
    quantityLabel: "Qty",
    rateLabel: "Rate",
  };
}

/**
 * Get the calculation mode for a category.
 */
export function getCategoryCalculationMode(categoryId: string): CalculationMode {
  const cat = getCategoryById(categoryId);
  return cat?.calculationMode ?? "standard";
}

/**
 * Get the default GST rate for a category.
 */
export function getCategoryDefaultGST(categoryId: string): number {
  const cat = getCategoryById(categoryId);
  return cat?.defaultGSTRate ?? 18;
}

/**
 * Get available templates for a category.
 */
export function getCategoryTemplates(categoryId: string): CategoryTemplate[] {
  const cat = getCategoryById(categoryId);
  return cat?.templates ?? [];
}

/**
 * Build default item values for a new line item in a given category.
 */
export function getDefaultItemForCategory(categoryId: string): Partial<InvoiceItem> {
  const cat = getCategoryById(categoryId);
  if (!cat) return { quantity: 1, rate: 0, discount: 0, tax: 18 };

  const defaults: Partial<InvoiceItem> = {};

  // Map category itemDefaults (ColumnKey→value) to InvoiceItem fields
  for (const [colKey, value] of Object.entries(cat.itemDefaults)) {
    const itemField = COLUMN_ITEM_FIELD_MAP[colKey as ColumnKey];
    if (itemField) {
      (defaults as Record<string, unknown>)[itemField] = value;
    }
  }

  return defaults;
}

/**
 * Get PDF column headers and widths for autoTable rendering.
 */
export function getPDFColumns(categoryId: string): { header: string; width?: number; align: string; itemField: keyof InvoiceItem | null }[] {
  const columns = getCategoryColumns(categoryId);
  return columns.map((col) => ({
    header: col.label,
    width: col.width,
    align: col.align || "left",
    itemField: col.itemField,
  }));
}

/**
 * Get the accent color for a category.
 */
export function getCategoryAccentColor(categoryId: string): string {
  const cat = getCategoryById(categoryId);
  return cat?.accentColor ?? "#7c3aed";
}

// ─── Fallback: default columns (generic invoice) ────────────────────────────

function getDefaultColumns(): BoundColumnDef[] {
  const defaultKeys: ColumnKey[] = ["sno", "itemName", "description", "qty", "unit", "rate", "discount", "tax", "amount"];
  return defaultKeys.map((key) => ({
    ...getColumnDef(key),
    itemField: COLUMN_ITEM_FIELD_MAP[key] ?? null,
  }));
}
