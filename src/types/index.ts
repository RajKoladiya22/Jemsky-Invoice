// ─── Types ─────────────────────────────────────────────────────────────────────
export type MobileSection = "company" | "client" | "details" | "items" | "notes";

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  tax: number | string;
  discount: number | string;
  hsn: string;
  grossWeight?: number | string;
  netWeight?: number | string;
  labour?: number | string;
  amount?: number | string;
}

// export interface InvoiceData {
//   companyName: string;
//   companyEmail: string;
//   companyPhone: string;
//   companyAddress: string;
//   companyGST: string;
//   companyLogo: string;
//   clientName: string;
//   clientCompany: string;
//   clientEmail: string;
//   clientPhone: string;
//   clientAddress: string;
//   invoiceNumber: string;
//   invoiceDate: string;
//   dueDate: string;
//   currency: string;
//   currencySymbol: string;
//   paymentTerms: string;
//   poNumber: string;
//   hsnCode: string;
//   items: InvoiceItem[];
//   notes: string;
//   terms: string;
//   paymentDetails: string;
// }

export interface InvoiceData {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    companyGST: string;
    companyLogo: string;

    city: string;
    state: string;
    pincode: string;
    instagramHandle: string;

    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;

    invoiceNumber: string;
    billNumber: string;

    invoiceDate: string;
    dueDate: string;

    currency: string;
    currencySymbol: string;

    paymentTerms: string;
    paymentDetails: string;

    poNumber: string;

    hsnCode: string;
    hallmarkId: string;

    items: InvoiceItem[];

    taxableAmount: number;

    cgstRate: number;
    cgstAmount: number;

    sgstRate: number;
    sgstAmount: number;

    igstRate: number;
    igstAmount: number;

    totalTax: number;

    grossTotal: number;
    grandTotal: number;

    oldPurchaseAmount: number;
    dueAmount: number;

    amountInWords: string;

    notes: string;
    terms: string;
}

export interface SavedClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  rate: number;
  tax: number;
  description: string;
  hsn: string;
}

export interface SavedCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  logo: string;
}

export interface SavedInvoice extends InvoiceData {
  id: string;
  savedAt: string;
}