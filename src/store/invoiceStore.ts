import { create } from "zustand";
import { db } from "../lib/db";
import { TaxMode } from "../types";
import type { InvoiceData, SavedInvoice, SavedClient, SavedProduct, SavedCompany, InvoiceItem, InvoiceTemplateConfig } from "../types";
import { calcTotals, generateInvoiceNumber, numberToWords } from "../pages/Invoice/components/calculation";
import { generateId } from "../utils/generateId";
import { loadPrefs, patchPrefs } from "../hooks/useLocalPrefs";
import { getCategoryById } from "../data/categorySchema";

type AppTab = "dashboard" | "invoices" | "editor" | "clients" | "products" | "profiles" | "settings";

interface InvoiceState {
  activeTab: AppTab;
  invoices: SavedInvoice[];
  clients: SavedClient[];
  products: SavedProduct[];
  companies: SavedCompany[];
  currentInvoice: InvoiceData;
  isLoading: boolean;
  errors: Record<string, string>;

  // Category & Template selection
  businessCategory: string;
  templateVariant: string;
  showCategorySelection: boolean;
  showTemplatePicker: boolean;

  // ─── UI Preferences (persisted to localStorage) ───────────────────────────
  sidebarCollapsed: boolean;
  previewVisible: boolean;
  openSections: string[];          // which accordion sections are open
  lastSavedAt: Date | null;
  isSaving: boolean;
  autosaveEnabled: boolean;
  setAutosaveEnabled: (enabled: boolean) => void;
  // ─────────────────────────────────────────────────────────────────────────

  // Navigation
  setActiveTab: (tab: AppTab) => void;

  // UI Prefs Actions
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleSection: (sectionId: string) => void;
  setSections: (sections: string[]) => void;

  // Data Loading
  loadAllData: () => Promise<void>;

  // Invoice Editing
  createNewInvoice: () => void;
  loadInvoice: (invoice: SavedInvoice) => void;
  updateInvoiceFields: (fields: Partial<InvoiceData>) => void;
  addInvoiceItem: (item?: Partial<InvoiceItem>) => void;
  updateInvoiceItem: (itemId: string, fields: Partial<InvoiceItem>) => void;
  removeInvoiceItem: (itemId: string) => void;
  reorderInvoiceItems: (items: InvoiceItem[]) => void;

  // Category & Template actions
  setCategoryAndTemplate: (category: string, templateId: string, accentColor: string) => void;
  openCategorySelection: () => void;
  closeCategorySelection: () => void;
  openTemplatePicker: () => void;
  closeTemplatePicker: () => void;
  updateIndustryField: (key: string, value: string | number) => void;

  // Invoice CRUD
  saveInvoice: () => Promise<string>;
  triggerAutosave: () => void;
  deleteInvoice: (id: string) => Promise<void>;

  // Client CRUD
  saveClient: (client: Omit<SavedClient, "id"> & { id?: string }) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Product CRUD
  saveProduct: (product: Omit<SavedProduct, "id"> & { id?: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Company Profile CRUD
  saveCompany: (company: Omit<SavedCompany, "id"> & { id?: string }) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  switchCompanyProfile: (companyId: string) => Promise<void>;
}

const DEFAULT_INVOICE_CONFIG = {
  branding: {
    primaryColor: "#6d28d9", // violet-700
    secondaryColor: "#4c1d95",
    fontFamily: "Sora",
    fontSize: 12,
    showSignature: true,
    showStamp: true,
  },
  layout: {
    headerPosition: "top" as const,
    footerPosition: "bottom" as const,
    tableLayout: "modern" as const,
    columnVisibility: {
      hsn: true,
      discount: true,
      tax: true,
      description: true,
      weights: false,
      labour: false,
    },
    pageMargins: 15,
  },
  sections: {
    customerInfo: true,
    shippingInfo: true,
    gstDetails: true,
    paymentTerms: true,
    bankDetails: true,
    qrCode: true,
    notes: true,
    terms: true,
    signatureBlock: true,
  }
};

const getNewBlankInvoice = (): InvoiceData => {
  return {
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyGST: "",
    companyLogo: "",
    city: "",
    state: "",
    pincode: "",
    instagramHandle: "",
    
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientGST: "",
    clientShippingAddress: "",
    
    invoiceNumber: generateInvoiceNumber(),
    billNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "INR",
    currencySymbol: "₹",
    paymentTerms: "Net 30",
    paymentDetails: "",
    poNumber: "",
    referenceNumber: "",
    hsnCode: "",
    hallmarkId: "",
    
    items: [
      {
        id: generateId(),
        name: "",
        description: "",
        quantity: 1,
        rate: 0,
        tax: 0,
        discount: 0,
        hsn: "",
        grossWeight: 0,
        netWeight: 0,
        labour: 0,
        amount: 0,
      }
    ],
    
    taxableAmount: 0,
    cgstRate: 1.5,
    cgstAmount: 0,
    sgstRate: 1.5,
    sgstAmount: 0,
    igstRate: 0,
    igstAmount: 0,
    totalTax: 0,
    grossTotal: 0,
    invoiceDiscountPercent: 0,
    invoiceDiscountAmount: 0,
    shippingCharges: 0,
    additionalCharges: 0,
    grandTotalBeforeRoundOff: 0,
    roundOff: 0,
    grandTotal: 0,
    oldPurchaseAmount: 0,
    dueAmount: 0,
    amountInWords: "Rupees Zero Only",
    notes: "",
    terms: "Payment is due within the specified payment terms. Late payments may incur additional charges.",
    templateId: "default",
    templateCategory: "modern",
    templateConfig: DEFAULT_INVOICE_CONFIG,
    taxMode: TaxMode.INVOICE,
  };
};

export const useInvoiceStore = create<InvoiceState>((set, get) => {
  // Helper to recalculate current invoice totals
  const recalculateCurrentInvoice = (invoice: InvoiceData): InvoiceData => {
    // Determine CGST, SGST, and IGST rates automatically if currency is INR
    let cgstRate = invoice.cgstRate;
    let sgstRate = invoice.sgstRate;
    let igstRate = invoice.igstRate;

    if (invoice.taxMode === "item") {
      cgstRate = 0;
      sgstRate = 0;
      igstRate = 0;
    } else if (invoice.currency === "INR") {
      const compGST = (invoice.companyGST || "").trim();
      const clientGST = (invoice.clientGST || "").trim();
      
      let isInterstate = false;
      let matchedByGSTIN = false;

      // 1. Try checking GSTIN state codes first
      if (compGST.length >= 2 && clientGST.length >= 2) {
        const compStateCode = compGST.slice(0, 2);
        const clientStateCode = clientGST.slice(0, 2);
        
        if (/^\d+$/.test(compStateCode) && /^\d+$/.test(clientStateCode)) {
          isInterstate = compStateCode !== clientStateCode;
          matchedByGSTIN = true;
        }
      }

      // 2. Fallback to address/state comparison if GSTIN didn't resolve
      if (!matchedByGSTIN && invoice.state) {
        const compState = invoice.state.trim().toLowerCase();
        const clientAddr = (invoice.clientAddress || "").toLowerCase();
        const clientShip = (invoice.clientShippingAddress || "").toLowerCase();

        // If client address is filled but does not contain the company's state,
        // we assume it is interstate (IGST)
        if (clientAddr && !clientAddr.includes(compState) && !clientShip.includes(compState)) {
          isInterstate = true;
        }
      }

      // 3. Find the maximum tax rate set on item lines to determine overall GST rate
      const maxItemTaxRate = invoice.items.reduce((max, item) => {
        const r = Number(item.tax) || 0;
        return r > max ? r : max;
      }, 0);

      // Default jewelry tax is 3%, default services/retail is 18%. Let's default based on max rate or template category.
      let baseGSTRate = maxItemTaxRate > 0 ? maxItemTaxRate : 3.0;
      if (maxItemTaxRate === 0 && invoice.templateCategory !== "jewelry") {
        baseGSTRate = 18.0; // Corporate/retail standard default
      }

      if (isInterstate) {
        igstRate = baseGSTRate;
        cgstRate = 0;
        sgstRate = 0;
      } else {
        igstRate = 0;
        cgstRate = baseGSTRate / 2;
        sgstRate = baseGSTRate / 2;
      }
    }

    const computed = calcTotals(
      invoice.items,
      invoice.invoiceDiscountPercent || 0,
      invoice.shippingCharges || 0,
      invoice.additionalCharges || 0,
      cgstRate,
      sgstRate,
      igstRate,
      invoice.taxMode || "invoice"
    );

    const oldPurchase = Number(invoice.oldPurchaseAmount) || 0;
    const dueAmount = computed.grandTotal - oldPurchase;
    const words = numberToWords(computed.grandTotal, invoice.currency);

    // Map calculated items amounts back to item list
    const updatedItems = invoice.items.map((item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.quantity) || 0;
      const netW = Number(item.netWeight) || 0;
      const labour = Number(item.makingCharge) || Number(item.labour) || 0;
      let amount = 0;
      
      if (netW > 0 || labour > 0) {
        amount = (netW || qty) * rate + labour;
      } else {
        amount = qty * rate;
      }
      // Apply discount
      const itemDisc = Number(item.discount) || 0;
      amount = amount - amount * (itemDisc / 100);
      
      // Compute item-level tax if in item mode
      const taxRate = invoice.taxMode === "item" ? (Number(item.tax) || 0) : 0;
      const taxAmt = Math.round((amount * (taxRate / 100) + Number.EPSILON) * 100) / 100;
      
      return {
        ...item,
        amount: Number(amount.toFixed(2)),
        taxAmt,
      };
    });

    return {
      ...invoice,
      cgstRate,
      sgstRate,
      igstRate,
      items: updatedItems,
      taxableAmount: computed.taxableAmount,
      cgstAmount: computed.cgstAmount,
      sgstAmount: computed.sgstAmount,
      igstAmount: computed.igstAmount,
      totalTax: computed.totalTax,
      grossTotal: computed.grossTotal,
      grandTotalBeforeRoundOff: computed.grandTotalBeforeRoundOff,
      roundOff: computed.roundOff,
      grandTotal: computed.grandTotal,
      dueAmount,
      amountInWords: words,
    };
  };

  // ─── Autosave timer ──────────────────────────────────────────────────────────
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
 
  const scheduleAutosave = () => {
    if (!get().autosaveEnabled) return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(async () => {
      const state = get();
      if (!state.currentInvoice.invoiceNumber) return;
      try {
        await get().saveInvoice();
      } catch (_) {
        // error handling is managed inside saveInvoice
      }
    }, 700);
  };

  // ─── Load persisted prefs ────────────────────────────────────────────────────
  const prefs = loadPrefs();

  return {
    activeTab: (prefs.activeTab as AppTab) || "dashboard",
    invoices: [],
    clients: [],
    products: [],
    companies: [],
    currentInvoice: getNewBlankInvoice(),
    isLoading: false,
    errors: {},

    // Category & Template initial state
    businessCategory: "retail",
    templateVariant: "retail-modern",
    showCategorySelection: false,
    showTemplatePicker: false,

    // UI Preferences (restored from localStorage)
    sidebarCollapsed: prefs.sidebarCollapsed ?? false,
    previewVisible: prefs.previewVisible ?? true,
    openSections: prefs.openSections ?? ["business", "customer", "invoice", "items"],
    lastSavedAt: null,
    isSaving: false,
    autosaveEnabled: prefs.autosaveEnabled ?? false,
 
    setAutosaveEnabled: (enabled) => {
      set({ autosaveEnabled: enabled });
      patchPrefs({ autosaveEnabled: enabled });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
      patchPrefs({ activeTab: tab });
    },

    // ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    toggleSidebar: () => set((s) => {
      const next = !s.sidebarCollapsed;
      patchPrefs({ sidebarCollapsed: next });
      return { sidebarCollapsed: next };
    }),

    togglePreview: () => set((s) => {
      const next = !s.previewVisible;
      patchPrefs({ previewVisible: next });
      return { previewVisible: next };
    }),

    toggleSection: (sectionId) => set((s) => {
      const isOpen = s.openSections.includes(sectionId);
      const next = isOpen
        ? s.openSections.filter((id) => id !== sectionId)
        : [...s.openSections, sectionId];
      patchPrefs({ openSections: next });
      return { openSections: next };
    }),

    setSections: (sections) => {
      patchPrefs({ openSections: sections });
      set({ openSections: sections });
    },

    triggerAutosave: scheduleAutosave,

    loadAllData: async () => {
      set({ isLoading: true });
      try {
        const invoices = await db.invoices.toArray();
        const clients = await db.clients.toArray();
        const products = await db.products.toArray();
        const companies = await db.companies.toArray();

        // Sort invoices by date / savedAt descending
        invoices.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

        // Check if there is a default company profile, and if so, preload it into a blank invoice if current is clean
        let defaultCompany = companies.find(c => c.isDefault);
        if (!defaultCompany && companies.length > 0) {
          defaultCompany = companies[0];
        }

        set((state) => {
          let current = state.currentInvoice;
          // Preload default company if no company fields are filled yet
          if (defaultCompany && !current.companyName) {
            current = {
              ...current,
              companyName: defaultCompany.name || "",
              companyEmail: defaultCompany.email || "",
              companyPhone: defaultCompany.phone || "",
              companyAddress: defaultCompany.address || "",
              companyGST: defaultCompany.gst || "",
              companyLogo: defaultCompany.logo || "",
              city: defaultCompany.city || "",
              state: defaultCompany.state || "",
              pincode: defaultCompany.pincode || "",
              instagramHandle: defaultCompany.instagramHandle || "",
              paymentDetails: defaultCompany.bankName 
                ? `Bank: ${defaultCompany.bankName}\nBranch: ${defaultCompany.bankBranch || ""}\nA/C: ${defaultCompany.accountNumber || ""}\nIFSC: ${defaultCompany.ifscCode || ""}`
                : "",
              upiId: defaultCompany.upiId || "",
              terms: defaultCompany.terms || current.terms,
            };
            current = recalculateCurrentInvoice(current);
          }
          
          return {
            invoices,
            clients,
            products,
            companies,
            currentInvoice: current,
            isLoading: false,
          };
        });
      } catch (err) {
        console.error("Error loading Dexie data:", err);
        set({ isLoading: false });
      }
    },

    createNewInvoice: () => {
      set((state) => {
        let blank = getNewBlankInvoice();

        // Auto load default company profile if available
        let defaultCompany = state.companies.find(c => c.isDefault);
        if (!defaultCompany && state.companies.length > 0) {
          defaultCompany = state.companies[0];
        }

        if (defaultCompany) {
          blank = {
            ...blank,
            companyName: defaultCompany.name || "",
            companyEmail: defaultCompany.email || "",
            companyPhone: defaultCompany.phone || "",
            companyAddress: defaultCompany.address || "",
            companyGST: defaultCompany.gst || "",
            companyLogo: defaultCompany.logo || "",
            city: defaultCompany.city || "",
            state: defaultCompany.state || "",
            pincode: defaultCompany.pincode || "",
            instagramHandle: defaultCompany.instagramHandle || "",
            paymentDetails: defaultCompany.bankName
              ? `Bank: ${defaultCompany.bankName}\nBranch: ${defaultCompany.bankBranch || ""}\nA/C: ${defaultCompany.accountNumber || ""}\nIFSC: ${defaultCompany.ifscCode || ""}`
              : "",
            upiId: defaultCompany.upiId || "",
            terms: defaultCompany.terms || blank.terms,
          };
        }

        return {
          currentInvoice: recalculateCurrentInvoice(blank),
          // Open category selection modal first so the user picks their business type
          showCategorySelection: true,
          showTemplatePicker: false,
          errors: {},
          lastSavedAt: null,
        };
      });
    },

    setCategoryAndTemplate: (category, templateId, accentColor) => {
      set((s) => {
        const catDef = getCategoryById(category);
        const defaultTaxMode = (catDef ? catDef.taxMode : TaxMode.INVOICE) as TaxMode;
        const defaultGSTRate = catDef ? catDef.defaultGSTRate : 18;

        const defaultItem = {
          id: generateId(),
          name: "",
          description: "",
          quantity: 1,
          rate: 0,
          tax: defaultGSTRate,
          discount: 0,
          hsn: "",
          amount: 0,
        };
        const updated = {
          ...s.currentInvoice,
          businessCategory: category,
          templateVariant: templateId,
          templateCategory: category,
          taxMode: defaultTaxMode,
          industryFields: {},
          items: [defaultItem],
          templateConfig: s.currentInvoice.templateConfig
            ? {
                ...s.currentInvoice.templateConfig,
                branding: {
                  ...s.currentInvoice.templateConfig.branding,
                  primaryColor: accentColor,
                },
              }
            : undefined,
        };
        return {
          businessCategory: category,
          templateVariant: templateId,
          showTemplatePicker: false,
          showCategorySelection: false,
          activeTab: "editor" as const,
          currentInvoice: recalculateCurrentInvoice(updated),
          errors: {},
        };
      });
    },

    openCategorySelection: () => set({ showCategorySelection: true, showTemplatePicker: false }),
    closeCategorySelection: () => set({ showCategorySelection: false }),
    openTemplatePicker: () => set({ showTemplatePicker: true }),
    closeTemplatePicker: () => set({ showTemplatePicker: false }),

    updateIndustryField: (key, value) => {
      set((s) => {
        const updated = {
          ...s.currentInvoice,
          industryFields: { ...(s.currentInvoice.industryFields || {}), [key]: value },
        };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: s.autosaveEnabled ? s.lastSavedAt : null,
        };
      });
    },

    loadInvoice: (savedInvoice) => {
      set({
        currentInvoice: recalculateCurrentInvoice(savedInvoice),
        activeTab: "editor",
        errors: {},
        lastSavedAt: savedInvoice.savedAt ? new Date(savedInvoice.savedAt) : null,
      });
    },

    updateInvoiceFields: (fields) => {
      set((state) => {
        const updated = { ...state.currentInvoice, ...fields };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: state.autosaveEnabled ? state.lastSavedAt : null,
        };
      });
      scheduleAutosave();
    },

    addInvoiceItem: (itemFields = {}) => {
      set((state) => {
        const newItem: InvoiceItem = {
          id: generateId(),
          name: "",
          description: "",
          quantity: 1,
          rate: 0,
          tax: 0,
          discount: 0,
          hsn: "",
          grossWeight: 0,
          netWeight: 0,
          labour: 0,
          amount: 0,
          ...itemFields,
        };
        const updated = {
          ...state.currentInvoice,
          items: [...state.currentInvoice.items, newItem],
        };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: state.autosaveEnabled ? state.lastSavedAt : null,
        };
      });
    },

    updateInvoiceItem: (itemId, fields) => {
      set((state) => {
        const updatedItems = state.currentInvoice.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, ...fields };
          }
          return item;
        });
        const updated = { ...state.currentInvoice, items: updatedItems };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: state.autosaveEnabled ? state.lastSavedAt : null,
        };
      });
      scheduleAutosave();
    },

    removeInvoiceItem: (itemId) => {
      set((state) => {
        const updatedItems = state.currentInvoice.items.filter((item) => item.id !== itemId);
        // Ensure at least one item remains
        if (updatedItems.length === 0) {
          updatedItems.push({
            id: generateId(),
            name: "",
            description: "",
            quantity: 1,
            rate: 0,
            tax: 0,
            discount: 0,
            hsn: "",
            grossWeight: 0,
            netWeight: 0,
            labour: 0,
            amount: 0,
          });
        }
        const updated = { ...state.currentInvoice, items: updatedItems };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: state.autosaveEnabled ? state.lastSavedAt : null,
        };
      });
    },

    reorderInvoiceItems: (items) => {
      set((state) => {
        const updated = { ...state.currentInvoice, items };
        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
          lastSavedAt: state.autosaveEnabled ? state.lastSavedAt : null,
        };
      });
    },

    saveInvoice: async () => {
      const state = get();
      const current = state.currentInvoice;
      
      // Simple validation
      const errors: Record<string, string> = {};
      if (!current.invoiceNumber) errors.invoiceNumber = "Invoice Number is required";
      if (!current.invoiceDate) errors.invoiceDate = "Invoice Date is required";
      if (!current.clientName) errors.clientName = "Client Name is required";
      if (current.items.some(i => !i.name)) errors.items = "All items must have a name";
      
      if (Object.keys(errors).length > 0) {
        set({ errors });
        throw new Error("Validation failed");
      }

      set({ isSaving: true });
      try {
        // Check if we already have this invoice in DB to preserve its database ID, or generate one
        let existingId = (current as unknown as SavedInvoice).id;
        // Search by invoiceNumber if id is undefined or default
        if (!existingId || existingId === "CURRENT") {
          const matched = state.invoices.find(i => i.invoiceNumber === current.invoiceNumber);
          existingId = matched ? matched.id : generateId();
        }

        const saveRecord: SavedInvoice = {
          ...current,
          id: existingId,
          savedAt: new Date().toISOString(),
        };

        await db.invoices.put(saveRecord);
        
        // Also automatically save the client details and product details if they are new or modified!
        if (current.clientName) {
          const clientMatch = state.clients.find(
            c => c.name.toLowerCase() === current.clientName.toLowerCase()
          );
          if (!clientMatch) {
            await state.saveClient({
              name: current.clientName,
              company: current.clientCompany,
              email: current.clientEmail,
              phone: current.clientPhone,
              address: current.clientAddress,
              gstNumber: current.clientGST,
              shippingAddress: current.clientShippingAddress,
            });
          }
        }

        // Save new products automatically
        for (const item of current.items) {
          if (item.name) {
            const productMatch = state.products.find(
              p => p.name.toLowerCase() === item.name.toLowerCase()
            );
            if (!productMatch) {
              await state.saveProduct({
                name: item.name,
                rate: item.rate,
                tax: item.tax,
                description: item.description,
                hsn: item.hsn,
              });
            }
          }
        }

        // Refresh list
        await state.loadAllData();
        
        // Clean draft
        localStorage.removeItem("jemsky-invoice-draft-v2");

        set({ isSaving: false, lastSavedAt: new Date() });
        return existingId;
      } catch (err) {
        set({ isSaving: false });
        throw err;
      }
    },

    deleteInvoice: async (id) => {
      await db.invoices.delete(id);
      await get().loadAllData();
    },

    saveClient: async (clientData) => {
      const id = clientData.id || generateId();
      const clientRecord: SavedClient = {
        ...clientData,
        id,
      };
      await db.clients.put(clientRecord);
      await get().loadAllData();
    },

    deleteClient: async (id) => {
      await db.clients.delete(id);
      await get().loadAllData();
    },

    saveProduct: async (productData) => {
      const id = productData.id || generateId();
      const productRecord: SavedProduct = {
        ...productData,
        id,
      };
      await db.products.put(productRecord);
      await get().loadAllData();
    },

    deleteProduct: async (id) => {
      await db.products.delete(id);
      await get().loadAllData();
    },

    saveCompany: async (companyData) => {
      const id = companyData.id || generateId();
      
      // If setting this one as default, unset others first
      if (companyData.isDefault) {
        const companies = await db.companies.toArray();
        for (const c of companies) {
          if (c.id !== id && c.isDefault) {
            c.isDefault = false;
            await db.companies.put(c);
          }
        }
      }

      const companyRecord: SavedCompany = {
        ...companyData,
        id,
      };
      await db.companies.put(companyRecord);
      await get().loadAllData();
    },

    deleteCompany: async (id) => {
      await db.companies.delete(id);
      await get().loadAllData();
    },

    switchCompanyProfile: async (companyId) => {
      const company = await db.companies.get(companyId);
      if (!company) return;

      set((state) => {
        const updated = {
          ...state.currentInvoice,
          companyName: company.name || "",
          companyEmail: company.email || "",
          companyPhone: company.phone || "",
          companyAddress: company.address || "",
          companyGST: company.gst || "",
          companyLogo: company.logo || "",
          city: company.city || "",
          state: company.state || "",
          pincode: company.pincode || "",
          instagramHandle: company.instagramHandle || "",
          paymentDetails: company.bankName 
            ? `Bank: ${company.bankName}\nBranch: ${company.bankBranch || ""}\nA/C: ${company.accountNumber || ""}\nIFSC: ${company.ifscCode || ""}`
            : "",
          upiId: company.upiId || "",
          terms: company.terms || state.currentInvoice.terms,
        };

        localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(updated));
        return {
          currentInvoice: recalculateCurrentInvoice(updated),
        };
      });
    },
  };
});
