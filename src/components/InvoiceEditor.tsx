import React, { useState, useCallback } from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  Building2,
  User,
  Hash,
  Receipt,
  Settings,
  Plus,
  Trash2,
  Save,
  Download,
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  Loader2,
  Clock,
  CreditCard,
  FileText,
  StickyNote,
  Palette,
} from "lucide-react";
import { db } from "../lib/db";
import type { SavedClient, SavedProduct, InvoiceItem } from "../types";
import { CURRENCIES, PAYMENT_TERMS } from "../pages/Invoice/components/constants";
import { inputCls, SectionHeader, Field } from "../pages/Invoice/components/ui";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { getCategoryColumns, getCategoryExtraFields, getCategoryTerminology } from "../engine/columnEngine";
import { BUSINESS_CATEGORIES } from "../data/categorySchema";

interface InvoiceEditorProps {
  isDark: boolean;
}

// ─── Accordion Section Definition ──────────────────────────────────────────
const SECTIONS = [
  { id: "business",  label: "Business Info",   icon: Building2  },
  { id: "customer",  label: "Customer Info",   icon: User       },
  { id: "invoice",   label: "Invoice Details", icon: Hash       },
  { id: "items",     label: "Line Items",      icon: Layers     },
  { id: "charges",   label: "Charges",         icon: Receipt    },
  { id: "payment",   label: "Payment",         icon: CreditCard },
  { id: "notes",     label: "Notes & Terms",   icon: StickyNote },
  { id: "design",    label: "Design",          icon: Palette    },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ isDark }) => {
  const {
    currentInvoice,
    updateInvoiceFields,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    saveInvoice,
    companies,
    clients,
    products,
    errors,
    updateIndustryField,
    openCategorySelection,
    openSections,
    toggleSection,
    lastSavedAt,
    isSaving,
  } = useInvoiceStore();

  const [clientSearch, setClientSearch] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState<SavedClient[]>([]);
  const [productSearch, setProductSearch] = useState<Record<string, string>>({});
  const [productSuggestions, setProductSuggestions] = useState<Record<string, SavedProduct[]>>({});
  const [toastMsg, setToastMsg] = useState("");

  const sym = currentInvoice.currencySymbol;

  // Helper: is a section open?
  const isOpen = useCallback((id: SectionId) => openSections.includes(id), [openSections]);

  
  // ─── Dynamic industry engine ────────────────────────────────────────────
  const categoryId = currentInvoice.businessCategory || currentInvoice.templateCategory || "retail";
  const categoryColumns = getCategoryColumns(categoryId);
  const extraInvoiceFields = getCategoryExtraFields(categoryId);
  const terminology = getCategoryTerminology(categoryId);
  const currentCatDef = BUSINESS_CATEGORIES.find((c) => c.id === categoryId);
  // ──────────────────────────────────────────────────────────────────────────

  // Search clients as user types clientName
  const handleClientSearch = (val: string) => {
    setClientSearch(val);
    updateInvoiceFields({ clientName: val });

    if (!val.trim()) {
      setClientSuggestions([]);
      return;
    }

    const matched = clients.filter(c =>
      c.name.toLowerCase().includes(val.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(val.toLowerCase())
    );
    setClientSuggestions(matched.slice(0, 5));
  };

  const handleSelectClient = (c: SavedClient) => {
    updateInvoiceFields({
      clientName: c.name,
      clientCompany: c.company || "",
      clientEmail: c.email || "",
      clientPhone: c.phone || "",
      clientAddress: c.address || "",
      clientGST: c.gstNumber || "",
      clientShippingAddress: c.shippingAddress || "",
    });
    setClientSuggestions([]);
    setClientSearch("");
  };

  // Search products for line items
  const handleProductSearch = (val: string, itemId: string) => {
    setProductSearch(prev => ({ ...prev, [itemId]: val }));
    updateInvoiceItem(itemId, { name: val });

    if (!val.trim()) {
      setProductSuggestions(prev => ({ ...prev, [itemId]: [] }));
      return;
    }

    const matched = products.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase())
    );
    setProductSuggestions(prev => ({ ...prev, [itemId]: matched.slice(0, 5) }));
  };

  const handleSelectProduct = (p: SavedProduct, itemId: string) => {
    updateInvoiceItem(itemId, {
      name: p.name,
      rate: Number(p.rate) || 0,
      tax: Number(p.tax) || 0,
      description: p.description || "",
      hsn: p.hsn || "",
    });
    setProductSuggestions(prev => ({ ...prev, [itemId]: [] }));
    setProductSearch(prev => ({ ...prev, [itemId]: "" }));
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSaveInvoice = async () => {
    try {
      const savedId = await saveInvoice();
      triggerToast("Invoice Saved Successfully Offline!");
    } catch (err) {
      triggerToast("Failed to save. Check required fields.");
    }
  };

  const inputBgCls = inputCls(isDark);

  // ─── Format last-saved time ─────────────────────────────────────────────
  const savedAtStr = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  // ─── Accordion toggle header ────────────────────────────────────────────
  const AccordionHeader = ({ id, label, icon: Icon }: { id: SectionId; label: string; icon: React.ElementType }) => {
    const open = isOpen(id);
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-xs ${
          open
            ? isDark ? "bg-violet-600/15 text-violet-400" : "bg-violet-50 text-violet-700"
            : isDark ? "bg-white/3 text-white/55 hover:bg-white/6 hover:text-white" : "bg-black/3 text-black/50 hover:bg-black/5"
        }`}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">

      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <div className={`shrink-0 flex items-center justify-between px-4 py-3 border-b ${
        isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5"
      }`}>
        <div>
          <p className={`font-black text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
            Invoice Builder
          </p>
          <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>
            {currentInvoice.invoiceNumber || "New Invoice"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSaveInvoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={() => generateInvoicePDF(currentInvoice)}
            title="Download PDF"
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? "border-white/10 hover:bg-white/5 text-white/70" : "border-black/10 hover:bg-black/5 text-black/60"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Form Content Area (Accordion) ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {errors.items && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            <span>{errors.items}</span>
          </div>
        )}

        {/* ── SECTION: Business Info ────────────────────────────────────────── */}
        <AccordionHeader id="business" label="Business Info" icon={Building2} />
        <div className={`accordion-wrapper ${isOpen("business") ? "open mt-2 mb-4" : ""}`}>
          <div className="accordion-content space-y-6 px-1 pb-4">
            {/* Company Branch Profile selector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Your Business Profile (Choose branch)
                </label>
                <select
                  value={companies.find(c => c.name === currentInvoice.companyName)?.id || ""}
                  onChange={(e) => {
                    const cStore = useInvoiceStore.getState();
                    if (e.target.value) cStore.switchCompanyProfile(e.target.value);
                  }}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none cursor-pointer ${inputBgCls}`}
                >
                  <option value="">-- Choose Profile --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.isDefault ? "(Default)" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Meta details */}
              <div className="col-span-2">
                <SectionHeader icon={Hash} label="Invoice Details" isDark={isDark} compact />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={currentInvoice.invoiceNumber || ""}
                  onChange={(e) => updateInvoiceFields({ invoiceNumber: e.target.value })}
                  className={inputBgCls}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  P.O. Reference / Job No
                </label>
                <input
                  type="text"
                  value={currentInvoice.poNumber || ""}
                  onChange={(e) => updateInvoiceFields({ poNumber: e.target.value })}
                  className={inputBgCls}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  required
                  value={currentInvoice.invoiceDate || ""}
                  onChange={(e) => updateInvoiceFields({ invoiceDate: e.target.value })}
                  className={inputBgCls}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={currentInvoice.dueDate || ""}
                  onChange={(e) => updateInvoiceFields({ dueDate: e.target.value })}
                  className={inputBgCls}
                />
              </div>

              {/* Customer Selector & Details */}
              <div className="col-span-2 pt-2">
                <SectionHeader icon={User} label="Customer Details" isDark={isDark} compact />
              </div>

              <div className="col-span-2 relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Customer Name * (Type to search database)
                </label>
                <input
                  type="text"
                  required
                  value={currentInvoice.clientName || ""}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  className={inputBgCls}
                  autoComplete="off"
                />
                
                {clientSuggestions.length > 0 && (
                  <div className={`absolute z-30 left-0 right-0 top-full mt-1 border rounded-xl overflow-hidden shadow-2xl ${
                    isDark ? "bg-[#161618] border-white/10" : "bg-white border-black/8"
                  }`}>
                    {clientSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-violet-500/10 transition-colors flex justify-between items-center`}
                      >
                        <span className="font-semibold text-gray-800 dark:text-white">{c.name}</span>
                        {c.company && <span className="text-[10px] text-gray-400">{c.company}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={currentInvoice.clientCompany || ""}
                  onChange={(e) => updateInvoiceFields({ clientCompany: e.target.value })}
                  className={inputBgCls}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Customer GSTIN
                </label>
                <input
                  type="text"
                  value={currentInvoice.clientGST || ""}
                  onChange={(e) => updateInvoiceFields({ clientGST: e.target.value.toUpperCase() })}
                  className={inputBgCls}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={currentInvoice.clientEmail || ""}
                  onChange={(e) => updateInvoiceFields({ clientEmail: e.target.value })}
                  className={inputBgCls}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={currentInvoice.clientPhone || ""}
                  onChange={(e) => updateInvoiceFields({ clientPhone: e.target.value })}
                  className={inputBgCls}
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  value={currentInvoice.clientAddress || ""}
                  onChange={(e) => updateInvoiceFields({ clientAddress: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Shipping Address (for manufacturing/wholesale shipping)
                </label>
                <textarea
                  rows={2}
                  value={currentInvoice.clientShippingAddress || ""}
                  onChange={(e) => updateInvoiceFields({ clientShippingAddress: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION: Invoice Details ───────────────────────────────────────── */}
        <AccordionHeader id="invoice" label="Invoice Details" icon={Hash} />
        <div className={`accordion-wrapper ${isOpen("invoice") ? "open mt-2 mb-4" : ""}`}>
          <div className="accordion-content space-y-4 px-1 pb-4">
            {/* ─── Industry-Specific Invoice Fields ─────────────────────── */}
            {extraInvoiceFields.length > 0 && (
              <div className="mt-6 space-y-4">
                <SectionHeader icon={Layers} label={`${currentCatDef?.label || ''} Details`} isDark={isDark} compact />
                <div className="grid grid-cols-2 gap-4">
                  {extraInvoiceFields.map((field) => {
                    const val = currentInvoice.industryFields?.[field.key] ?? "";
                    const isWide = field.type === "textarea";
                    return (
                      <div key={field.key} className={isWide ? "col-span-2" : "col-span-1"}>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={String(val)}
                            onChange={(e) => updateIndustryField(field.key, e.target.value)}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none cursor-pointer ${inputBgCls}`}
                          >
                            <option value="">Select…</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            rows={2}
                            placeholder={field.placeholder || field.label}
                            value={String(val)}
                            onChange={(e) => updateIndustryField(field.key, e.target.value)}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none resize-none ${inputBgCls}`}
                          />
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder || field.label}
                            value={String(val)}
                            onChange={(e) =>
                              updateIndustryField(
                                field.key,
                                field.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value
                              )
                            }
                            className={inputBgCls}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION: Line Items ───────────────────────────────────────────── */}
        <AccordionHeader id="items" label={terminology.itemTableTitle || "Line Items"} icon={Layers} />
        <div className={`accordion-wrapper ${isOpen("items") ? "open mt-2 mb-4" : ""}`}>
          <div className="accordion-content space-y-4 px-1 pb-4">
            {/* Dynamic Items Table */}
            <div className="space-y-4">
              {currentInvoice.items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border relative space-y-3.5 ${
                    isDark ? "bg-[#1a1a1d] border-white/5" : "bg-gray-50/50 border-black/5"
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeInvoiceItem(item.id)}
                    className="absolute right-3 top-3 p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <p className="font-bold text-violet-500">Item #{idx + 1}</p>

                  <div className="grid grid-cols-6 gap-3">
                    {/* Dynamic columns driven by categorySchema + columnEngine */}
                    {categoryColumns
                      .filter((col) => col.key !== "sno" && col.key !== "amount")
                      .map((col) => {
                        const isNameCol = col.key === "itemName" || col.key === "treatment" || col.key === "workItem";
                        const isWideCol = ["description", "route", "workerType", "farmDetails"].includes(col.key);
                        const colSpan = isNameCol || isWideCol ? "col-span-6 sm:col-span-3" : "col-span-3 sm:col-span-2";
                        const fieldKey = col.itemField as keyof InvoiceItem | null;
                        const fieldValue = fieldKey ? (item[fieldKey] ?? "") : "";

                        if (isNameCol) {
                          return (
                            <div key={col.key} className={`${colSpan} relative`}>
                              <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">
                                {col.label} *
                              </label>
                              <input
                                type="text"
                                required
                                value={item.name || ""}
                                onChange={(e) => handleProductSearch(e.target.value, item.id)}
                                className={inputBgCls}
                                autoComplete="off"
                                placeholder={col.placeholder || col.label}
                              />
                              {productSuggestions[item.id] && productSuggestions[item.id].length > 0 && (
                                <div className={`absolute z-30 left-0 right-0 top-full mt-1 border rounded-xl overflow-hidden shadow-2xl ${
                                  isDark ? "bg-[#161618] border-white/10" : "bg-white border-black/8"
                                }`}>
                                  {productSuggestions[item.id].map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => handleSelectProduct(p, item.id)}
                                      className="w-full text-left px-4 py-2 hover:bg-violet-500/10 transition-colors flex justify-between items-center"
                                    >
                                      <span className="font-semibold text-gray-800 dark:text-white">{p.name}</span>
                                      <span className="text-[10px] text-gray-400">{sym}{p.rate}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={col.key} className={colSpan}>
                            <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">
                              {col.label}
                            </label>
                            {col.type === "date" ? (
                              <input
                                type="date"
                                value={fieldKey ? String(item[fieldKey] || "") : ""}
                                onChange={(e) =>
                                  fieldKey && updateInvoiceItem(item.id, { [fieldKey]: e.target.value })
                                }
                                className={inputBgCls}
                              />
                            ) : col.type === "number" ? (
                              <input
                                type="number"
                                step={col.step || 0.01}
                                min={0}
                                value={fieldKey ? (item[fieldKey] === "" ? "" : Number(item[fieldKey]) || 0) : 0}
                                onChange={(e) =>
                                  fieldKey &&
                                  updateInvoiceItem(item.id, {
                                    [fieldKey]: e.target.value === "" ? "" : Number(e.target.value),
                                  })
                                }
                                className={inputBgCls}
                              />
                            ) : (
                              <input
                                type="text"
                                placeholder={col.placeholder || col.label}
                                value={fieldKey ? String(item[fieldKey] || "") : ""}
                                onChange={(e) =>
                                  fieldKey && updateInvoiceItem(item.id, { [fieldKey]: e.target.value })
                                }
                                className={inputBgCls}
                              />
                            )}
                          </div>
                        );
                      })
                    }

                    {/* HSN always shown (hidden for freelancer/labor but useful) */}
                    {!categoryColumns.find(c => c.key === "hsn") && (
                      <div className="col-span-3 sm:col-span-2">
                        <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">HSN/SAC</label>
                        <input
                          type="text"
                          value={item.hsn || ""}
                          onChange={(e) => updateInvoiceItem(item.id, { hsn: e.target.value })}
                          className={inputBgCls}
                        />
                      </div>
                    )}

                    {/* Description — always show as last field if not already in columns */}
                    {!categoryColumns.find(c => c.key === "description") && (
                      <div className="col-span-6">
                        <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="Additional details…"
                          value={item.description || ""}
                          onChange={(e) => updateInvoiceItem(item.id, { description: e.target.value })}
                          className={inputBgCls}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addInvoiceItem()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-violet-500/50 hover:text-violet-500 transition-colors font-bold uppercase tracking-wider text-[10px]"
              >
                <Plus className="w-4 h-4" />
                Add Item Line
              </button>
            </div>

            {/* Financial Addons */}
            <div className="border-t border-gray-100 dark:border-white/5 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500">Invoice Level Adjustments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Overall Invoice Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentInvoice.invoiceDiscountPercent || 0}
                    onChange={(e) => updateInvoiceFields({ invoiceDiscountPercent: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Shipping / Delivery Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentInvoice.shippingCharges || 0}
                    onChange={(e) => updateInvoiceFields({ shippingCharges: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Additional / Packing Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentInvoice.additionalCharges || 0}
                    onChange={(e) => updateInvoiceFields({ additionalCharges: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Old Metal Credit Returned (Gold exchange deductions)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentInvoice.oldPurchaseAmount || 0}
                    onChange={(e) => updateInvoiceFields({ oldPurchaseAmount: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>

                {/* GST Settings */}
                <div className="col-span-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 border-b pb-1">
                    GST Split Parameters (India)
                  </h3>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={currentInvoice.cgstRate ?? 1.5}
                    onChange={(e) => updateInvoiceFields({ cgstRate: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={currentInvoice.sgstRate ?? 1.5}
                    onChange={(e) => updateInvoiceFields({ sgstRate: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    IGST Rate (%) (Interstate replacement)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={currentInvoice.igstRate ?? 0}
                    onChange={(e) => updateInvoiceFields({ igstRate: Number(e.target.value) || 0 })}
                    className={inputBgCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Invoice Status
                  </label>
                  <select
                    value={currentInvoice.status || "draft"}
                    onChange={(e) => updateInvoiceFields({ status: e.target.value as any })}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none cursor-pointer ${inputBgCls}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION: Design ──────────────────────────────────────────────── */}
        <AccordionHeader id="design" label="Design & Branding" icon={Palette} />
        <div className={`accordion-wrapper ${isOpen("design") ? "open mt-2 mb-4" : ""}`}>
          <div className="accordion-content space-y-6 px-1 pb-4">
            <SectionHeader icon={Settings} label="Template Branding & Styles" isDark={isDark} compact />

            <div className="grid grid-cols-2 gap-4">
              {/* Business Category Display */}
              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Business Category
                </label>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${inputBgCls}`}>
                  <span className="text-2xl">{currentCatDef?.emoji || '📄'}</span>
                  <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentCatDef?.label || 'General'}
                    </p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      Template: {currentInvoice.templateVariant || 'standard'}
                    </p>
                  </div>
                  <button
                    onClick={openCategorySelection}
                    className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Primary Color Customization */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Brand Primary Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={currentInvoice.templateConfig?.branding.primaryColor || "#6d28d9"}
                    onChange={(e) => {
                      const cfg = currentInvoice.templateConfig || DEFAULT_INVOICE_CONFIG;
                      updateInvoiceFields({
                        templateConfig: {
                          ...cfg,
                          branding: { ...cfg.branding, primaryColor: e.target.value }
                        }
                      });
                    }}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-white/10 p-0.5 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={currentInvoice.templateConfig?.branding.primaryColor || "#6d28d9"}
                    onChange={(e) => {
                      const cfg = currentInvoice.templateConfig || DEFAULT_INVOICE_CONFIG;
                      updateInvoiceFields({
                        templateConfig: {
                          ...cfg,
                          branding: { ...cfg.branding, primaryColor: e.target.value }
                        }
                      });
                    }}
                    className={`flex-1 ${inputBgCls}`}
                  />
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Typography Font
                </label>
                <select
                  value={currentInvoice.templateConfig?.branding.fontFamily || "Inter"}
                  onChange={(e) => {
                    const cfg = currentInvoice.templateConfig || DEFAULT_INVOICE_CONFIG;
                    updateInvoiceFields({
                      templateConfig: {
                        ...cfg,
                        branding: { ...cfg.branding, fontFamily: e.target.value }
                      }
                    });
                  }}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none cursor-pointer ${inputBgCls}`}
                >
                  <option value="Inter">Inter (Sans-serif)</option>
                  <option value="Roboto">Roboto (Clean grid)</option>
                  <option value="Sora">Sora (Outfit alternative)</option>
                  <option value="Helvetica">Helvetica (Standard PDF)</option>
                </select>
              </div>

              {/* Visibility Controls */}
              <div className="col-span-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 border-b pb-1">
                  Layout Visibility Rules
                </h3>
              </div>

              {/* Checkbox settings */}
              {[
                { label: "Show Stamp Asset", field: "showStamp", group: "branding" as const },
                { label: "Show Signature Asset", field: "showSignature", group: "branding" as const },
                { label: "Display Bank Details", field: "bankDetails", group: "sections" as const },
                { label: "Display UPI QR Code", field: "qrCode", group: "sections" as const },
                { label: "Display Shipping Info", field: "shippingInfo", group: "sections" as const },
                { label: "Display Customer Info", field: "customerInfo", group: "sections" as const },
                { label: "Display HSN/SAC Column", field: "hsn", group: "layout.columnVisibility" as const },
                { label: "Display Item Discount Column", field: "discount", group: "layout.columnVisibility" as const },
                { label: "Display Item GST Column", field: "tax", group: "layout.columnVisibility" as const },
                { label: "Display Item weights (Jewelry)", field: "weights", group: "layout.columnVisibility" as const },
                { label: "Display Item labour (Jewelry)", field: "labour", group: "layout.columnVisibility" as const },
              ].map((item) => {
                const cfg = currentInvoice.templateConfig || DEFAULT_INVOICE_CONFIG;
                let isChecked = false;
                
                if (item.group === "branding") {
                  isChecked = cfg.branding[item.field as keyof typeof cfg.branding] as boolean;
                } else if (item.group === "sections") {
                  isChecked = cfg.sections[item.field as keyof typeof cfg.sections] as boolean;
                } else if (item.group === "layout.columnVisibility") {
                  isChecked = cfg.layout.columnVisibility[item.field as keyof typeof cfg.layout.columnVisibility] as boolean;
                }

                return (
                  <div key={item.field} className="col-span-1 flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id={`visible-${item.field}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const updatedCfg = JSON.parse(JSON.stringify(cfg));
                        if (item.group === "branding") {
                          updatedCfg.branding[item.field] = e.target.checked;
                        } else if (item.group === "sections") {
                          updatedCfg.sections[item.field] = e.target.checked;
                        } else if (item.group === "layout.columnVisibility") {
                          updatedCfg.layout.columnVisibility[item.field] = e.target.checked;
                        }
                        updateInvoiceFields({ templateConfig: updatedCfg });
                      }}
                      className="rounded border-gray-300 text-violet-600 w-4 h-4 focus:ring-violet-500"
                    />
                    <label htmlFor={`visible-${item.field}`} className="text-xs text-gray-600 dark:text-white/60 cursor-pointer select-none">
                      {item.label}
                    </label>
                  </div>
                );
              })}

              {/* Custom terms default */}
              <div className="col-span-2 pt-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Default Payment Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={currentInvoice.terms || ""}
                  onChange={(e) => updateInvoiceFields({ terms: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Invoice Notes (Visible on bottom of PDF)
                </label>
                <textarea
                  rows={2}
                  value={currentInvoice.notes || ""}
                  onChange={(e) => updateInvoiceFields({ notes: e.target.value })}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Autosave Status Bar ─────────────────────────────────────────────── */}
      <div className={`shrink-0 flex items-center justify-between px-4 py-2.5 border-t text-[10px] ${
        isDark ? "bg-[#0e0e10] border-white/5" : "bg-gray-50 border-black/5"
      }`}>
        <div className={`flex items-center gap-2 ${isDark ? "text-white/35" : "text-gray-400"}`}>
          {isSaving ? (
            <><Loader2 className="w-3 h-3 animate-spin text-violet-400" /> Saving…</>
          ) : savedAtStr ? (
            <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved · {savedAtStr}</>
          ) : (
            <><Clock className="w-3 h-3" /> Not saved yet</>          
          )}
        </div>
        {toastMsg && (
          <span className="flex items-center gap-1.5 text-violet-400 font-semibold">
            <Sparkles className="w-3 h-3" /> {toastMsg}
          </span>
        )}
      </div>
    </div>
  );
};

const DEFAULT_INVOICE_CONFIG = {
  branding: {
    primaryColor: "#6d28d9",
    secondaryColor: "#4c1d95",
    fontFamily: "Inter",
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
