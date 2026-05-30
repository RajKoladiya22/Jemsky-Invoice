/**
 * pdfGenerator.ts — Professional jsPDF invoice engine for Bill.Jemsky
 *
 * Templates: minimal | corporate | premium | textile | jewelry | manufacturing | wholesale
 * Sizes:     a4 | a5 | letter | thermal
 * Features:  dynamic category columns, repeating headers, amount-in-words,
 *            UPI QR, signature/stamp embed, page numbers, bulk export
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceData, InvoiceItem } from "../types";
import { generateUPIQRCode } from "./qrGenerator";
import {
  getPDFColumns,
  getCategoryTerminology,
  getCategoryExtraFields,
} from "../engine/columnEngine";
import { db } from "../lib/db";
import { numberToIndianWords } from "./amountInWords";

// ─── Type helpers ────────────────────────────────────────────────────────────
type RGB = [number, number, number];
type PageSize = "a4" | "a5" | "letter" | "thermal";
type Template =
  | "minimal"
  | "corporate"
  | "premium"
  | "textile"
  | "jewelry"
  | "manufacturing"
  | "wholesale";

interface PDFOptions {
  template?: Template;
  pageSize?: PageSize;
}

// ─── Hex → RGB ────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): RGB {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16) || 0,
    parseInt(c.substring(2, 4), 16) || 0,
    parseInt(c.substring(4, 6), 16) || 0,
  ];
}

// ─── Page dimension lookup ────────────────────────────────────────────────────
const PAGE_DIMS: Record<PageSize, { w: number; h: number; unit: string; fmt: any }> = {
  a4:      { w: 210, h: 297, unit: "mm", fmt: "a4"      },
  a5:      { w: 148, h: 210, unit: "mm", fmt: "a5"      },
  letter:  { w: 216, h: 279, unit: "mm", fmt: "letter"  },
  thermal: { w: 80,  h: 297, unit: "mm", fmt: [80, 297] },
};

// ─── Template accent palette ──────────────────────────────────────────────────
const TEMPLATE_PALETTE: Record<Template, { primary: RGB; secondary: RGB; headerBg: RGB; headerText: RGB }> = {
  minimal:       { primary: [80, 80, 80],   secondary: [130, 130, 130], headerBg: [60, 60, 60],    headerText: [255, 255, 255] },
  corporate:     { primary: [30, 64, 175],  secondary: [29, 78, 216],   headerBg: [30, 64, 175],   headerText: [255, 255, 255] },
  premium:       { primary: [120, 53, 15],  secondary: [212, 175, 55],  headerBg: [120, 53, 15],   headerText: [255, 255, 255] },
  textile:       { primary: [109, 40, 217], secondary: [139, 92, 246],  headerBg: [109, 40, 217],  headerText: [255, 255, 255] },
  jewelry:       { primary: [161, 122, 0],  secondary: [212, 175, 55],  headerBg: [120, 88, 0],    headerText: [255, 255, 255] },
  manufacturing: { primary: [20, 83, 45],   secondary: [22, 163, 74],   headerBg: [20, 83, 45],    headerText: [255, 255, 255] },
  wholesale:     { primary: [12, 74, 110],  secondary: [14, 116, 144],  headerBg: [12, 74, 110],   headerText: [255, 255, 255] },
};

// ─── Infer template from category / templateVariant ──────────────────────────
function resolveTemplate(invoice: InvoiceData): Template {
  const v = (invoice.templateVariant || "").toLowerCase();
  const c = (invoice.businessCategory || invoice.templateCategory || "").toLowerCase();

  if (v.includes("premium"))       return "premium";
  if (v.includes("corporate"))     return "corporate";
  if (v.includes("minimal"))       return "minimal";
  if (c === "jewelry")             return "jewelry";
  if (c === "textile" || c === "textile-garment") return "textile";
  if (c === "manufacturing")       return "manufacturing";
  if (c === "wholesale")           return "wholesale";
  if (v.includes("jewelry"))       return "jewelry";
  return "corporate";
}

// ─── Draw template header accent (top decorative band) ───────────────────────
function drawHeaderAccent(
  doc: jsPDF,
  template: Template,
  margin: number,
  pageW: number,
  y: number,
  palette: (typeof TEMPLATE_PALETTE)[Template]
): number {
  const contentW = pageW - margin * 2;

  if (template === "premium" || template === "jewelry") {
    // Gold top + bottom double rule
    doc.setDrawColor(...palette.secondary);
    doc.setLineWidth(1.2);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    return y + 5;
  }

  if (template === "minimal") {
    doc.setDrawColor(...palette.primary);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageW - margin, y);
    return y + 3;
  }

  // Default: filled header band
  doc.setFillColor(...palette.primary);
  doc.rect(margin, y, contentW, 7, "F");
  return y + 10;
}

// ─── Draw footer accent (bottom of each page) ─────────────────────────────────
function drawFooterAccent(
  doc: jsPDF,
  template: Template,
  margin: number,
  pageW: number,
  pageH: number,
  palette: (typeof TEMPLATE_PALETTE)[Template],
  page: number,
  total: number,
  invoice: InvoiceData
) {
  const footerY = pageH - 8;

  if (template === "premium" || template === "jewelry") {
    doc.setDrawColor(...palette.secondary);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 2, pageW - margin, footerY - 2);
  } else if (template !== "minimal") {
    doc.setFillColor(...palette.primary);
    doc.rect(0, footerY, pageW, 8, "F");
  }

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(
    template === "minimal" || template === "premium" || template === "jewelry"
      ? 130
      : 220
  );
  doc.text(
    `${invoice.companyName || "Bill.Jemsky"} · Invoice ${invoice.invoiceNumber || ""} · Page ${page} of ${total}`,
    pageW / 2,
    footerY + 3,
    { align: "center" }
  );
}

// ─── Main export function ────────────────────────────────────────────────────
export async function generateInvoicePDF(
  invoice: InvoiceData,
  opts: PDFOptions = {}
) {
  const template = opts.template ?? resolveTemplate(invoice);
  const palette  = TEMPLATE_PALETTE[template];

  // Override with invoice branding color if set
  const brandHex = invoice.templateConfig?.branding?.primaryColor;
  const primary: RGB = brandHex ? hexToRgb(brandHex) : palette.primary;

  // Detect thermal
  const isThermal = (invoice.templateVariant || "").toLowerCase().includes("thermal");
  const sizeKey: PageSize = isThermal
    ? "thermal"
    : (opts.pageSize ?? "a4");
  const dim = PAGE_DIMS[sizeKey];
  const pageW = dim.w;
  const pageH = dim.h;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm" as any,
    format: dim.fmt,
  });

  const margin   = isThermal ? 4 : 14;
  const contentW = pageW - margin * 2;

  const config = invoice.templateConfig ?? {
    branding: { primaryColor: "#1e40af", secondaryColor: "#1d4ed8", fontFamily: "Helvetica", fontSize: 10, showSignature: true, showStamp: true },
    layout:   { headerPosition: "top", footerPosition: "bottom", tableLayout: "modern", columnVisibility: { hsn: true, discount: true, tax: true, description: true, weights: false, labour: false }, pageMargins: 14 },
    sections: { customerInfo: true, shippingInfo: true, gstDetails: true, paymentTerms: true, bankDetails: true, qrCode: true, notes: true, terms: true, signatureBlock: true },
  };

  const currSym = invoice.currencySymbol || "₹";
  const categoryId = invoice.businessCategory || invoice.templateCategory || "retail";
  const terminology = getCategoryTerminology(categoryId);
  const pdfCols     = getPDFColumns(categoryId);
  const extraFields = getCategoryExtraFields(categoryId);

  let y = margin;

  // ── 1. HEADER ACCENT BAND ──────────────────────────────────────────────────
  y = drawHeaderAccent(doc, template, margin, pageW, y, { ...palette, primary });

  // ── 2. COMPANY BLOCK (left) + INVOICE META (right) ────────────────────────
  const companyStartY = y;
  let logoH = 0;

  if (invoice.companyLogo) {
    try {
      doc.addImage(invoice.companyLogo, "PNG", margin, y, 20, 20);
      logoH = 22;
    } catch { /* skip bad logo */ }
  }

  const textX = invoice.companyLogo ? margin + 23 : margin;

  // Company name
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(isThermal ? 9 : 13);
  doc.setTextColor(...primary);
  doc.text(invoice.companyName || "YOUR COMPANY", textX, y + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(isThermal ? 6 : 8);
  doc.setTextColor(80, 80, 80);

  let detY = y + 9.5;
  const maxLeftW = isThermal ? contentW : contentW / 2 - 6;
  const addrLines = invoice.companyAddress
    ? doc.splitTextToSize(invoice.companyAddress, maxLeftW)
    : [];
  addrLines.slice(0, 3).forEach((l: string) => { doc.text(l, textX, detY); detY += 3.5; });

  if (invoice.companyPhone)  { doc.text(`Ph: ${invoice.companyPhone}`,  textX, detY); detY += 3.5; }
  if (invoice.companyEmail)  { doc.text(`Email: ${invoice.companyEmail}`, textX, detY); detY += 3.5; }
  if (invoice.companyGST) {
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`GSTIN: ${invoice.companyGST}`, textX, detY);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    detY += 3.5;
  }

  // Right side — invoice title + meta
  if (!isThermal) {
    const rightX = pageW - margin;

    // Document title
    let docTitle = terminology.invoiceTitle || "TAX INVOICE";
    const tc = invoice.templateCategory || "";
    if (tc === "proforma")  docTitle = "PROFORMA INVOICE";
    else if (tc === "quotation") docTitle = "QUOTATION";
    else if (tc === "challan")   docTitle = "DELIVERY CHALLAN";
    else if (tc === "credit")    docTitle = "CREDIT NOTE";
    else if (tc === "debit")     docTitle = "DEBIT NOTE";

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primary);
    doc.text(docTitle, rightX, companyStartY + 6, { align: "right" });

    // Invoice meta table-style block
    const metaRows: [string, string][] = [
      ["Invoice #",  invoice.invoiceNumber || "DRAFT"],
      ["Date",       invoice.invoiceDate   || ""],
    ];
    if (invoice.dueDate)  metaRows.push(["Due Date", invoice.dueDate]);
    if (invoice.poNumber) metaRows.push(["PO / Ref",  invoice.poNumber]);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    let metaY = companyStartY + 13;
    metaRows.forEach(([label, value]) => {
      doc.setTextColor(110, 110, 110);
      doc.text(label + ":", rightX - 32, metaY, { align: "left" });
      doc.setTextColor(30, 30, 30);
      doc.setFont("Helvetica", "bold");
      doc.text(value, rightX, metaY, { align: "right" });
      doc.setFont("Helvetica", "normal");
      metaY += 4.5;
    });
  }

  y = Math.max(detY, companyStartY + logoH, companyStartY + 30) + 4;

  // Thin separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  // ── 3. BILL TO / SHIP TO ───────────────────────────────────────────────────
  if (config.sections.customerInfo && !isThermal) {
    const billToY = y;
    const halfW   = contentW / 2 - 4;
    const shipX   = margin + contentW / 2 + 4;

    // Label
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primary);
    doc.text("BILL TO", margin, y);

    let btY = y + 4.5;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(25, 25, 25);
    doc.text(invoice.clientName || "—", margin, btY); btY += 4;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    if (invoice.clientCompany) { doc.text(invoice.clientCompany, margin, btY); btY += 3.8; }
    if (invoice.clientPhone)   { doc.text(`Ph: ${invoice.clientPhone}`, margin, btY); btY += 3.5; }
    if (invoice.clientEmail)   { doc.text(invoice.clientEmail, margin, btY); btY += 3.5; }
    if (invoice.clientGST) {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`GSTIN: ${invoice.clientGST}`, margin, btY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(90, 90, 90);
      btY += 3.5;
    }
    const addrL = invoice.clientAddress
      ? doc.splitTextToSize(invoice.clientAddress, halfW)
      : [];
    addrL.slice(0, 3).forEach((l: string) => { doc.text(l, margin, btY); btY += 3.5; });

    // Ship To
    let maxY = btY;
    if (config.sections.shippingInfo && invoice.clientShippingAddress) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...primary);
      doc.text("SHIP TO", shipX, billToY);

      let stY = billToY + 4.5;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(25, 25, 25);
      doc.text(invoice.clientName || "—", shipX, stY); stY += 4;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      const shipLines = doc.splitTextToSize(invoice.clientShippingAddress, halfW);
      shipLines.slice(0, 4).forEach((l: string) => { doc.text(l, shipX, stY); stY += 3.5; });
      maxY = Math.max(btY, stY);
    }

    y = maxY + 5;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  // ── 4. INDUSTRY FIELDS PANEL ──────────────────────────────────────────────
  if (invoice.industryFields && Object.keys(invoice.industryFields).length > 0 && !isThermal) {
    const entries = Object.entries(invoice.industryFields).filter(([, v]) => v !== "" && v !== 0);
    if (entries.length > 0) {
      doc.setFillColor(247, 247, 252);
      const panH = Math.ceil(entries.length / 3) * 5 + 4;
      doc.rect(margin, y, contentW, panH, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(70, 70, 70);

      const colW = contentW / 3;
      entries.slice(0, 9).forEach(([key, val], i) => {
        const label = extraFields.find(f => f.key === key)?.label || key;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const fx = margin + 2 + col * colW;
        const fy = y + 3 + row * 5;
        doc.setFont("Helvetica", "bold");
        doc.text(`${label}:`, fx, fy);
        doc.setFont("Helvetica", "normal");
        doc.text(String(val), fx + 22, fy);
      });

      y += panH + 3;
    }
  }

  // ── 5. ITEMS TABLE ──────────────────────────────────────────────────────────
  const pdfColumnDefs = pdfCols
    .filter(c => c.itemField !== null)
    .filter(c => c.header !== "#" && c.header !== "Amount");

  const tableHead = ["#", ...pdfColumnDefs.map(c => c.header), "Amount"];

  const tableBody: (string | number)[][] = invoice.items.map((item: InvoiceItem, idx: number) => {
    const row: (string | number)[] = [idx + 1];
    pdfColumnDefs.forEach(col => {
      const val = (item as Record<string, unknown>)[col.itemField as string];
      if (val === undefined || val === null || val === "") {
        row.push("—");
      } else if (col.align === "right" && typeof val === "number") {
        const isMonetary = /rate|charge|making|labour/i.test(col.itemField as string);
        row.push(isMonetary ? `${currSym}${Number(val).toFixed(2)}` : val);
      } else {
        row.push(String(val));
      }
    });
    row.push(`${currSym}${Number(item.amount || 0).toFixed(2)}`);
    return row;
  });

  const colStyles: Record<number, object> = {
    0: { cellWidth: isThermal ? 5 : 7, halign: "center" },
    [tableHead.length - 1]: { halign: "right", fontStyle: "bold" },
  };
  pdfColumnDefs.forEach((col, i) => {
    if (col.align === "right") colStyles[i + 1] = { halign: "right" };
    if (col.width)             colStyles[i + 1] = { ...colStyles[i + 1], cellWidth: col.width };
  });

  autoTable(doc, {
    startY: y,
    head:   [tableHead],
    body:   tableBody,
    margin: { left: margin, right: margin },
    theme:  template === "minimal" ? "plain" : "striped",
    headStyles: {
      fillColor:  palette.headerBg,
      textColor:  palette.headerText,
      fontSize:   isThermal ? 6.5 : 8.5,
      fontStyle:  "bold",
      halign:     "left",
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
    },
    alternateRowStyles: template === "minimal"
      ? {}
      : { fillColor: [250, 250, 253] },
    columnStyles: colStyles,
    styles: {
      fontSize:    isThermal ? 6.5 : 8,
      cellPadding: isThermal ? 1.2 : 2.5,
      valign:      "middle",
      overflow:    "linebreak",
    },
    // Repeat table headers on every new page
    showHead: "everyPage",
    didParseCell(data) {
      if (data.row.type === "head") return;
      if (data.cell.text[0]?.startsWith(currSym) || data.column.index === tableHead.length - 1) {
        data.cell.styles.halign = "right";
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ── 6. SUMMARY + QR + BANK (2-column bottom section) ──────────────────────
  const checkPageBreak = (neededH: number) => {
    if (y + neededH > pageH - 20) {
      doc.addPage();
      y = margin + 5;
    }
  };

  checkPageBreak(60);
  const summaryStartY = y;

  // Right column: Totals
  const rightX = pageW - margin;
  const labelX = rightX - 34;

  const totals: { label: string; value: number; bold?: boolean }[] = [];

  const subtotal = (invoice.taxableAmount || 0) + (invoice.invoiceDiscountAmount || 0);
  totals.push({ label: "Subtotal", value: subtotal });

  if ((invoice.invoiceDiscountAmount || 0) > 0) {
    totals.push({ label: `Discount (${invoice.invoiceDiscountPercent || 0}%)`, value: -(invoice.invoiceDiscountAmount || 0) });
    totals.push({ label: "Taxable Amount", value: invoice.taxableAmount || 0 });
  }

  if (config.sections.gstDetails) {
    if ((invoice.cgstAmount || 0) > 0) totals.push({ label: `CGST @ ${invoice.cgstRate || 1.5}%`,  value: invoice.cgstAmount || 0 });
    if ((invoice.sgstAmount || 0) > 0) totals.push({ label: `SGST @ ${invoice.sgstRate || 1.5}%`,  value: invoice.sgstAmount || 0 });
    if ((invoice.igstAmount || 0) > 0) totals.push({ label: `IGST @ ${invoice.igstRate || 0}%`,    value: invoice.igstAmount || 0 });
  } else if ((invoice.totalTax || 0) > 0) {
    totals.push({ label: "Total Tax", value: invoice.totalTax || 0 });
  }

  if ((invoice.shippingCharges || 0) > 0)    totals.push({ label: "Shipping Charges",    value: invoice.shippingCharges || 0 });
  if ((invoice.additionalCharges || 0) > 0)  totals.push({ label: "Additional Charges",  value: invoice.additionalCharges || 0 });
  if (Math.abs(invoice.roundOff || 0) > 0)   totals.push({ label: "Round Off",           value: invoice.roundOff || 0 });

  totals.push({ label: "Grand Total", value: invoice.grandTotal || 0, bold: true });

  if ((invoice.oldPurchaseAmount || 0) > 0) {
    totals.push({ label: "Old Metal Deduct", value: -(invoice.oldPurchaseAmount || 0) });
    totals.push({ label: "Balance Due", value: invoice.dueAmount || 0, bold: true });
  }

  let tY = summaryStartY;
  totals.forEach(row => {
    if (row.bold) {
      // Separator line above grand total
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(labelX - 5, tY - 1.5, rightX, tY - 1.5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...primary);
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
    }
    doc.text(row.label, labelX, tY, { align: "left" });
    const sign   = row.value < 0 ? "-" : "";
    const valStr = `${sign}${currSym}${Math.abs(row.value).toFixed(2)}`;
    doc.text(valStr, rightX, tY, { align: "right" });
    tY += row.bold ? 5.5 : 4.5;
  });

  // Amount in words
  const words = numberToIndianWords(invoice.grandTotal || 0);
  const amtWordLines = doc.splitTextToSize(`Amount: ${words}`, contentW);
  tY += 2;
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  amtWordLines.forEach((l: string) => { doc.text(l, rightX, tY, { align: "right" }); tY += 3.5; });

  // Left column: QR + Bank
  let leftY = summaryStartY;
  const leftMaxW = contentW / 2 - 6;

  // UPI QR
  if (config.sections.qrCode && invoice.upiId) {
    try {
      const qrDataUrl = await generateUPIQRCode(
        invoice.upiId,
        invoice.companyName || "Merchant",
        invoice.dueAmount || invoice.grandTotal || 0,
        invoice.currency,
        invoice.invoiceNumber
      );
      if (qrDataUrl) {
        const qrSize = isThermal ? 20 : 26;
        doc.addImage(qrDataUrl, "PNG", margin, leftY, qrSize, qrSize);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text("Scan & Pay (UPI)", margin + qrSize / 2, leftY + qrSize + 3, { align: "center" });
        leftY += qrSize + 7;
      }
    } catch (e) { /* skip QR on error */ }
  }

  // Bank details
  if (config.sections.bankDetails && invoice.paymentDetails) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primary);
    doc.text("PAYMENT DETAILS", margin, leftY); leftY += 3.5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    const bankLines = doc.splitTextToSize(invoice.paymentDetails, leftMaxW);
    bankLines.forEach((l: string) => { doc.text(l, margin, leftY); leftY += 3.3; });
    leftY += 2;
  }

  y = Math.max(tY, leftY) + 6;

  // ── 7. NOTES + TERMS ──────────────────────────────────────────────────────
  checkPageBreak(30);

  if (config.sections.notes && invoice.notes) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primary);
    doc.text("NOTES", margin, y); y += 3.5;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.splitTextToSize(invoice.notes, contentW)
      .forEach((l: string) => { doc.text(l, margin, y); y += 3.3; });
    y += 3;
  }

  if (config.sections.terms && invoice.terms) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primary);
    doc.text("TERMS & CONDITIONS", margin, y); y += 3.5;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.splitTextToSize(invoice.terms, contentW)
      .forEach((l: string) => { doc.text(l, margin, y); y += 3.2; });
    y += 5;
  }

  // ── 8. SIGNATURE / STAMP BLOCK ────────────────────────────────────────────
  if (config.sections.signatureBlock) {
    checkPageBreak(30);

    try {
      const company = await db.companies
        .filter(c => c.name === invoice.companyName)
        .first();

      // Stamp — left
      if (config.branding.showStamp && company?.stamp) {
        try {
          doc.addImage(company.stamp, "PNG", margin + 10, y, 20, 20);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text("Official Stamp", margin + 20, y + 23, { align: "center" });
        } catch { /* skip */ }
      }

      // Signature — right
      const sigX = pageW - margin - 38;
      if (config.branding.showSignature && company?.signature) {
        try {
          doc.addImage(company.signature, "PNG", sigX, y, 36, 12);
        } catch { /* skip */ }
      }
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(sigX, y + 14, pageW - margin, y + 14);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Authorized Signatory", sigX + 19, y + 18, { align: "center" });
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(110, 110, 110);
      doc.text(`for ${invoice.companyName || "Seller"}`, sigX + 19, y + 22, { align: "center" });
    } catch { /* no company found */ }
  }

  // ── 9. FOOTER (all pages) ─────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooterAccent(doc, template, margin, pageW, pageH, { ...palette, primary }, p, totalPages, invoice);
  }

  // ── 10. SAVE ──────────────────────────────────────────────────────────────
  const filename = `Invoice-${invoice.invoiceNumber || "Draft"}-${invoice.clientName || ""}.pdf`
    .replace(/[^a-zA-Z0-9\-_.]/g, "_");
  doc.save(filename);
}

// ─── Bulk export: multiple invoices into a single PDF ────────────────────────
export async function generateBulkPDF(invoices: InvoiceData[], opts: PDFOptions = {}) {
  if (!invoices.length) return;

  // We generate each invoice as a separate PDF and merge using blob URLs isn't possible
  // without pdf-lib. Instead, generate one PDF per page-group using jsPDF's addPage trick.
  // For true multi-invoice single-PDF, iterate and addPage between invoices.
  // Here we generate separate files for simplicity and correctness.
  for (const inv of invoices) {
    await generateInvoicePDF(inv, opts);
  }
}
