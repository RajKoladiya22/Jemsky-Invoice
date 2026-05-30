// ─── Types ─────────────────────────────────────────────────────────────────────

export type MobileSection = "company" | "client" | "details" | "items" | "notes";

export enum TaxMode {
  INVOICE = "invoice",
  ITEM = "item",
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  tax: number | string;
  discount: number | string;
  hsn: string;
  
  // Jewelry specific fields
  grossWeight?: number | string;
  netWeight?: number | string;
  labour?: number | string;
  stoneWeight?: number | string;
  purity?: string;
  makingCharge?: number | string;
  
  // General item fields
  itemCode?: string;
  unit?: string;
  
  // Manufacturing / Pharmacy
  batchNo?: string;
  expiryDate?: string;
  lotNumber?: string;
  
  // Wholesale
  cartons?: number | string;
  unitsPerCarton?: number | string;
  
  // Service / Freelancer
  hours?: number | string;
  
  // Labor Contractor
  workerType?: string;
  numberOfWorkers?: number | string;
  daysWorked?: number | string;
  
  // Construction
  workUnit?: string;
  
  // Transport
  vehicleNo?: string;
  route?: string;
  weight?: number | string;
  distance?: number | string;
  
  // Healthcare
  doctor?: string;
  
  // Textile
  color?: string;
  size?: string;
  
  // Agriculture
  cropType?: string;
  farmDetails?: string;
  
  // Calculated per item
  amount?: number | string;
  taxAmt?: number;
}

export interface TemplateBranding {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  watermark?: string;
  showSignature: boolean;
  showStamp: boolean;
}

export interface TemplateLayout {
  headerPosition: "top" | "left" | "right";
  footerPosition: "bottom" | "split";
  tableLayout: "compact" | "classic" | "modern";
  columnVisibility: {
    hsn: boolean;
    discount: boolean;
    tax: boolean;
    description: boolean;
    weights?: boolean; // grossWeight, netWeight (jewelry)
    labour?: boolean;  // labour charge (jewelry)
  };
  pageMargins: number;
}

export interface TemplateSections {
  customerInfo: boolean;
  shippingInfo: boolean;
  gstDetails: boolean;
  paymentTerms: boolean;
  bankDetails: boolean;
  qrCode: boolean;
  notes: boolean;
  terms: boolean;
  signatureBlock: boolean;
}

export interface InvoiceTemplateConfig {
  id: string;
  name: string;
  category: string; // 'minimal' | 'modern' | 'premium' | 'jewelry' | 'manufacturing' | 'wholesale' | 'service' | 'contractor' | 'tax' ...
  branding: TemplateBranding;
  layout: TemplateLayout;
  sections: TemplateSections;
}

export interface InvoiceData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyGST: string;
  companyLogo: string;

  // Business profile extended details
  city: string;
  state: string;
  pincode: string;
  instagramHandle: string;
  
  // Bank details
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;

  // Client Details
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGST?: string; // Client GST
  clientShippingAddress?: string; // Shipping Address

  invoiceNumber: string;
  billNumber: string;

  invoiceDate: string;
  dueDate: string;

  currency: string;
  currencySymbol: string;

  paymentTerms: string;
  paymentDetails: string;
  paymentMethod?: string;

  poNumber: string;
  referenceNumber?: string;
  hsnCode: string;
  hallmarkId: string;

  items: InvoiceItem[];

  // Advanced Calculations
  taxableAmount: number;

  cgstRate: number;
  cgstAmount: number;

  sgstRate: number;
  sgstAmount: number;

  igstRate: number;
  igstAmount: number;

  totalTax: number;

  grossTotal: number;
  
  // Deductions & Additions
  invoiceDiscountPercent?: number;
  invoiceDiscountAmount?: number;
  shippingCharges?: number;
  additionalCharges?: number;
  
  grandTotalBeforeRoundOff?: number;
  roundOff?: number;
  grandTotal: number;

  oldPurchaseAmount: number;
  dueAmount: number;

  amountInWords: string;

  notes: string;
  terms: string;
  
  // Templates customization embedded in the invoice
  templateId?: string;
  templateCategory?: string;
  templateConfig?: {
    branding: TemplateBranding;
    layout: TemplateLayout;
    sections: TemplateSections;
  };
  
  // Industry-based category system
  businessCategory?: string;   // 'retail' | 'jewelry' | 'manufacturing' | ...
  templateVariant?: string;    // 'classic' | 'modern' | 'premium' | ...
  industryFields?: Record<string, string | number>; // category-specific invoice-level fields
  status?: string; // 'draft' | 'pending' | 'paid' | 'cancelled'
  taxMode?: TaxMode;
}

export interface SavedClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  shippingAddress?: string;
  notes?: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  rate: number | string;
  tax: number | string;
  description: string;
  hsn: string;
  sku?: string;
  unit?: string;
}

export interface SavedCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  logo: string; // base64 representation
  
  pan?: string;
  city?: string;
  state?: string;
  pincode?: string;
  instagramHandle?: string;

  // Bank
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;

  // Customization
  signature?: string; // base64
  stamp?: string; // base64
  terms?: string;
  isDefault?: boolean;
}

export interface SavedInvoice extends InvoiceData {
  id: string;
  savedAt: string;
}