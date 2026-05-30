// ─── Category Schema ────────────────────────────────────────────────────────
// Central config-driven registry for all business categories.
// Adding a new category = adding one entry here. No other code changes needed.

export type ColumnKey =
  | "sno"
  | "itemCode"
  | "itemName"
  | "description"
  | "batchNo"
  | "expiryDate"
  | "lotNumber"
  | "purity"
  | "grossWeight"
  | "stoneWeight"
  | "netWeight"
  | "ratePerGram"
  | "makingCharge"
  | "hsn"
  | "qty"
  | "unit"
  | "rate"
  | "discount"
  | "tax"
  | "amount"
  // Wholesale
  | "cartons"
  | "unitsPerCarton"
  | "totalQty"
  | "wholesaleRate"
  // Service / Freelancer
  | "hours"
  | "ratePerHour"
  // Labor
  | "workerType"
  | "numberOfWorkers"
  | "daysWorked"
  | "ratePerDay"
  // Construction
  | "workItem"
  | "workUnit"
  // Transport
  | "vehicleNo"
  | "route"
  | "weight"
  | "distance"
  // Healthcare
  | "treatment"
  | "doctor"
  // Restaurant
  | "tableNo"
  // Textile
  | "color"
  | "size"
  // Agriculture
  | "cropType"
  | "farmDetails";

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  type: "text" | "number" | "date";
  width?: number; // PDF column width in mm (optional)
  align?: "left" | "right" | "center";
  step?: number;
  placeholder?: string;
}

export interface InvoiceExtraField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: string[]; // for select
  placeholder?: string;
  group?: string; // UI grouping label
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  pdfLayout: "corporate" | "modern" | "premium" | "minimal" | "luxury" | "industrial" | "government" | "thermal" | "a5";
  accentColor: string;
}

export type CalculationMode =
  | "standard"       // qty × rate - discount
  | "jewelry"        // netWeight × ratePerGram + makingCharge
  | "labor"          // numberOfWorkers × daysWorked × ratePerDay
  | "transport"      // weight × distance × rate (or flat rate)
  | "service"        // hours × rate
  | "wholesale";     // cartons × unitsPerCarton × wholesaleRate

export interface CategoryTerminology {
  invoiceTitle: string;       // "TAX INVOICE", "TRANSPORT BILL", etc.
  customerLabel: string;      // "Bill To" / "Patient" / "Consignee"
  itemTableTitle: string;     // "Items", "Services", "Works"
  quantityLabel: string;      // "Qty", "Hours", "Workers"
  rateLabel: string;          // "Rate", "Rate/Hour", "Rate/Day"
}

export interface BusinessCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  accentColor: string;        // Tailwind-compatible hex or hsl
  gradientFrom: string;
  gradientTo: string;
  columns: ColumnKey[];       // Ordered list of columns shown in item table
  itemDefaults: Partial<Record<ColumnKey, string | number>>;
  extraItemFields: ColumnDef[];
  invoiceExtraFields: InvoiceExtraField[];
  calculationMode: CalculationMode;
  terminology: CategoryTerminology;
  templates: CategoryTemplate[];
  defaultGSTRate: number;     // default GST % for this category
}

// ─── Column Definitions Master List ──────────────────────────────────────────

export const ALL_COLUMN_DEFS: Record<ColumnKey, ColumnDef> = {
  sno:            { key: "sno",           label: "#",              type: "number", width: 8,  align: "center" },
  itemCode:       { key: "itemCode",      label: "Item Code",      type: "text",   width: 22, align: "left" },
  itemName:       { key: "itemName",      label: "Item / Service", type: "text",   width: 50, align: "left" },
  description:    { key: "description",   label: "Description",    type: "text",   width: 40, align: "left" },
  batchNo:        { key: "batchNo",       label: "Batch No",       type: "text",   width: 22, align: "left" },
  expiryDate:     { key: "expiryDate",    label: "Expiry Date",    type: "date",   width: 22, align: "left" },
  lotNumber:      { key: "lotNumber",     label: "Lot No",         type: "text",   width: 20, align: "left" },
  purity:         { key: "purity",        label: "Purity",         type: "text",   width: 16, align: "center" },
  grossWeight:    { key: "grossWeight",   label: "Gross Wt (g)",   type: "number", width: 20, align: "right", step: 0.001 },
  stoneWeight:    { key: "stoneWeight",   label: "Stone Wt (g)",   type: "number", width: 20, align: "right", step: 0.001 },
  netWeight:      { key: "netWeight",     label: "Net Wt (g)",     type: "number", width: 20, align: "right", step: 0.001 },
  ratePerGram:    { key: "ratePerGram",   label: "Rate/g",         type: "number", width: 20, align: "right", step: 0.01 },
  makingCharge:   { key: "makingCharge",  label: "Making Charge",  type: "number", width: 22, align: "right", step: 0.01 },
  hsn:            { key: "hsn",           label: "HSN/SAC",        type: "text",   width: 20, align: "center" },
  qty:            { key: "qty",           label: "Qty",            type: "number", width: 14, align: "right", step: 0.01 },
  unit:           { key: "unit",          label: "Unit",           type: "text",   width: 14, align: "center" },
  rate:           { key: "rate",          label: "Rate",           type: "number", width: 20, align: "right", step: 0.01 },
  discount:       { key: "discount",      label: "Disc %",         type: "number", width: 14, align: "right", step: 0.1 },
  tax:            { key: "tax",           label: "GST %",          type: "number", width: 14, align: "right", step: 0.5 },
  amount:         { key: "amount",        label: "Amount",         type: "number", width: 24, align: "right" },
  cartons:        { key: "cartons",       label: "Cartons",        type: "number", width: 16, align: "right" },
  unitsPerCarton: { key: "unitsPerCarton",label: "Units/Ctn",      type: "number", width: 18, align: "right" },
  totalQty:       { key: "totalQty",      label: "Total Qty",      type: "number", width: 18, align: "right" },
  wholesaleRate:  { key: "wholesaleRate", label: "W/S Rate",       type: "number", width: 20, align: "right", step: 0.01 },
  hours:          { key: "hours",         label: "Hours",          type: "number", width: 14, align: "right", step: 0.5 },
  ratePerHour:    { key: "ratePerHour",   label: "Rate/Hr",        type: "number", width: 18, align: "right", step: 0.01 },
  workerType:     { key: "workerType",    label: "Worker Type",    type: "text",   width: 28, align: "left" },
  numberOfWorkers:{ key: "numberOfWorkers",label: "Workers",       type: "number", width: 16, align: "right" },
  daysWorked:     { key: "daysWorked",    label: "Days",           type: "number", width: 14, align: "right" },
  ratePerDay:     { key: "ratePerDay",    label: "Rate/Day",       type: "number", width: 20, align: "right", step: 0.01 },
  workItem:       { key: "workItem",      label: "Work Item",      type: "text",   width: 40, align: "left" },
  workUnit:       { key: "workUnit",      label: "Unit",           type: "text",   width: 16, align: "center" },
  vehicleNo:      { key: "vehicleNo",     label: "Vehicle No",     type: "text",   width: 22, align: "left" },
  route:          { key: "route",         label: "Route",          type: "text",   width: 36, align: "left" },
  weight:         { key: "weight",        label: "Weight (kg)",    type: "number", width: 20, align: "right" },
  distance:       { key: "distance",      label: "Distance (km)",  type: "number", width: 22, align: "right" },
  treatment:      { key: "treatment",     label: "Treatment",      type: "text",   width: 38, align: "left" },
  doctor:         { key: "doctor",        label: "Doctor",         type: "text",   width: 28, align: "left" },
  tableNo:        { key: "tableNo",       label: "Table No",       type: "text",   width: 18, align: "center" },
  color:          { key: "color",         label: "Color",          type: "text",   width: 18, align: "left" },
  size:           { key: "size",          label: "Size",           type: "text",   width: 14, align: "center" },
  cropType:       { key: "cropType",      label: "Crop Type",      type: "text",   width: 28, align: "left" },
  farmDetails:    { key: "farmDetails",   label: "Farm Details",   type: "text",   width: 30, align: "left" },
};

// ─── All 20 Business Categories ──────────────────────────────────────────────

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  // ─── 1. Retail Store ─────────────────────────────────────────────────────
  {
    id: "retail",
    label: "Retail Store",
    emoji: "🛒",
    description: "Products with SKU, barcode, GST and discount support",
    accentColor: "#7c3aed",
    gradientFrom: "#7c3aed",
    gradientTo: "#4338ca",
    columns: ["sno", "itemCode", "itemName", "qty", "unit", "rate", "discount", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, discount: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "RETAIL INVOICE",
      customerLabel: "Bill To",
      itemTableTitle: "Items",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "retail-classic",  name: "Classic Retail",      description: "Clean table with barcode support",   pdfLayout: "corporate", accentColor: "#7c3aed" },
      { id: "retail-modern",   name: "Modern POS",          description: "Vibrant modern layout",              pdfLayout: "modern",    accentColor: "#6366f1" },
      { id: "retail-minimal",  name: "Minimal Receipt",     description: "Minimalist black & white",           pdfLayout: "minimal",   accentColor: "#374151" },
      { id: "retail-gst",      name: "GST Tax Invoice",     description: "Government-compliant format",        pdfLayout: "government",accentColor: "#1e40af" },
      { id: "retail-thermal",  name: "Thermal Receipt",     description: "58mm / 80mm thermal print",         pdfLayout: "thermal",   accentColor: "#111827" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 2. Jewelry ──────────────────────────────────────────────────────────
  {
    id: "jewelry",
    label: "Jewelry",
    emoji: "💎",
    description: "Gold, silver, diamond with weight, purity, and making charges",
    accentColor: "#b45309",
    gradientFrom: "#d97706",
    gradientTo: "#92400e",
    columns: ["sno", "itemName", "grossWeight", "stoneWeight", "netWeight", "purity", "ratePerGram", "makingCharge", "tax", "amount"],
    itemDefaults: { grossWeight: 0, netWeight: 0, stoneWeight: 0, ratePerGram: 0, makingCharge: 0, tax: 3 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "hallmarkNumber",  label: "Hallmark Number",  type: "text",   group: "Jewelry Details" },
      { key: "goldRate",        label: "Gold Rate (₹/g)",  type: "number", group: "Jewelry Details" },
      { key: "silverRate",      label: "Silver Rate (₹/g)",type: "number", group: "Jewelry Details" },
      { key: "wastagePercent",  label: "Wastage %",        type: "number", group: "Jewelry Details" },
      { key: "stoneCharges",    label: "Stone Charges",    type: "number", group: "Jewelry Details" },
      { key: "diamondCharges",  label: "Diamond Charges",  type: "number", group: "Jewelry Details" },
    ],
    calculationMode: "jewelry",
    terminology: {
      invoiceTitle: "JEWELRY TAX INVOICE",
      customerLabel: "Bill To",
      itemTableTitle: "Ornaments & Items",
      quantityLabel: "Net Wt (g)",
      rateLabel: "Rate/g",
    },
    templates: [
      { id: "jewelry-classic",   name: "Classic Jewelry Invoice",  description: "Traditional gold border layout",    pdfLayout: "luxury",    accentColor: "#b45309" },
      { id: "jewelry-gold-buy",  name: "Gold Purchase Invoice",    description: "Buying format with old gold credit", pdfLayout: "corporate", accentColor: "#92400e" },
      { id: "jewelry-gold-sell", name: "Gold Sale Invoice",        description: "Sale format with hallmark details",  pdfLayout: "modern",    accentColor: "#d97706" },
      { id: "jewelry-ornament",  name: "Ornament Billing Format",  description: "Per-item ornament list",             pdfLayout: "premium",   accentColor: "#a16207" },
      { id: "jewelry-hallmark",  name: "Hallmark Invoice",         description: "BIS hallmark certified format",      pdfLayout: "government",accentColor: "#1e40af" },
      { id: "jewelry-premium",   name: "Premium Jewelry Invoice",  description: "Luxury boutique style",              pdfLayout: "luxury",    accentColor: "#78350f" },
    ],
    defaultGSTRate: 3,
  },

  // ─── 3. Manufacturing ────────────────────────────────────────────────────
  {
    id: "manufacturing",
    label: "Manufacturing",
    emoji: "🏭",
    description: "Material supply with batch, lot, quality grade and dispatch details",
    accentColor: "#0f766e",
    gradientFrom: "#0f766e",
    gradientTo: "#065f46",
    columns: ["sno", "itemCode", "itemName", "batchNo", "lotNumber", "qty", "unit", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "productionDate", label: "Production Date", type: "date",   group: "Manufacturing" },
      { key: "dispatchDate",   label: "Dispatch Date",   type: "date",   group: "Manufacturing" },
      { key: "qualityGrade",   label: "Quality Grade",   type: "text",   group: "Manufacturing" },
      { key: "vehicleNo",      label: "Vehicle No",      type: "text",   group: "Dispatch" },
      { key: "eWayBillNo",     label: "E-Way Bill No",   type: "text",   group: "Dispatch" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "MANUFACTURING TAX INVOICE",
      customerLabel: "Consignee",
      itemTableTitle: "Materials / Products",
      quantityLabel: "Qty",
      rateLabel: "Unit Price",
    },
    templates: [
      { id: "mfg-supply",    name: "Material Supply Invoice", description: "Raw material dispatch format",   pdfLayout: "industrial", accentColor: "#0f766e" },
      { id: "mfg-production",name: "Production Invoice",      description: "Finished goods invoice",         pdfLayout: "corporate",  accentColor: "#065f46" },
      { id: "mfg-tax",       name: "Industrial Tax Invoice",  description: "Full GST compliance layout",     pdfLayout: "government", accentColor: "#1e40af" },
      { id: "mfg-dispatch",  name: "Factory Dispatch Invoice",description: "Dispatch with batch & E-way",   pdfLayout: "modern",     accentColor: "#0f766e" },
      { id: "mfg-export",    name: "Export Invoice",          description: "International export format",    pdfLayout: "premium",    accentColor: "#1e3a5f" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 4. Wholesale ────────────────────────────────────────────────────────
  {
    id: "wholesale",
    label: "Wholesale",
    emoji: "📦",
    description: "Bulk carton pricing with distributor discounts and transport charges",
    accentColor: "#1d4ed8",
    gradientFrom: "#2563eb",
    gradientTo: "#1e3a8a",
    columns: ["sno", "itemName", "cartons", "unitsPerCarton", "qty", "wholesaleRate", "discount", "tax", "amount"],
    itemDefaults: { cartons: 1, unitsPerCarton: 1, qty: 1, wholesaleRate: 0, discount: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "distributorCode", label: "Distributor Code", type: "text",   group: "Wholesale" },
      { key: "transportCharges",label: "Transport Charges", type: "number", group: "Wholesale" },
      { key: "deliveryTerms",   label: "Delivery Terms",   type: "text",   group: "Wholesale" },
    ],
    calculationMode: "wholesale",
    terminology: {
      invoiceTitle: "WHOLESALE INVOICE",
      customerLabel: "Distributor / Dealer",
      itemTableTitle: "Products",
      quantityLabel: "Cartons",
      rateLabel: "W/S Rate",
    },
    templates: [
      { id: "ws-standard",  name: "Standard Wholesale",   description: "Carton-based bulk invoice",     pdfLayout: "corporate", accentColor: "#1d4ed8" },
      { id: "ws-bulk",      name: "Bulk Pricing Invoice",  description: "Tiered pricing format",         pdfLayout: "modern",    accentColor: "#2563eb" },
      { id: "ws-distributor",name: "Distributor Invoice",  description: "Distributor discount layout",   pdfLayout: "premium",   accentColor: "#1e3a8a" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 5. Distribution ────────────────────────────────────────────────────
  {
    id: "distribution",
    label: "Distribution",
    emoji: "🚚",
    description: "Secondary distribution with route-wise and dealer billing",
    accentColor: "#0369a1",
    gradientFrom: "#0284c7",
    gradientTo: "#075985",
    columns: ["sno", "itemName", "qty", "unit", "rate", "discount", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, discount: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "routeName",      label: "Route / Area",       type: "text",   group: "Distribution" },
      { key: "dealerCode",     label: "Dealer Code",        type: "text",   group: "Distribution" },
      { key: "vehicleNo",      label: "Vehicle No",         type: "text",   group: "Distribution" },
      { key: "beatNumber",     label: "Beat Number",        type: "text",   group: "Distribution" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "DISTRIBUTION INVOICE",
      customerLabel: "Dealer / Retailer",
      itemTableTitle: "Products",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "dist-standard", name: "Standard Distribution", description: "Route-wise dealer invoice",  pdfLayout: "corporate", accentColor: "#0369a1" },
      { id: "dist-modern",   name: "Modern Distribution",   description: "Clean modern layout",        pdfLayout: "modern",    accentColor: "#0284c7" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 6. Service Provider ────────────────────────────────────────────────
  {
    id: "service",
    label: "Service Provider",
    emoji: "🔧",
    description: "Time-based and project services with AMC, consulting, and agency billing",
    accentColor: "#7c3aed",
    gradientFrom: "#8b5cf6",
    gradientTo: "#6d28d9",
    columns: ["sno", "itemName", "description", "hours", "rate", "tax", "amount"],
    itemDefaults: { hours: 1, rate: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "projectName",    label: "Project Name",       type: "text",   group: "Service" },
      { key: "projectRef",     label: "Project Reference",  type: "text",   group: "Service" },
      { key: "servicePeriod",  label: "Service Period",     type: "text",   group: "Service", placeholder: "e.g. May 2025" },
      { key: "workOrderNo",    label: "Work Order No",      type: "text",   group: "Service" },
    ],
    calculationMode: "service",
    terminology: {
      invoiceTitle: "SERVICE INVOICE",
      customerLabel: "Client",
      itemTableTitle: "Services Rendered",
      quantityLabel: "Hours",
      rateLabel: "Rate/Hr",
    },
    templates: [
      { id: "svc-standard",   name: "Service Invoice",     description: "Clean service billing format",  pdfLayout: "modern",    accentColor: "#7c3aed" },
      { id: "svc-amc",        name: "AMC Invoice",         description: "Annual maintenance contract",   pdfLayout: "corporate", accentColor: "#6d28d9" },
      { id: "svc-consulting",  name: "Consulting Invoice",  description: "Professional consulting layout",pdfLayout: "premium",   accentColor: "#4c1d95" },
      { id: "svc-agency",     name: "Agency Invoice",      description: "Marketing/agency services",     pdfLayout: "luxury",    accentColor: "#8b5cf6" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 7. Freelancer ──────────────────────────────────────────────────────
  {
    id: "freelancer",
    label: "Freelancer",
    emoji: "💻",
    description: "Task-based billing with milestones, project reference, and hourly rates",
    accentColor: "#0891b2",
    gradientFrom: "#06b6d4",
    gradientTo: "#0e7490",
    columns: ["sno", "itemName", "description", "hours", "rate", "amount"],
    itemDefaults: { hours: 1, rate: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "clientRef",    label: "Client Reference",  type: "text",   group: "Project" },
      { key: "projectName",  label: "Project Name",      type: "text",   group: "Project" },
      { key: "milestone",    label: "Milestone",         type: "text",   group: "Project" },
      { key: "billingPeriod",label: "Billing Period",    type: "text",   group: "Project", placeholder: "e.g. Sprint 3" },
    ],
    calculationMode: "service",
    terminology: {
      invoiceTitle: "FREELANCER INVOICE",
      customerLabel: "Client",
      itemTableTitle: "Tasks / Deliverables",
      quantityLabel: "Hours",
      rateLabel: "Rate/Hr",
    },
    templates: [
      { id: "fl-clean",    name: "Clean Freelancer",   description: "Minimalist professional invoice", pdfLayout: "minimal",   accentColor: "#0891b2" },
      { id: "fl-modern",   name: "Modern Freelancer",  description: "Vibrant designer invoice",        pdfLayout: "modern",    accentColor: "#06b6d4" },
      { id: "fl-creative", name: "Creative Agency",    description: "Bold creative layout",            pdfLayout: "premium",   accentColor: "#0e7490" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 8. Labor Contractor ────────────────────────────────────────────────
  {
    id: "labor",
    label: "Labor Contractor",
    emoji: "👷",
    description: "Daily wage billing for construction, manufacturing, and site work",
    accentColor: "#b45309",
    gradientFrom: "#f59e0b",
    gradientTo: "#92400e",
    columns: ["sno", "workerType", "numberOfWorkers", "daysWorked", "ratePerDay", "amount"],
    itemDefaults: { numberOfWorkers: 1, daysWorked: 1, ratePerDay: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "siteName",         label: "Site Name",          type: "text",   group: "Site Details" },
      { key: "contractorLicense",label: "Contractor License", type: "text",   group: "Site Details" },
      { key: "projectLocation",  label: "Project Location",   type: "text",   group: "Site Details" },
      { key: "workPeriodFrom",   label: "Work Period From",   type: "date",   group: "Site Details" },
      { key: "workPeriodTo",     label: "Work Period To",     type: "date",   group: "Site Details" },
    ],
    calculationMode: "labor",
    terminology: {
      invoiceTitle: "LABOUR BILL",
      customerLabel: "Employer / Principal",
      itemTableTitle: "Labour Details",
      quantityLabel: "Workers",
      rateLabel: "Rate/Day",
    },
    templates: [
      { id: "lab-standard",  name: "Standard Labour Bill", description: "Workers × Days × Rate format",  pdfLayout: "industrial", accentColor: "#b45309" },
      { id: "lab-contract",  name: "Contract Bill",        description: "Formal contractor invoice",      pdfLayout: "government", accentColor: "#1e40af" },
      { id: "lab-daily",     name: "Daily Wage Sheet",     description: "Day-wise worker billing",        pdfLayout: "corporate",  accentColor: "#92400e" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 9. Construction ────────────────────────────────────────────────────
  {
    id: "construction",
    label: "Construction",
    emoji: "🏗️",
    description: "BOQ-based stage billing for civil and structural works",
    accentColor: "#92400e",
    gradientFrom: "#a16207",
    gradientTo: "#78350f",
    columns: ["sno", "workItem", "workUnit", "qty", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "projectName",    label: "Project Name",       type: "text",   group: "Construction" },
      { key: "siteLocation",   label: "Site Location",      type: "text",   group: "Construction" },
      { key: "stage",          label: "Stage / Phase",      type: "text",   group: "Construction", placeholder: "e.g. Foundation, RCC" },
      { key: "boqRef",         label: "BOQ Reference",      type: "text",   group: "Construction" },
      { key: "workOrderNo",    label: "Work Order No",      type: "text",   group: "Construction" },
      { key: "completionDate", label: "Completion Date",    type: "date",   group: "Construction" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "CONSTRUCTION INVOICE",
      customerLabel: "Client / Owner",
      itemTableTitle: "Bill of Quantities",
      quantityLabel: "Quantity",
      rateLabel: "Rate",
    },
    templates: [
      { id: "con-boq",     name: "BOQ Invoice",          description: "Bill of Quantities format",    pdfLayout: "industrial", accentColor: "#92400e" },
      { id: "con-stage",   name: "Stage-wise Billing",   description: "Progress billing per stage",   pdfLayout: "corporate",  accentColor: "#a16207" },
      { id: "con-project", name: "Project Invoice",      description: "Full project billing sheet",   pdfLayout: "government", accentColor: "#78350f" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 10. Transport & Logistics ─────────────────────────────────────────
  {
    id: "transport",
    label: "Transport & Logistics",
    emoji: "🚛",
    description: "Route-based freight billing with LR number, vehicle, and consignment details",
    accentColor: "#1e40af",
    gradientFrom: "#2563eb",
    gradientTo: "#1e3a8a",
    columns: ["sno", "vehicleNo", "route", "weight", "distance", "rate", "amount"],
    itemDefaults: { weight: 0, distance: 0, rate: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "lrNumber",        label: "LR Number",          type: "text",   group: "Transport" },
      { key: "consignmentNo",   label: "Consignment No",     type: "text",   group: "Transport" },
      { key: "driverName",      label: "Driver Name",        type: "text",   group: "Transport" },
      { key: "driverMobile",    label: "Driver Mobile",      type: "text",   group: "Transport" },
      { key: "fromLocation",    label: "From Location",      type: "text",   group: "Transport" },
      { key: "toLocation",      label: "To Location",        type: "text",   group: "Transport" },
      { key: "goodsDescription",label: "Goods Description",  type: "text",   group: "Transport" },
    ],
    calculationMode: "transport",
    terminology: {
      invoiceTitle: "TRANSPORT BILL",
      customerLabel: "Consignee",
      itemTableTitle: "Freight Details",
      quantityLabel: "Weight (kg)",
      rateLabel: "Rate",
    },
    templates: [
      { id: "tr-standard",  name: "Transport Bill",        description: "Standard freight invoice",     pdfLayout: "industrial", accentColor: "#1e40af" },
      { id: "tr-lorry",     name: "Lorry Receipt",         description: "LR format with consignment",   pdfLayout: "government", accentColor: "#1e3a8a" },
      { id: "tr-logistics", name: "Logistics Invoice",     description: "Modern logistics billing",     pdfLayout: "modern",     accentColor: "#2563eb" },
    ],
    defaultGSTRate: 12,
  },

  // ─── 11. Healthcare ────────────────────────────────────────────────────
  {
    id: "healthcare",
    label: "Healthcare",
    emoji: "🏥",
    description: "Patient treatment billing with doctor, admission number, and prescription reference",
    accentColor: "#0f766e",
    gradientFrom: "#10b981",
    gradientTo: "#065f46",
    columns: ["sno", "treatment", "doctor", "qty", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "patientId",       label: "Patient ID",         type: "text",   group: "Patient Info" },
      { key: "patientName",     label: "Patient Name",       type: "text",   group: "Patient Info" },
      { key: "admissionNo",     label: "Admission No",       type: "text",   group: "Patient Info" },
      { key: "prescriptionRef", label: "Prescription Ref",   type: "text",   group: "Patient Info" },
      { key: "wardBed",         label: "Ward / Bed",         type: "text",   group: "Patient Info" },
      { key: "doctorName",      label: "Doctor Name",        type: "text",   group: "Patient Info" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "MEDICAL BILL",
      customerLabel: "Patient",
      itemTableTitle: "Treatments & Services",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "hc-hospital",  name: "Hospital Bill",       description: "Standard hospital billing",      pdfLayout: "corporate", accentColor: "#0f766e" },
      { id: "hc-clinic",    name: "Clinic Receipt",      description: "Clinic consultation receipt",    pdfLayout: "modern",    accentColor: "#10b981" },
      { id: "hc-diagnostic",name: "Diagnostic Bill",     description: "Lab & diagnostic billing",       pdfLayout: "minimal",   accentColor: "#065f46" },
    ],
    defaultGSTRate: 0,
  },

  // ─── 12. Education ─────────────────────────────────────────────────────
  {
    id: "education",
    label: "Education",
    emoji: "🎓",
    description: "Fee receipts for schools, colleges, coaching, and training institutes",
    accentColor: "#6d28d9",
    gradientFrom: "#7c3aed",
    gradientTo: "#4c1d95",
    columns: ["sno", "itemName", "description", "qty", "rate", "amount"],
    itemDefaults: { qty: 1, rate: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "studentName",   label: "Student Name",       type: "text",   group: "Student Info" },
      { key: "rollNo",        label: "Roll No / Enroll No",type: "text",   group: "Student Info" },
      { key: "course",        label: "Course / Class",     type: "text",   group: "Student Info" },
      { key: "academicYear",  label: "Academic Year",      type: "text",   group: "Student Info", placeholder: "2025-26" },
      { key: "feeMonth",      label: "Fee Month",          type: "text",   group: "Student Info" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "FEE RECEIPT",
      customerLabel: "Student / Parent",
      itemTableTitle: "Fee Details",
      quantityLabel: "Qty",
      rateLabel: "Amount",
    },
    templates: [
      { id: "edu-receipt",  name: "Fee Receipt",          description: "Standard fee receipt",         pdfLayout: "corporate", accentColor: "#6d28d9" },
      { id: "edu-coaching", name: "Coaching Invoice",     description: "Coaching/tuition billing",     pdfLayout: "modern",    accentColor: "#7c3aed" },
      { id: "edu-college",  name: "College Invoice",      description: "College admissions format",    pdfLayout: "government",accentColor: "#4c1d95" },
    ],
    defaultGSTRate: 0,
  },

  // ─── 13. Agriculture ──────────────────────────────────────────────────
  {
    id: "agriculture",
    label: "Agriculture",
    emoji: "🌾",
    description: "Farm produce billing with crop type, weight, lot number, and farm details",
    accentColor: "#16a34a",
    gradientFrom: "#22c55e",
    gradientTo: "#14532d",
    columns: ["sno", "itemName", "cropType", "lotNumber", "weight", "unit", "rate", "tax", "amount"],
    itemDefaults: { weight: 0, rate: 0, tax: 0 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "farmName",   label: "Farm Name",        type: "text",   group: "Farm Details" },
      { key: "farmerName", label: "Farmer Name",      type: "text",   group: "Farm Details" },
      { key: "village",    label: "Village / Mandal", type: "text",   group: "Farm Details" },
      { key: "season",     label: "Season / Kharif",  type: "text",   group: "Farm Details" },
      { key: "mspRate",    label: "MSP Rate",         type: "number", group: "Farm Details" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "AGRICULTURE INVOICE",
      customerLabel: "Buyer / Mandi",
      itemTableTitle: "Farm Produce",
      quantityLabel: "Weight (kg)",
      rateLabel: "Rate/kg",
    },
    templates: [
      { id: "agr-standard", name: "Farm Invoice",       description: "Produce billing format",       pdfLayout: "corporate",  accentColor: "#16a34a" },
      { id: "agr-mandi",    name: "Mandi Receipt",      description: "Mandi/market yard format",     pdfLayout: "government", accentColor: "#14532d" },
      { id: "agr-export",   name: "Export Invoice",     description: "Agricultural export format",   pdfLayout: "industrial", accentColor: "#22c55e" },
    ],
    defaultGSTRate: 0,
  },

  // ─── 14. Automobile ───────────────────────────────────────────────────
  {
    id: "automobile",
    label: "Automobile",
    emoji: "🚗",
    description: "Spare parts and service billing with vehicle, chassis, and engine numbers",
    accentColor: "#374151",
    gradientFrom: "#4b5563",
    gradientTo: "#111827",
    columns: ["sno", "itemCode", "itemName", "qty", "unit", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "vehicleNumber",   label: "Vehicle Number",   type: "text",   group: "Vehicle Info" },
      { key: "vehicleModel",    label: "Vehicle Model",    type: "text",   group: "Vehicle Info" },
      { key: "chassisNumber",   label: "Chassis Number",   type: "text",   group: "Vehicle Info" },
      { key: "engineNumber",    label: "Engine Number",    type: "text",   group: "Vehicle Info" },
      { key: "kmReading",       label: "KM Reading",       type: "number", group: "Vehicle Info" },
      { key: "mechanicName",    label: "Mechanic Name",    type: "text",   group: "Vehicle Info" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "AUTOMOBILE TAX INVOICE",
      customerLabel: "Vehicle Owner",
      itemTableTitle: "Parts & Services",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "auto-parts",   name: "Parts Invoice",        description: "Spare parts billing",          pdfLayout: "industrial", accentColor: "#374151" },
      { id: "auto-service", name: "Service Invoice",      description: "Workshop service billing",     pdfLayout: "corporate",  accentColor: "#4b5563" },
      { id: "auto-showroom",name: "Showroom Invoice",     description: "New vehicle sales format",     pdfLayout: "premium",    accentColor: "#111827" },
    ],
    defaultGSTRate: 28,
  },

  // ─── 15. Electronics ──────────────────────────────────────────────────
  {
    id: "electronics",
    label: "Electronics",
    emoji: "📱",
    description: "Electronics and appliances billing with serial number and warranty details",
    accentColor: "#2563eb",
    gradientFrom: "#3b82f6",
    gradientTo: "#1e40af",
    columns: ["sno", "itemCode", "itemName", "qty", "unit", "rate", "discount", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, discount: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "serialNumber",  label: "Serial Number",    type: "text",   group: "Product Info" },
      { key: "imeiNumber",    label: "IMEI Number",      type: "text",   group: "Product Info" },
      { key: "warrantyPeriod",label: "Warranty Period",  type: "text",   group: "Product Info", placeholder: "e.g. 1 Year" },
      { key: "modelNumber",   label: "Model Number",     type: "text",   group: "Product Info" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "ELECTRONICS TAX INVOICE",
      customerLabel: "Customer",
      itemTableTitle: "Products",
      quantityLabel: "Qty",
      rateLabel: "MRP / Rate",
    },
    templates: [
      { id: "elec-retail",   name: "Electronics Invoice", description: "Product retail billing",      pdfLayout: "modern",    accentColor: "#2563eb" },
      { id: "elec-b2b",      name: "B2B Electronics",     description: "Bulk electronics billing",    pdfLayout: "corporate", accentColor: "#1e40af" },
      { id: "elec-repair",   name: "Repair Invoice",      description: "Service/repair billing",      pdfLayout: "minimal",   accentColor: "#3b82f6" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 16. Restaurant & Food ────────────────────────────────────────────
  {
    id: "restaurant",
    label: "Restaurant & Food",
    emoji: "🍽️",
    description: "KOT-based food billing with table number, waiter, and cover details",
    accentColor: "#dc2626",
    gradientFrom: "#ef4444",
    gradientTo: "#991b1b",
    columns: ["sno", "itemName", "qty", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 5 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "tableNumber",  label: "Table Number",     type: "text",   group: "Restaurant" },
      { key: "waiterName",   label: "Waiter Name",      type: "text",   group: "Restaurant" },
      { key: "kotRef",       label: "KOT Reference",    type: "text",   group: "Restaurant" },
      { key: "covers",       label: "No. of Covers",    type: "number", group: "Restaurant" },
      { key: "orderType",    label: "Order Type",       type: "select", options: ["Dine-In", "Takeaway", "Delivery", "Online"], group: "Restaurant" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "RESTAURANT BILL",
      customerLabel: "Guest",
      itemTableTitle: "Food & Beverages",
      quantityLabel: "Qty",
      rateLabel: "Price",
    },
    templates: [
      { id: "rest-standard", name: "Restaurant Bill",   description: "Standard restaurant format",   pdfLayout: "modern",   accentColor: "#dc2626" },
      { id: "rest-cafe",     name: "Café Receipt",      description: "Café/bakery receipt style",    pdfLayout: "minimal",  accentColor: "#92400e" },
      { id: "rest-thermal",  name: "Thermal POS Bill",  description: "80mm thermal printer format",  pdfLayout: "thermal",  accentColor: "#111827" },
    ],
    defaultGSTRate: 5,
  },

  // ─── 17. Pharmacy ────────────────────────────────────────────────────
  {
    id: "pharmacy",
    label: "Pharmacy",
    emoji: "💊",
    description: "Medicine billing with batch number, expiry date, and GST tracking",
    accentColor: "#0891b2",
    gradientFrom: "#06b6d4",
    gradientTo: "#0e7490",
    columns: ["sno", "itemName", "batchNo", "expiryDate", "qty", "unit", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 12 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "prescriptionNo",  label: "Prescription No",   type: "text",   group: "Pharmacy" },
      { key: "doctorName",      label: "Doctor Name",       type: "text",   group: "Pharmacy" },
      { key: "drugLicenseNo",   label: "Drug License No",   type: "text",   group: "Pharmacy" },
      { key: "patientAge",      label: "Patient Age",       type: "text",   group: "Pharmacy" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "PHARMACY BILL",
      customerLabel: "Patient",
      itemTableTitle: "Medicines & Products",
      quantityLabel: "Qty",
      rateLabel: "MRP / Rate",
    },
    templates: [
      { id: "pha-standard",  name: "Pharmacy Bill",       description: "Standard medicine billing",    pdfLayout: "corporate", accentColor: "#0891b2" },
      { id: "pha-retail",    name: "Retail Pharmacy",     description: "OTC retail format",            pdfLayout: "modern",    accentColor: "#06b6d4" },
      { id: "pha-thermal",   name: "Thermal Bill",        description: "Thermal receipt format",       pdfLayout: "thermal",   accentColor: "#0e7490" },
    ],
    defaultGSTRate: 12,
  },

  // ─── 18. Textile & Garment ────────────────────────────────────────────
  {
    id: "textile",
    label: "Textile & Garment",
    emoji: "👗",
    description: "Fabric and garment billing with color, size, roll number, and variant tracking",
    accentColor: "#be185d",
    gradientFrom: "#ec4899",
    gradientTo: "#9d174d",
    columns: ["sno", "itemCode", "itemName", "color", "size", "qty", "unit", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 5 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "rollNumber",   label: "Roll Number",      type: "text",   group: "Textile" },
      { key: "fabricType",   label: "Fabric Type",      type: "text",   group: "Textile" },
      { key: "designCode",   label: "Design Code",      type: "text",   group: "Textile" },
      { key: "meters",       label: "Total Meters",     type: "number", group: "Textile" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "TEXTILE INVOICE",
      customerLabel: "Buyer",
      itemTableTitle: "Fabrics & Garments",
      quantityLabel: "Qty / Meters",
      rateLabel: "Rate/meter",
    },
    templates: [
      { id: "tex-garment",   name: "Garment Invoice",    description: "Ready-made garment billing",   pdfLayout: "modern",    accentColor: "#be185d" },
      { id: "tex-fabric",    name: "Fabric Invoice",     description: "Fabric roll billing format",   pdfLayout: "corporate", accentColor: "#9d174d" },
      { id: "tex-export",    name: "Textile Export",     description: "Export/wholesale format",      pdfLayout: "premium",   accentColor: "#ec4899" },
    ],
    defaultGSTRate: 5,
  },

  // ─── 19. Printing & Packaging ────────────────────────────────────────
  {
    id: "printing",
    label: "Printing & Packaging",
    emoji: "🖨️",
    description: "Print job billing with paper size, quantity, colors, and packaging materials",
    accentColor: "#7c3aed",
    gradientFrom: "#a855f7",
    gradientTo: "#6d28d9",
    columns: ["sno", "itemName", "description", "qty", "unit", "rate", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [
      { key: "jobNumber",     label: "Job Number",        type: "text",   group: "Print Job" },
      { key: "paperSize",     label: "Paper Size",        type: "text",   group: "Print Job", placeholder: "A4/A3/Custom" },
      { key: "colorType",     label: "Color / B&W",       type: "select", options: ["Full Color", "Black & White", "Spot Color"], group: "Print Job" },
      { key: "deliveryDate",  label: "Delivery Date",     type: "date",   group: "Print Job" },
      { key: "designRef",     label: "Design Reference",  type: "text",   group: "Print Job" },
    ],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "PRINT JOB INVOICE",
      customerLabel: "Client",
      itemTableTitle: "Print & Packaging Items",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "pr-standard", name: "Print Invoice",        description: "Standard print job billing",  pdfLayout: "modern",    accentColor: "#7c3aed" },
      { id: "pr-packaging",name: "Packaging Invoice",    description: "Packaging materials billing", pdfLayout: "industrial",accentColor: "#6d28d9" },
      { id: "pr-digital",  name: "Digital Print",        description: "Digital printing format",     pdfLayout: "premium",   accentColor: "#a855f7" },
    ],
    defaultGSTRate: 18,
  },

  // ─── 20. Custom Category ─────────────────────────────────────────────
  {
    id: "custom",
    label: "Custom Category",
    emoji: "⚙️",
    description: "Fully flexible — configure your own columns and fields",
    accentColor: "#4b5563",
    gradientFrom: "#6b7280",
    gradientTo: "#1f2937",
    columns: ["sno", "itemName", "description", "qty", "unit", "rate", "discount", "tax", "amount"],
    itemDefaults: { qty: 1, rate: 0, discount: 0, tax: 18 },
    extraItemFields: [],
    invoiceExtraFields: [],
    calculationMode: "standard",
    terminology: {
      invoiceTitle: "INVOICE",
      customerLabel: "Bill To",
      itemTableTitle: "Items / Services",
      quantityLabel: "Qty",
      rateLabel: "Rate",
    },
    templates: [
      { id: "cus-modern",    name: "Modern",            description: "Modern corporate layout",      pdfLayout: "modern",    accentColor: "#6366f1" },
      { id: "cus-corporate", name: "Corporate",         description: "Professional corporate style", pdfLayout: "corporate", accentColor: "#374151" },
      { id: "cus-premium",   name: "Premium",           description: "Luxury premium layout",        pdfLayout: "luxury",    accentColor: "#b45309" },
      { id: "cus-minimal",   name: "Minimal",           description: "Clean minimal format",         pdfLayout: "minimal",   accentColor: "#111827" },
      { id: "cus-government",name: "Government Format", description: "Official government style",    pdfLayout: "government",accentColor: "#1e40af" },
    ],
    defaultGSTRate: 18,
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getCategoryById(id: string): BusinessCategory | undefined {
  return BUSINESS_CATEGORIES.find((c) => c.id === id);
}

export function getColumnDef(key: ColumnKey): ColumnDef {
  return ALL_COLUMN_DEFS[key];
}
