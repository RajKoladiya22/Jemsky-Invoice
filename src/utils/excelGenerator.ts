/**
 * excelGenerator.ts — Professional ExcelJS multi-sheet invoice export
 *
 * Sheets:
 *   1. Invoice          — business + customer + invoice meta + items + tax summary
 *   2. Tax Summary      — GST breakdown per invoice
 *   3. Customer Details — full client registry
 *   4. Business Details — company profiles + bank details
 *
 * Features: styled headers, borders, merged cells, auto widths,
 *           currency formatting, SUM formulas
 */

import ExcelJS from "exceljs";
import { db } from "../lib/db";
import type { InvoiceData, SavedInvoice } from "../types";
import { calcItemForCategory } from "../engine/calculationEngine";
import { numberToIndianWords } from "./amountInWords";

// ─── Style helpers ────────────────────────────────────────────────────────────
const BRAND_COLOR  = "FF6D28D9"; // violet-700
const HEADER_COLOR = "FF1E1E2E"; // near-black
const EVEN_ROW     = "FFF5F3FF"; // faint violet tint
const GOLD_COLOR   = "FFD4AF37"; // gold accent for totals

const borderAll: Partial<ExcelJS.Borders> = {
  top:    { style: "thin", color: { argb: "FFD1D5DB" } },
  left:   { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  right:  { style: "thin", color: { argb: "FFD1D5DB" } },
};

const borderThick: Partial<ExcelJS.Borders> = {
  top:    { style: "medium", color: { argb: "FF6D28D9" } },
  left:   { style: "medium", color: { argb: "FF6D28D9" } },
  bottom: { style: "medium", color: { argb: "FF6D28D9" } },
  right:  { style: "medium", color: { argb: "FF6D28D9" } },
};

function headerStyle(color: string = HEADER_COLOR): Partial<ExcelJS.Style> {
  return {
    font:      { name: "Calibri", bold: true, size: 10, color: { argb: "FFFFFFFF" } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: color } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: false },
    border:    borderAll,
  };
}

function sectionLabelStyle(): Partial<ExcelJS.Style> {
  return {
    font:      { name: "Calibri", bold: true, size: 11, color: { argb: "FFFFFFFF" } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLOR } },
    alignment: { horizontal: "left", vertical: "middle" },
    border:    borderAll,
  };
}

function totalLabelStyle(): Partial<ExcelJS.Style> {
  return {
    font:      { name: "Calibri", bold: true, size: 10, color: { argb: "FF374151" } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } },
    alignment: { horizontal: "right", vertical: "middle" },
    border:    borderAll,
  };
}

function grandTotalStyle(): Partial<ExcelJS.Style> {
  return {
    font:      { name: "Calibri", bold: true, size: 12, color: { argb: "FFFFFFFF" } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLOR } },
    alignment: { horizontal: "right", vertical: "middle" },
    border:    borderThick,
  };
}

function dataStyle(even: boolean = false): Partial<ExcelJS.Style> {
  return {
    font:      { name: "Calibri", size: 10 },
    fill:      even
      ? { type: "pattern", pattern: "solid", fgColor: { argb: EVEN_ROW } }
      : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } },
    alignment: { vertical: "middle", wrapText: false },
    border:    borderAll,
  };
}

function currencyStyle(even: boolean = false): Partial<ExcelJS.Style> {
  return {
    ...dataStyle(even),
    numFmt:    `"₹"#,##0.00`,
    alignment: { horizontal: "right", vertical: "middle" },
  };
}

function setAutoWidths(ws: ExcelJS.Worksheet, minWidth = 8, maxWidth = 50) {
  ws.columns.forEach(col => {
    let max = minWidth;
    col.eachCell?.({ includeEmpty: false }, cell => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 3, maxWidth);
  });
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function exportDatabaseToExcel() {
  const [allInvoices, clients, products, companies] = await Promise.all([
    db.invoices.toArray(),
    db.clients.toArray(),
    db.products.toArray(),
    db.companies.toArray(),
  ]);

  const invoiceList: SavedInvoice[] = [...allInvoices];

  const wb = new ExcelJS.Workbook();
  wb.creator  = "Bill.Jemsky";
  wb.lastModifiedBy = "Bill.Jemsky";
  wb.created  = new Date();
  wb.modified = new Date();

  // ── SHEET 1: Invoice ────────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Invoice", {
      pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Headers
    const invHeaders = [
      "Invoice #", "Date", "Due Date", "Status", "Currency",
      "Client Name", "Client Company", "Client GST",
      "Subtotal", "Discount", "Taxable Amt",
      "CGST", "SGST", "IGST", "Total Tax",
      "Shipping", "Additional", "Round Off", "Grand Total",
      "Old Metal", "Balance Due", "Amount in Words", "Saved At",
    ];
    const hRow = ws.addRow(invHeaders);
    hRow.eachCell(cell => { Object.assign(cell, { style: headerStyle() }); cell.style = headerStyle(); });
    hRow.height = 22;

    // Data rows
    invoiceList.forEach((inv, i) => {
      const sub = (inv.taxableAmount || 0) + (inv.invoiceDiscountAmount || 0);
      const row = ws.addRow([
        inv.invoiceNumber || "DRAFT",
        inv.invoiceDate   || "",
        inv.dueDate       || "",
        (inv.status || "draft").toUpperCase(),
        inv.currency      || "INR",
        inv.clientName    || "",
        inv.clientCompany || "",
        inv.clientGST     || "",
        +sub.toFixed(2),
        +(inv.invoiceDiscountAmount || 0),
        +(inv.taxableAmount || 0),
        +(inv.cgstAmount   || 0),
        +(inv.sgstAmount   || 0),
        +(inv.igstAmount   || 0),
        +(inv.totalTax     || 0),
        +(inv.shippingCharges    || 0),
        +(inv.additionalCharges  || 0),
        +(inv.roundOff           || 0),
        +(inv.grandTotal         || 0),
        +(inv.oldPurchaseAmount  || 0),
        +(inv.dueAmount          || 0),
        numberToIndianWords(inv.grandTotal || 0),
        inv.savedAt ? new Date(inv.savedAt).toLocaleString() : "Unsaved",
      ]);

      const even = i % 2 === 1;
      row.eachCell((cell, col) => {
        // Currency columns: 9-21 (Subtotal → Balance Due)
        if (col >= 9 && col <= 21) {
          cell.style = currencyStyle(even);
        } else {
          cell.style = dataStyle(even);
          if (col === 1) cell.font = { bold: true, size: 10 };
        }
      });
      row.height = 18;
    });

    // SUM formula row
    if (invoiceList.length > 0) {
      const lastDataRow = 1 + invoiceList.length;
      const totRow = ws.addRow([
        "TOTALS", "", "", "", "", "", "", "",
        { formula: `SUM(I2:I${lastDataRow})` },
        { formula: `SUM(J2:J${lastDataRow})` },
        { formula: `SUM(K2:K${lastDataRow})` },
        { formula: `SUM(L2:L${lastDataRow})` },
        { formula: `SUM(M2:M${lastDataRow})` },
        { formula: `SUM(N2:N${lastDataRow})` },
        { formula: `SUM(O2:O${lastDataRow})` },
        { formula: `SUM(P2:P${lastDataRow})` },
        { formula: `SUM(Q2:Q${lastDataRow})` },
        { formula: `SUM(R2:R${lastDataRow})` },
        { formula: `SUM(S2:S${lastDataRow})` },
        { formula: `SUM(T2:T${lastDataRow})` },
        { formula: `SUM(U2:U${lastDataRow})` },
        "", "",
      ]);
      totRow.eachCell((cell, col) => {
        cell.style = col >= 9 && col <= 21
          ? { ...grandTotalStyle(), numFmt: `"₹"#,##0.00` }
          : grandTotalStyle();
      });
      totRow.getCell(1).style = grandTotalStyle();
      totRow.height = 22;
    }

    setAutoWidths(ws);
  }

  // ── SHEET 2: Invoice Line Items ──────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Line Items", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const itemHeaders = [
      "Invoice #", "Category", "Item Name", "Description", "Qty", "Unit", "Rate",
      "Batch No", "Expiry Date", "Workers", "Days Worked", "Hours", "Weight",
      "Discount %", "Tax %", "Subtotal", "Taxable Amt", "Tax Amt", "Total",
    ];
    const hRow = ws.addRow(itemHeaders);
    hRow.eachCell(cell => { cell.style = headerStyle(BRAND_COLOR); });
    hRow.height = 22;

    let rowIdx = 0;
    invoiceList.forEach(inv => {
      const catId = inv.businessCategory || "retail";
      inv.items.forEach(item => {
        const c = calcItemForCategory(item, catId);
        const even = rowIdx % 2 === 1;
        const row = ws.addRow([
          inv.invoiceNumber || "DRAFT",
          catId,
          item.name         || "—",
          item.description  || "",
          +item.quantity    || 0,
          item.unit         || "Pcs",
          +item.rate        || 0,
          item.batchNo      || "",
          item.expiryDate   || "",
          +(item.numberOfWorkers || ""),
          +(item.daysWorked || ""),
          +(item.hours || ""),
          +(item.weight || ""),
          +item.discount    || 0,
          +item.tax         || 0,
          +c.subtotal.toFixed(2),
          +c.taxable.toFixed(2),
          +c.taxAmt.toFixed(2),
          +c.total.toFixed(2),
        ]);

        row.eachCell((cell, col) => {
          if ([7, 16, 17, 18, 19].includes(col)) {
            cell.style = currencyStyle(even);
          } else {
            cell.style = dataStyle(even);
          }
        });
        row.height = 17;
        rowIdx++;
      });
    });

    setAutoWidths(ws);
  }

  // ── SHEET 3: Tax Summary ────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Tax Summary", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const taxHeaders = [
      "Invoice #", "Date", "Client Name", "Taxable Amt",
      "CGST Rate %", "CGST Amt",
      "SGST Rate %", "SGST Amt",
      "IGST Rate %", "IGST Amt",
      "Total Tax", "Grand Total",
    ];
    const hRow = ws.addRow(taxHeaders);
    hRow.eachCell(cell => { cell.style = headerStyle("FF0F4C81"); });
    hRow.height = 22;

    invoiceList.forEach((inv, i) => {
      const even = i % 2 === 1;
      const row = ws.addRow([
        inv.invoiceNumber || "DRAFT",
        inv.invoiceDate   || "",
        inv.clientName    || "",
        +(inv.taxableAmount  || 0),
        +(inv.cgstRate       || 0),
        +(inv.cgstAmount     || 0),
        +(inv.sgstRate       || 0),
        +(inv.sgstAmount     || 0),
        +(inv.igstRate       || 0),
        +(inv.igstAmount     || 0),
        +(inv.totalTax       || 0),
        +(inv.grandTotal     || 0),
      ]);

      row.eachCell((cell, col) => {
        if ([4, 6, 8, 10, 11, 12].includes(col)) {
          cell.style = currencyStyle(even);
        } else {
          cell.style = dataStyle(even);
        }
      });
      row.height = 17;
    });

    // Summary totals
    if (invoiceList.length > 0) {
      const last = 1 + invoiceList.length;
      const totRow = ws.addRow([
        "TOTAL", "", "",
        { formula: `SUM(D2:D${last})` }, "",
        { formula: `SUM(F2:F${last})` }, "",
        { formula: `SUM(H2:H${last})` }, "",
        { formula: `SUM(J2:J${last})` },
        { formula: `SUM(K2:K${last})` },
        { formula: `SUM(L2:L${last})` },
      ]);
      totRow.eachCell((cell, col) => {
        cell.style = [4, 6, 8, 10, 11, 12].includes(col)
          ? { ...grandTotalStyle(), numFmt: `"₹"#,##0.00` }
          : grandTotalStyle();
      });
      totRow.height = 22;
    }

    setAutoWidths(ws);
  }

  // ── SHEET 4: Customer Details ───────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Customers", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const clientHeaders = [
      "Name", "Company", "Phone", "Email",
      "GST Number", "Billing Address", "Shipping Address", "Notes",
    ];
    const hRow = ws.addRow(clientHeaders);
    hRow.eachCell(cell => { cell.style = headerStyle("FF065F46"); });
    hRow.height = 22;

    clients.forEach((c, i) => {
      const even = i % 2 === 1;
      const row = ws.addRow([
        c.name             || "",
        c.company          || "",
        c.phone            || "",
        c.email            || "",
        c.gstNumber        || "",
        c.address          || "",
        c.shippingAddress  || "",
        c.notes            || "",
      ]);
      row.eachCell(cell => { cell.style = dataStyle(even); });
      row.height = 17;
    });

    setAutoWidths(ws);
  }

  // ── SHEET 5: Business Details ────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet("Business Details", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const profileHeaders = [
      "Business Name", "GST Number", "PAN",
      "Phone", "Email",
      "Address", "City", "State", "Pincode",
      "Bank Name", "Branch", "Account No", "IFSC",
      "UPI ID", "Instagram",
    ];
    const hRow = ws.addRow(profileHeaders);
    hRow.eachCell(cell => { cell.style = headerStyle("FF7C2D12"); });
    hRow.height = 22;

    companies.forEach((c, i) => {
      const even = i % 2 === 1;
      const row = ws.addRow([
        c.name            || "",
        c.gst             || "",
        c.pan             || "",
        c.phone           || "",
        c.email           || "",
        c.address         || "",
        c.city            || "",
        c.state           || "",
        c.pincode         || "",
        c.bankName        || "",
        c.bankBranch      || "",
        c.accountNumber   || "",
        c.ifscCode        || "",
        c.upiId           || "",
        c.instagramHandle || "",
      ]);
      row.eachCell(cell => { cell.style = dataStyle(even); });
      row.height = 17;
    });

    setAutoWidths(ws);
  }

  // ── Write and trigger download ────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href     = url;
  a.download = `Bill-Jemsky-Export-${date}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
