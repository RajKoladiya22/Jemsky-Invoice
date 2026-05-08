// "use client";

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   Plus,
//   Trash2,
//   Download,
//   Save,
//   Eye,
//   EyeOff,
//   ChevronDown,
//   ArrowLeft,
//   FileText,
//   Building2,
//   User,
//   Hash,
//   StickyNote,
//   CheckCircle2,
//   AlertCircle,
//   Moon,
//   Sun,
//   RotateCcw,
//   Copy,
//   ImagePlus,
//   X,
// } from "lucide-react";
// import { Link } from "react-router-dom";


// // ─── Types ────────────────────────────────────────────────────────────────────

// interface InvoiceItem {
//   id: string;
//   name: string;
//   description: string;
//   quantity: number | string;
//   rate: number | string;
//   tax: number | string;
//   discount: number | string;
// }

// interface InvoiceData {
//   // Company
//   companyName: string;
//   companyEmail: string;
//   companyPhone: string;
//   companyAddress: string;
//   companyGST: string;
//   companyLogo: string;
//   // Client
//   clientName: string;
//   clientCompany: string;
//   clientEmail: string;
//   clientPhone: string;
//   clientAddress: string;
//   // Meta
//   invoiceNumber: string;
//   invoiceDate: string;
//   dueDate: string;
//   currency: string;
//   currencySymbol: string;
//   paymentTerms: string;
//   // Items
//   items: InvoiceItem[];
//   // Extra
//   notes: string;
//   terms: string;
//   paymentDetails: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const CURRENCIES = [
//   { code: "INR", symbol: "₹", label: "Indian Rupee" },
//   { code: "USD", symbol: "$", label: "US Dollar" },
//   { code: "EUR", symbol: "€", label: "Euro" },
//   { code: "GBP", symbol: "£", label: "British Pound" },
//   { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
//   { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
//   { code: "AUD", symbol: "A$", label: "Australian Dollar" },
//   { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
// ];

// const PAYMENT_TERMS = [
//   "Due on Receipt",
//   "Net 7",
//   "Net 15",
//   "Net 30",
//   "Net 45",
//   "Net 60",
// ];

// const DEFAULT_INVOICE: InvoiceData = {
//   companyName: "",
//   companyEmail: "",
//   companyPhone: "",
//   companyAddress: "",
//   companyGST: "",
//   companyLogo: "",
//   clientName: "",
//   clientCompany: "",
//   clientEmail: "",
//   clientPhone: "",
//   clientAddress: "",
//   invoiceNumber: "",
//   invoiceDate: new Date().toISOString().split("T")[0],
//   dueDate: "",
//   currency: "INR",
//   currencySymbol: "₹",
//   paymentTerms: "Net 30",
//   items: [
//     {
//       id: generateId(),
//       name: "",
//       description: "",
//       quantity: 1,
//       rate: 0,
//       tax: 0,
//       discount: 0,
//     },
//   ],
//   notes: "",
//   terms: "Payment is due within the specified payment terms. Late payments may incur additional charges.",
//   paymentDetails: "",
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function calcItem(item: InvoiceItem) {
//   const qty = Number(item.quantity) || 0;
//   const rate = Number(item.rate) || 0;
//   const tax = Number(item.tax) || 0;
//   const discount = Number(item.discount) || 0;
//   const subtotal = qty * rate;
//   const discountAmt = subtotal * (discount / 100);
//   const afterDiscount = subtotal - discountAmt;
//   const taxAmt = afterDiscount * (tax / 100);
//   return {
//     subtotal,
//     discountAmt,
//     taxAmt,
//     total: afterDiscount + taxAmt,
//   };
// }

// function calcTotals(items: InvoiceItem[]) {
//   let subtotal = 0;
//   let totalDiscount = 0;
//   let totalTax = 0;
//   let grandTotal = 0;
//   items.forEach((item) => {
//     const c = calcItem(item);
//     subtotal += c.subtotal;
//     totalDiscount += c.discountAmt;
//     totalTax += c.taxAmt;
//     grandTotal += c.total;
//   });
//   return { subtotal, totalDiscount, totalTax, grandTotal };
// }

// function fmt(sym: string, val: number) {
//   return `${sym}${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// }

// function generateInvoiceNumber() {
//   const now = new Date();
//   const yr = now.getFullYear().toString().slice(2);
//   const mo = String(now.getMonth() + 1).padStart(2, "0");
//   const rand = String(Math.floor(Math.random() * 900) + 100);
//   return `INV-${yr}${mo}-${rand}`;
// }

// function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
//   let t: ReturnType<typeof setTimeout>;
//   return (...args: Parameters<T>) => {
//     clearTimeout(t);
//     t = setTimeout(() => fn(...args), ms);
//   };
// }

// // ─── Section Header ──────────────────────────────────────────────────────────

// function SectionHeader({
//   icon: Icon,
//   label,
//   isDark,
// }: {
//   icon: React.ElementType;
//   label: string;
//   isDark: boolean;
// }) {
//   return (
//     <div className="flex items-center gap-2.5 mb-5">
//       <div className="w-7 h-7 rounded-lg bg-violet-500/12 flex items-center justify-center shrink-0">
//         <Icon className="w-3.5 h-3.5 text-violet-500" />
//       </div>
//       <span className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-white/40" : "text-black/40"}`}>
//         {label}
//       </span>
//       <div className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-black/6"}`} />
//     </div>
//   );
// }

// // ─── Input Component ─────────────────────────────────────────────────────────

// function Field({
//   label,
//   children,
//   half,
// }: {
//   label: string;
//   children: React.ReactNode;
//   half?: boolean;
// }) {
//   return (
//     <div className={half ? "col-span-1" : "col-span-2"}>
//       <label className="block text-[11px] font-semibold mb-1.5 opacity-50 uppercase tracking-wider">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function inputCls(isDark: boolean) {
//   return `w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all border ${
//     isDark
//       ? "bg-white/4 border-white/8 text-white placeholder-white/20 focus:border-violet-500/60 focus:bg-white/6"
//       : "bg-black/3 border-black/8 text-black placeholder-black/20 focus:border-violet-500/60 focus:bg-black/2"
//   }`;
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function InvoicePage() {
//   const [invoice, setInvoice] = useState<InvoiceData>(DEFAULT_INVOICE);
//   const [isDark, setIsDark] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
//   const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showPreview, setShowPreview] = useState(true);
//   const [currencyOpen, setCurrencyOpen] = useState(false);
//   const [termsOpen, setTermsOpen] = useState(false);
//   const printRef = useRef<HTMLDivElement>(null);

//   // ── Mount + theme ──
//   useEffect(() => {
//     setMounted(true);
//     const saved = localStorage.getItem("jemsky-theme");
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     const dark = saved === "dark" || (!saved && prefersDark);
//     setIsDark(dark);
//     if (dark) document.documentElement.classList.add("dark");

//     // Load draft
//     try {
//       const draft = localStorage.getItem("jemsky-invoice-draft");
//       if (draft) {
//         const parsed = JSON.parse(draft);
//         setInvoice(parsed);
//       } else {
//         setInvoice((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
//       }
//     } catch {
//       setInvoice((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
//     }
//   }, []);

//   // ── Auto-save ──
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const autoSave = useCallback(
//     debounce((...args: unknown[]) => {
//       const data = args[0] as InvoiceData;
//       setSaveState("saving");
//       try {
//         localStorage.setItem("jemsky-invoice-draft", JSON.stringify(data));
//         setTimeout(() => setSaveState("saved"), 400);
//         setTimeout(() => setSaveState("idle"), 2000);
//       } catch {
//         setSaveState("idle");
//       }
//     }, 800),
//     []
//   );

//   useEffect(() => {
//     if (mounted) autoSave(invoice);
//   }, [invoice, mounted, autoSave]);

//   // ── Helpers ──
//   const set = (key: keyof InvoiceData, val: unknown) =>
//     setInvoice((prev) => ({ ...prev, [key]: val }));

//   const setItem = (id: string, key: keyof InvoiceItem, val: unknown) =>
//     setInvoice((prev) => ({
//       ...prev,
//       items: prev.items.map((item) =>
//         item.id === id ? { ...item, [key]: val } : item
//       ),
//     }));

//   const addItem = () =>
//     setInvoice((prev) => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         {
//           id: generateId(),
//           name: "",
//           description: "",
//           quantity: 1,
//           rate: 0,
//           tax: 0,
//           discount: 0,
//         },
//       ],
//     }));

//   const removeItem = (id: string) =>
//     setInvoice((prev) => ({
//       ...prev,
//       items: prev.items.filter((i) => i.id !== id),
//     }));

//   const toggleTheme = () => {
//     const next = !isDark;
//     setIsDark(next);
//     localStorage.setItem("jemsky-theme", next ? "dark" : "light");
//     document.documentElement.classList.toggle("dark", next);
//   };

//   const resetDraft = () => {
//     localStorage.removeItem("jemsky-invoice-draft");
//     setInvoice({ ...DEFAULT_INVOICE, invoiceNumber: generateInvoiceNumber() });
//   };

//   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => set("companyLogo", ev.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   const validate = () => {
//     const errs: Record<string, string> = {};
//     if (!invoice.invoiceNumber.trim()) errs.invoiceNumber = "Required";
//     if (!invoice.clientName.trim()) errs.clientName = "Required";
//     if (invoice.items.length === 0) errs.items = "Add at least one item";
//     invoice.items.forEach((item, i) => {
//       if (!item.name.trim()) errs[`item-${i}-name`] = "Required";
//       if (Number(item.quantity) <= 0) errs[`item-${i}-qty`] = "Must be > 0";
//       if (Number(item.rate) < 0) errs[`item-${i}-rate`] = "Must be ≥ 0";
//     });
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleDownload = () => {
//     if (!validate()) return;
//     window.print();
//   };

//   const totals = calcTotals(invoice.items);
//   const sym = invoice.currencySymbol;

//   if (!mounted) return null;

//   // ─── Shared input className ─────
//   const inp = inputCls(isDark);
//   const cardCls = `rounded-2xl border p-6 mb-4 ${
//     isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-white"
//   }`;

//   return (
//     <>
//       {/* ── Print styles ── */}
//       <style>{`
//         @media print {
//           body * { visibility: hidden !important; }
//           #invoice-print, #invoice-print * { visibility: visible !important; }
//           #invoice-print {
//             position: fixed !important;
//             inset: 0 !important;
//             width: 210mm !important;
//             min-height: 297mm !important;
//             background: white !important;
//             color: black !important;
//             padding: 12mm 14mm !important;
//             font-family: 'Sora', sans-serif !important;
//           }
//           @page { size: A4; margin: 0; }
//         }
//         .scrollbar-hide::-webkit-scrollbar { display: none; }
//         .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       <div
//         className={`min-h-screen transition-colors duration-300 ${
//           isDark ? "bg-[#0c0c0e] text-[#f0ede8]" : "bg-[#f0eff9] text-[#1a1a1a]"
//         }`}
//       >
//         {/* ─── Top bar ─────────────────────────────────────────────────── */}
//         <header
//           className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
//             isDark ? "border-white/5 bg-[#0c0c0e]/85" : "border-black/5 bg-[#f0eff9]/85"
//           }`}
//         >
//           <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
//             {/* Left */}
//             <div className="flex items-center gap-3">
//               <Link
//                 to="/"
//                 className={`p-1.5 rounded-lg transition-colors ${
//                   isDark ? "hover:bg-white/6 text-white/40 hover:text-white/80" : "hover:bg-black/5 text-black/40 hover:text-black/80"
//                 }`}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//               </Link>
//               <div className="h-4 w-px bg-current opacity-10" />
//               <div className="flex items-center gap-2">
//                 <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center">
//                   <FileText className="w-3 h-3 text-white" />
//                 </div>
//                 <span className="font-bold text-sm bg-linear-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">
//                   Jemsky Invoice
//                 </span>
//               </div>
//               {invoice.invoiceNumber && (
//                 <>
//                   <span className={`text-xs ${isDark ? "text-white/20" : "text-black/20"}`}>/</span>
//                   <span className={`text-xs font-mono ${isDark ? "text-white/40" : "text-black/40"}`}>
//                     {invoice.invoiceNumber}
//                   </span>
//                 </>
//               )}
//             </div>

//             {/* Right */}
//             <div className="flex items-center gap-2">
//               {/* Save indicator */}
//               <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
//                 saveState === "saved"
//                   ? "text-emerald-500 bg-emerald-500/10"
//                   : saveState === "saving"
//                   ? isDark ? "text-white/30 bg-white/4" : "text-black/30 bg-black/4"
//                   : isDark ? "text-white/20 bg-transparent" : "text-black/20 bg-transparent"
//               }`}>
//                 {saveState === "saved" ? (
//                   <><CheckCircle2 className="w-3 h-3" /> Saved</>
//                 ) : saveState === "saving" ? (
//                   <><Save className="w-3 h-3 animate-pulse" /> Saving…</>
//                 ) : null}
//               </div>

//               <button
//                 onClick={resetDraft}
//                 className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1.5 ${
//                   isDark ? "hover:bg-white/6 text-white/30 hover:text-white/60" : "hover:bg-black/5 text-black/30 hover:text-black/60"
//                 }`}
//                 title="Reset draft"
//               >
//                 <RotateCcw className="w-3.5 h-3.5" />
//                 <span className="hidden sm:inline text-xs">Reset</span>
//               </button>

//               {/* Mobile tab toggle */}
//               <button
//                 onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
//                 className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
//                   isDark ? "bg-white/6 text-white/60 hover:bg-white/10" : "bg-black/5 text-black/60 hover:bg-black/8"
//                 }`}
//               >
//                 {activeTab === "form" ? <><Eye className="w-3.5 h-3.5" /> Preview</> : <><EyeOff className="w-3.5 h-3.5" /> Edit</>}
//               </button>

//               <button
//                 onClick={() => setShowPreview(!showPreview)}
//                 className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
//                   isDark ? "bg-white/6 text-white/60 hover:bg-white/10" : "bg-black/5 text-black/60 hover:bg-black/8"
//                 }`}
//               >
//                 {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Hide Preview</> : <><Eye className="w-3.5 h-3.5" /> Show Preview</>}
//               </button>

//               <button
//                 onClick={toggleTheme}
//                 className={`p-2 rounded-lg transition-colors ${
//                   isDark ? "bg-white/5 hover:bg-white/10 text-white/50" : "bg-black/5 hover:bg-black/8 text-black/50"
//                 }`}
//               >
//                 {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//               </button>

//               <button
//                 onClick={handleDownload}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-px"
//               >
//                 <Download className="w-3.5 h-3.5" />
//                 <span>Download PDF</span>
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* ─── Body ────────────────────────────────────────────────────── */}
//         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
//           <div className={`flex gap-6 ${showPreview ? "md:grid md:grid-cols-[1fr_420px]" : ""}`}>

//             {/* ═══ FORM PANEL ═══════════════════════════════════════════ */}
//             <div className={`flex-1 min-w-0 space-y-0 ${activeTab === "preview" ? "hidden md:block" : ""}`}>

//               {/* ── Company ── */}
//               <div className={cardCls}>
//                 <SectionHeader icon={Building2} label="Your Company" isDark={isDark} />
//                 <div className="grid grid-cols-2 gap-3">
//                   {/* Logo upload */}
//                   <div className="col-span-2">
//                     <label className="block text-[11px] font-semibold mb-1.5 opacity-50 uppercase tracking-wider">
//                       Company Logo
//                     </label>
//                     <div className="flex items-center gap-3">
//                       {invoice.companyLogo ? (
//                         <div className="relative">
//                           {/* eslint-disable-next-line @next/next/no-img-element */}
//                           <img
//                             src={invoice.companyLogo}
//                             alt="Logo"
//                             className="w-16 h-16 object-contain rounded-xl border border-white/10"
//                           />
//                           <button
//                             onClick={() => set("companyLogo", "")}
//                             className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
//                           >
//                             <X className="w-3 h-3 text-white" />
//                           </button>
//                         </div>
//                       ) : (
//                         <label
//                           className={`flex items-center justify-center gap-2 w-16 h-16 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
//                             isDark ? "border-white/12 hover:border-violet-500/40 hover:bg-violet-500/5" : "border-black/12 hover:border-violet-500/40 hover:bg-violet-500/5"
//                           }`}
//                         >
//                           <ImagePlus className="w-5 h-5 text-violet-400" />
//                           <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
//                         </label>
//                       )}
//                       <div className={`text-xs ${isDark ? "text-white/30" : "text-black/30"}`}>
//                         <p>Upload your logo</p>
//                         <p>PNG, JPG, SVG up to 2MB</p>
//                       </div>
//                     </div>
//                   </div>

//                   <Field label="Company Name" half>
//                     <input className={inp} placeholder="Jemsky Technologies" value={invoice.companyName} onChange={(e) => set("companyName", e.target.value)} />
//                   </Field>
//                   <Field label="GST / VAT Number" half>
//                     <input className={inp} placeholder="27XXXXX1234X1Z5" value={invoice.companyGST} onChange={(e) => set("companyGST", e.target.value)} />
//                   </Field>
//                   <Field label="Email" half>
//                     <input className={inp} type="email" placeholder="hello@jemsky.com" value={invoice.companyEmail} onChange={(e) => set("companyEmail", e.target.value)} />
//                   </Field>
//                   <Field label="Phone" half>
//                     <input className={inp} placeholder="+91 98765 43210" value={invoice.companyPhone} onChange={(e) => set("companyPhone", e.target.value)} />
//                   </Field>
//                   <Field label="Address">
//                     <textarea className={`${inp} resize-none`} rows={2} placeholder="123 Business Park, Mumbai 400001" value={invoice.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
//                   </Field>
//                 </div>
//               </div>

//               {/* ── Client ── */}
//               <div className={cardCls}>
//                 <SectionHeader icon={User} label="Bill To" isDark={isDark} />
//                 <div className="grid grid-cols-2 gap-3">
//                   <Field label="Client Name" half>
//                     <div>
//                       <input
//                         className={`${inp} ${errors.clientName ? "border-red-500/50" : ""}`}
//                         placeholder="Rajesh Kumar"
//                         value={invoice.clientName}
//                         onChange={(e) => { set("clientName", e.target.value); setErrors((p) => ({ ...p, clientName: "" })); }}
//                       />
//                       {errors.clientName && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.clientName}</p>}
//                     </div>
//                   </Field>
//                   <Field label="Company Name" half>
//                     <input className={inp} placeholder="Acme Corp Pvt. Ltd." value={invoice.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} />
//                   </Field>
//                   <Field label="Email" half>
//                     <input className={inp} type="email" placeholder="rajesh@acme.in" value={invoice.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />
//                   </Field>
//                   <Field label="Phone" half>
//                     <input className={inp} placeholder="+91 99887 76655" value={invoice.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} />
//                   </Field>
//                   <Field label="Billing Address">
//                     <textarea className={`${inp} resize-none`} rows={2} placeholder="456 Client Street, Delhi 110001" value={invoice.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} />
//                   </Field>
//                 </div>
//               </div>

//               {/* ── Invoice Meta ── */}
//               <div className={cardCls}>
//                 <SectionHeader icon={Hash} label="Invoice Details" isDark={isDark} />
//                 <div className="grid grid-cols-2 gap-3">
//                   <Field label="Invoice Number" half>
//                     <div className="flex gap-2">
//                       <input
//                         className={`${inp} flex-1 font-mono ${errors.invoiceNumber ? "border-red-500/50" : ""}`}
//                         placeholder="INV-2024-001"
//                         value={invoice.invoiceNumber}
//                         onChange={(e) => { set("invoiceNumber", e.target.value); setErrors((p) => ({ ...p, invoiceNumber: "" })); }}
//                       />
//                       <button
//                         onClick={() => set("invoiceNumber", generateInvoiceNumber())}
//                         className={`px-2.5 rounded-xl text-xs transition-colors shrink-0 ${isDark ? "bg-white/6 hover:bg-white/10 text-white/50" : "bg-black/5 hover:bg-black/8 text-black/50"}`}
//                         title="Generate"
//                       >
//                         <Copy className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                     {errors.invoiceNumber && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.invoiceNumber}</p>}
//                   </Field>

//                   {/* Currency */}
//                   <Field label="Currency" half>
//                     <div className="relative">
//                       <button
//                         onClick={() => setCurrencyOpen(!currencyOpen)}
//                         className={`${inp} flex items-center justify-between text-left`}
//                       >
//                         <span>{invoice.currencySymbol} — {invoice.currency}</span>
//                         <ChevronDown className={`w-4 h-4 opacity-40 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
//                       </button>
//                       {currencyOpen && (
//                         <div className={`absolute z-20 top-full mt-1 w-full rounded-xl border overflow-hidden shadow-xl ${isDark ? "bg-[#161618] border-white/10" : "bg-white border-black/8"}`}>
//                           {CURRENCIES.map((c) => (
//                             <button
//                               key={c.code}
//                               onClick={() => { set("currency", c.code); set("currencySymbol", c.symbol); setCurrencyOpen(false); }}
//                               className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
//                                 invoice.currency === c.code
//                                   ? "text-violet-500 bg-violet-500/8"
//                                   : isDark ? "hover:bg-white/4 text-white/70" : "hover:bg-black/3 text-black/70"
//                               }`}
//                             >
//                               <span className="font-mono font-bold w-6">{c.symbol}</span>
//                               <span>{c.code}</span>
//                               <span className={`text-xs ml-auto ${isDark ? "text-white/30" : "text-black/30"}`}>{c.label}</span>
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </Field>

//                   <Field label="Invoice Date" half>
//                     <input className={inp} type="date" value={invoice.invoiceDate} onChange={(e) => set("invoiceDate", e.target.value)} />
//                   </Field>
//                   <Field label="Due Date" half>
//                     <input className={inp} type="date" value={invoice.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
//                   </Field>

//                   {/* Payment Terms */}
//                   <Field label="Payment Terms">
//                     <div className="relative">
//                       <button
//                         onClick={() => setTermsOpen(!termsOpen)}
//                         className={`${inp} flex items-center justify-between text-left`}
//                       >
//                         <span>{invoice.paymentTerms}</span>
//                         <ChevronDown className={`w-4 h-4 opacity-40 transition-transform ${termsOpen ? "rotate-180" : ""}`} />
//                       </button>
//                       {termsOpen && (
//                         <div className={`absolute z-20 top-full mt-1 w-full rounded-xl border overflow-hidden shadow-xl ${isDark ? "bg-[#161618] border-white/10" : "bg-white border-black/8"}`}>
//                           {PAYMENT_TERMS.map((t) => (
//                             <button
//                               key={t}
//                               onClick={() => { set("paymentTerms", t); setTermsOpen(false); }}
//                               className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
//                                 invoice.paymentTerms === t
//                                   ? "text-violet-500 bg-violet-500/8"
//                                   : isDark ? "hover:bg-white/4 text-white/70" : "hover:bg-black/3 text-black/70"
//                               }`}
//                             >
//                               {t}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </Field>
//                 </div>
//               </div>

//               {/* ── Items ── */}
//               <div className={cardCls}>
//                 <SectionHeader icon={FileText} label="Line Items" isDark={isDark} />

//                 {errors.items && (
//                   <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" />{errors.items}
//                   </p>
//                 )}

//                 {/* Table header */}
//                 <div className={`hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider opacity-40 px-1`}>
//                   <span>Item</span>
//                   <span>Qty</span>
//                   <span>Rate ({sym})</span>
//                   <span>Tax %</span>
//                   <span>Total</span>
//                   <span />
//                 </div>

//                 <div className="space-y-3">
//                   {invoice.items.map((item, idx) => {
//                     const c = calcItem(item);
//                     return (
//                       <div
//                         key={item.id}
//                         className={`rounded-xl border p-3 transition-all ${isDark ? "border-white/6 bg-white/2 hover:border-white/10" : "border-black/6 bg-black/1 hover:border-black/10"}`}
//                       >
//                         {/* Mobile label */}
//                         <div className={`sm:hidden text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40`}>
//                           Item {idx + 1}
//                         </div>

//                         {/* Row 1: name + qty + rate + tax + total + delete */}
//                         <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 items-start">
//                           <div className="col-span-2 sm:col-span-1">
//                             <input
//                               className={`${inp} ${errors[`item-${idx}-name`] ? "border-red-500/50" : ""}`}
//                               placeholder="Service or product name"
//                               value={item.name}
//                               onChange={(e) => { setItem(item.id, "name", e.target.value); setErrors((p) => ({ ...p, [`item-${idx}-name`]: "" })); }}
//                             />
//                           </div>
//                           <div>
//                             <label className={`sm:hidden block text-[10px] mb-1 opacity-40`}>Qty</label>
//                             <input
//                               className={`${inp} text-center ${errors[`item-${idx}-qty`] ? "border-red-500/50" : ""}`}
//                               type="number"
//                               min="0"
//                               placeholder="1"
//                               value={item.quantity}
//                               onChange={(e) => setItem(item.id, "quantity", e.target.value)}
//                             />
//                           </div>
//                           <div>
//                             <label className={`sm:hidden block text-[10px] mb-1 opacity-40`}>Rate</label>
//                             <input
//                               className={`${inp} text-right`}
//                               type="number"
//                               min="0"
//                               placeholder="0.00"
//                               value={item.rate}
//                               onChange={(e) => setItem(item.id, "rate", e.target.value)}
//                             />
//                           </div>
//                           <div>
//                             <label className={`sm:hidden block text-[10px] mb-1 opacity-40`}>Tax %</label>
//                             <input
//                               className={`${inp} text-center`}
//                               type="number"
//                               min="0"
//                               max="100"
//                               placeholder="18"
//                               value={item.tax}
//                               onChange={(e) => setItem(item.id, "tax", e.target.value)}
//                             />
//                           </div>
//                           <div className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold text-right ${isDark ? "bg-violet-500/8 text-violet-300" : "bg-violet-500/8 text-violet-700"}`}>
//                             {fmt(sym, c.total)}
//                           </div>
//                           <button
//                             onClick={() => invoice.items.length > 1 && removeItem(item.id)}
//                             className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
//                               invoice.items.length === 1
//                                 ? "opacity-20 cursor-not-allowed"
//                                 : isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-500/10 text-black/30 hover:text-red-500"
//                             }`}
//                             disabled={invoice.items.length === 1}
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>

//                         {/* Row 2: description + discount */}
//                         <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_36px] gap-2 mt-2 items-center">
//                           <input
//                             className={`${inp} col-span-2 sm:col-span-1 text-xs`}
//                             placeholder="Optional description…"
//                             value={item.description}
//                             onChange={(e) => setItem(item.id, "description", e.target.value)}
//                           />
//                           <div className="flex items-center gap-1.5">
//                             <input
//                               className={`${inp} text-center text-xs`}
//                               type="number"
//                               min="0"
//                               max="100"
//                               placeholder="0"
//                               value={item.discount}
//                               onChange={(e) => setItem(item.id, "discount", e.target.value)}
//                             />
//                             <span className={`text-xs opacity-40 shrink-0`}>% off</span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <button
//                   onClick={addItem}
//                   className={`mt-3 w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
//                     isDark ? "border-white/10 text-white/30 hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/4" : "border-black/10 text-black/30 hover:border-violet-500/30 hover:text-violet-600 hover:bg-violet-500/4"
//                   }`}
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Line Item
//                 </button>

//                 {/* Totals */}
//                 <div className={`mt-5 ml-auto w-full sm:w-80 rounded-xl border p-4 space-y-2 ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-black/2"}`}>
//                   <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
//                     <span>Subtotal</span>
//                     <span>{fmt(sym, totals.subtotal)}</span>
//                   </div>
//                   {totals.totalDiscount > 0 && (
//                     <div className="flex justify-between text-sm text-emerald-500">
//                       <span>Discount</span>
//                       <span>- {fmt(sym, totals.totalDiscount)}</span>
//                     </div>
//                   )}
//                   {totals.totalTax > 0 && (
//                     <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
//                       <span>Tax</span>
//                       <span>+ {fmt(sym, totals.totalTax)}</span>
//                     </div>
//                   )}
//                   <div className={`flex justify-between font-bold text-base pt-2 border-t ${isDark ? "border-white/8" : "border-black/8"}`}>
//                     <span>Grand Total</span>
//                     <span className="text-violet-500">{fmt(sym, totals.grandTotal)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* ── Notes / Terms / Payment ── */}
//               <div className={cardCls}>
//                 <SectionHeader icon={StickyNote} label="Additional Info" isDark={isDark} />
//                 <div className="grid grid-cols-2 gap-3">
//                   <Field label="Notes (visible on invoice)">
//                     <textarea className={`${inp} resize-none`} rows={3} placeholder="Thank you for your business!" value={invoice.notes} onChange={(e) => set("notes", e.target.value)} />
//                   </Field>
//                   <Field label="Terms & Conditions">
//                     <textarea className={`${inp} resize-none`} rows={3} value={invoice.terms} onChange={(e) => set("terms", e.target.value)} />
//                   </Field>
//                   <Field label="Payment Details / Bank Info">
//                     <textarea className={`${inp} resize-none`} rows={3} placeholder="Account: XXXX, IFSC: SBIN0001234, UPI: pay@jemsky" value={invoice.paymentDetails} onChange={(e) => set("paymentDetails", e.target.value)} />
//                   </Field>
//                 </div>
//               </div>

//               {/* Bottom action bar */}
//               <div className="flex justify-end gap-3 pb-8">
//                 <button
//                   onClick={resetDraft}
//                   className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-white/8 hover:bg-white/4 text-white/50" : "border-black/8 hover:bg-black/4 text-black/50"}`}
//                 >
//                   Clear All
//                 </button>
//                 <button
//                   onClick={handleDownload}
//                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
//                 >
//                   <Download className="w-4 h-4" />
//                   Download PDF
//                 </button>
//               </div>
//             </div>

//             {/* ═══ PREVIEW PANEL ════════════════════════════════════════ */}
//             {(showPreview || activeTab === "preview") && (
//               <div className={`${activeTab === "form" ? "hidden md:block" : ""} md:sticky md:top-[72px] md:self-start`}>
//                 <div className={`text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-white/30" : "text-black/30"}`}>
//                   <Eye className="w-3.5 h-3.5" />
//                   Live Preview
//                 </div>

//                 {/* The printable invoice */}
//                 <div
//                   id="invoice-print"
//                   ref={printRef}
//                   className="w-full bg-white text-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden"
//                   style={{ fontFamily: "var(--font-sora, sans-serif)", minHeight: 600 }}
//                 >
//                   {/* Invoice header */}
//                   <div className="bg-linear-to-br from-violet-600 to-violet-800 px-8 pt-8 pb-6 text-white">
//                     <div className="flex justify-between items-start gap-4">
//                       <div>
//                         {invoice.companyLogo ? (
//                           // eslint-disable-next-line @next/next/no-img-element
//                           <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto object-contain mb-3 rounded" />
//                         ) : (
//                           <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
//                             <FileText className="w-5 h-5 text-white/70" />
//                           </div>
//                         )}
//                         <p className="font-bold text-lg leading-tight">{invoice.companyName || "Your Company"}</p>
//                         {invoice.companyGST && <p className="text-white/60 text-xs mt-0.5">GST: {invoice.companyGST}</p>}
//                         {invoice.companyEmail && <p className="text-white/60 text-xs">{invoice.companyEmail}</p>}
//                         {invoice.companyPhone && <p className="text-white/60 text-xs">{invoice.companyPhone}</p>}
//                         {invoice.companyAddress && <p className="text-white/60 text-xs mt-1 max-w-[160px] leading-relaxed">{invoice.companyAddress}</p>}
//                       </div>
//                       <div className="text-right shrink-0">
//                         <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Invoice</p>
//                         <p className="font-bold text-xl font-mono">{invoice.invoiceNumber || "—"}</p>
//                         {invoice.invoiceDate && (
//                           <p className="text-white/60 text-xs mt-2">
//                             Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//                           </p>
//                         )}
//                         {invoice.dueDate && (
//                           <p className="text-white/60 text-xs">
//                             Due: {new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//                           </p>
//                         )}
//                         {invoice.paymentTerms && <p className="text-white/50 text-xs mt-1">{invoice.paymentTerms}</p>}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bill to */}
//                   <div className="px-8 py-5 bg-violet-50/60 border-b border-violet-100">
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">Bill To</p>
//                     <p className="font-bold text-sm">{invoice.clientName || "Client Name"}</p>
//                     {invoice.clientCompany && <p className="text-xs text-gray-500">{invoice.clientCompany}</p>}
//                     {invoice.clientEmail && <p className="text-xs text-gray-500">{invoice.clientEmail}</p>}
//                     {invoice.clientPhone && <p className="text-xs text-gray-500">{invoice.clientPhone}</p>}
//                     {invoice.clientAddress && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{invoice.clientAddress}</p>}
//                   </div>

//                   {/* Items table */}
//                   <div className="px-8 py-5">
//                     <table className="w-full text-xs">
//                       <thead>
//                         <tr className="border-b-2 border-violet-100">
//                           <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 pr-3">Item</th>
//                           <th className="text-center pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-10">Qty</th>
//                           <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">Rate</th>
//                           <th className="text-center pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-12">Tax</th>
//                           <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">Amount</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {invoice.items.map((item) => {
//                           const c = calcItem(item);
//                           return (
//                             <tr key={item.id}>
//                               <td className="py-2.5 pr-3">
//                                 <p className="font-semibold text-gray-800">{item.name || <span className="text-gray-300 italic">Unnamed item</span>}</p>
//                                 {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
//                                 {Number(item.discount) > 0 && (
//                                   <p className="text-emerald-500 text-[10px]">{item.discount}% discount applied</p>
//                                 )}
//                               </td>
//                               <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
//                               <td className="py-2.5 text-right text-gray-600">{fmt(sym, Number(item.rate))}</td>
//                               <td className="py-2.5 text-center text-gray-600">{item.tax}%</td>
//                               <td className="py-2.5 text-right font-semibold text-violet-700">{fmt(sym, c.total)}</td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Totals */}
//                   <div className="px-8 pb-5">
//                     <div className="ml-auto w-52 space-y-1.5">
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>Subtotal</span>
//                         <span>{fmt(sym, totals.subtotal)}</span>
//                       </div>
//                       {totals.totalDiscount > 0 && (
//                         <div className="flex justify-between text-xs text-emerald-600">
//                           <span>Discount</span>
//                           <span>- {fmt(sym, totals.totalDiscount)}</span>
//                         </div>
//                       )}
//                       {totals.totalTax > 0 && (
//                         <div className="flex justify-between text-xs text-gray-500">
//                           <span>Tax</span>
//                           <span>+ {fmt(sym, totals.totalTax)}</span>
//                         </div>
//                       )}
//                       <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-violet-200">
//                         <span>Total</span>
//                         <span className="text-violet-700">{fmt(sym, totals.grandTotal)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Notes / Terms / Payment */}
//                   {(invoice.notes || invoice.terms || invoice.paymentDetails) && (
//                     <div className="px-8 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
//                       {invoice.notes && (
//                         <div>
//                           <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Notes</p>
//                           <p className="text-xs text-gray-500 leading-relaxed">{invoice.notes}</p>
//                         </div>
//                       )}
//                       {invoice.paymentDetails && (
//                         <div>
//                           <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Payment Details</p>
//                           <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{invoice.paymentDetails}</p>
//                         </div>
//                       )}
//                       {invoice.terms && (
//                         <div className="sm:col-span-2">
//                           <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Terms & Conditions</p>
//                           <p className="text-xs text-gray-400 leading-relaxed">{invoice.terms}</p>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
//                     <p className="text-[10px] text-gray-300">Generated by Jemsky Invoice · jemsky.com</p>
//                     <div className="flex items-center gap-1.5">
//                       <div className="w-4 h-4 rounded bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center">
//                         <FileText className="w-2.5 h-2.5 text-white" />
//                       </div>
//                       <span className="text-[10px] font-bold text-violet-600">Jemsky</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview action */}
//                 <button
//                   onClick={handleDownload}
//                   className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
//                 >
//                   <Download className="w-4 h-4" />
//                   Download PDF
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }







"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Plus,
    Trash2,
    Download,
    Save,
    Eye,
    EyeOff,
    ChevronDown,
    ArrowLeft,
    FileText,
    Building2,
    User,
    Hash,
    StickyNote,
    CheckCircle2,
    AlertCircle,
    Moon,
    Sun,
    RotateCcw,
    Copy,
    ImagePlus,
    X,
    History,
    BookUser,
    Package,
    TableProperties,
} from "lucide-react";
import { Link } from "react-router-dom";
import { generateId } from "../../utils/generateId";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
    id: string;
    name: string;
    description: string;
    quantity: number | string;
    rate: number | string;
    tax: number | string;
    discount: number | string;
    hsn: string;
}

interface InvoiceData {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    companyGST: string;
    companyLogo: string;
    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    currencySymbol: string;
    paymentTerms: string;
    poNumber: string;
    hsnCode: string;
    items: InvoiceItem[];
    notes: string;
    terms: string;
    paymentDetails: string;
}

interface SavedClient {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
}

interface SavedProduct {
    id: string;
    name: string;
    rate: number;
    tax: number;
    description: string;
    hsn: string;
}

interface SavedCompany {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gst: string;
    logo: string;
}

interface SavedInvoice extends InvoiceData {
    id: string;
    savedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = [
    { code: "INR", symbol: "₹", label: "Indian Rupee" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
    { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
    { code: "AUD", symbol: "A$", label: "Australian Dollar" },
    { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
    { code: "JPY", symbol: "¥", label: "Japanese Yen" },
];

const PAYMENT_TERMS = [
    "Due on Receipt",
    "Net 7",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
];

const DB_NAME = "JemskyInvoice";
const DB_VERSION = 2;
const STORES = {
    invoices: "invoices",
    clients: "clients",
    products: "products",
    companies: "companies",
} as const;

const DEFAULT_INVOICE: InvoiceData = {
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyGST: "",
    companyLogo: "",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "INR",
    currencySymbol: "₹",
    paymentTerms: "Net 30",
    poNumber: "",
    hsnCode: "",
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
        },
    ],
    notes: "",
    terms:
        "Payment is due within the specified payment terms. Late payments may incur additional charges.",
    paymentDetails: "",
};

// ─── IndexedDB Helpers ────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (_db) return resolve(_db);
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            Object.values(STORES).forEach((store) => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store, { keyPath: "id" });
                }
            });
        };
        req.onsuccess = (e) => {
            _db = (e.target as IDBOpenDBRequest).result;
            resolve(_db!);
        };
        req.onerror = reject;
    });
}

async function dbPut<T extends { id: string }>(
    store: string,
    obj: T
): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(obj).onsuccess = () => resolve();
        tx.onerror = reject;
    });
}

async function dbGetAll<T>(store: string): Promise<T[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = (e) => resolve((e.target as IDBRequest).result as T[]);
        req.onerror = reject;
    });
}

async function dbDelete(store: string, id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(id).onsuccess = () => resolve();
        tx.onerror = reject;
    });
}

// ─── Calculation Helpers ──────────────────────────────────────────────────────

function calcItem(item: InvoiceItem) {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const tax = Number(item.tax) || 0;
    const discount = Number(item.discount) || 0;
    const subtotal = qty * rate;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = afterDiscount * (tax / 100);
    return { subtotal, discountAmt, taxAmt, total: afterDiscount + taxAmt };
}

function calcTotals(items: InvoiceItem[]) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;
    items.forEach((item) => {
        const c = calcItem(item);
        subtotal += c.subtotal;
        totalDiscount += c.discountAmt;
        totalTax += c.taxAmt;
        grandTotal += c.total;
    });
    return { subtotal, totalDiscount, totalTax, grandTotal };
}

function fmt(sym: string, val: number) {
    return `${sym}${val.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function generateInvoiceNumber() {
    const now = new Date();
    const yr = now.getFullYear().toString().slice(2);
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${yr}${mo}-${rand}`;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

async function exportToExcel(
    currentInvoice: InvoiceData,
    currencySymbol: string
) {
    // Dynamically import SheetJS
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs" as never) as typeof import("xlsx");

    const allInvoices = await dbGetAll<SavedInvoice>(STORES.invoices);
    const allClients = await dbGetAll<SavedClient>(STORES.clients);
    const allProducts = await dbGetAll<SavedProduct>(STORES.products);

    const current: SavedInvoice = {
        ...currentInvoice,
        id: "CURRENT",
        savedAt: new Date().toISOString(),
    };
    const invoiceList = [
        current,
        ...allInvoices.filter((i) => i.id !== "CURRENT"),
    ];

    // Sheet 1 – Invoice summary
    const invoiceRows = [
        [
            "Invoice #",
            "Date",
            "Due Date",
            "PO #",
            "Client",
            "Client Company",
            "Currency",
            "HSN/SAC",
            "Subtotal",
            "Discount",
            "Tax",
            "Grand Total",
            "Saved At",
        ],
        ...invoiceList.map((inv) => {
            const t = calcTotals(inv.items || []);
            return [
                inv.invoiceNumber || "",
                inv.invoiceDate || "",
                inv.dueDate || "",
                inv.poNumber || "",
                inv.clientName || "",
                inv.clientCompany || "",
                inv.currency || "INR",
                inv.hsnCode || "",
                +t.subtotal.toFixed(2),
                +t.totalDiscount.toFixed(2),
                +t.totalTax.toFixed(2),
                +t.grandTotal.toFixed(2),
                inv.savedAt ? new Date(inv.savedAt).toLocaleString() : "",
            ];
        }),
    ];

    // Sheet 2 – Line items
    const itemRows = [
        [
            "Invoice #",
            "Item Name",
            "Description",
            "HSN/SAC",
            "Qty",
            "Rate",
            "Tax %",
            "Discount %",
            "Total",
        ],
        ...invoiceList.flatMap((inv) =>
            (inv.items || []).map((it) => {
                const c = calcItem(it);
                return [
                    inv.invoiceNumber || "",
                    it.name || "",
                    it.description || "",
                    it.hsn || "",
                    +it.quantity,
                    +it.rate,
                    +it.tax,
                    +it.discount,
                    +c.total.toFixed(2),
                ];
            })
        ),
    ];

    // Sheet 3 – Clients
    const clientRows = [
        ["Name", "Company", "Email", "Phone", "Address"],
        ...allClients.map((c) => [
            c.name || "",
            c.company || "",
            c.email || "",
            c.phone || "",
            c.address || "",
        ]),
    ];

    // Sheet 4 – Products / Services
    const productRows = [
        ["Name", "Rate", "Tax %", "HSN/SAC", "Description"],
        ...allProducts.map((p) => [
            p.name || "",
            +p.rate || 0,
            +p.tax || 0,
            p.hsn || "",
            p.description || "",
        ]),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(invoiceRows),
        "Invoices"
    );
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(itemRows),
        "Line Items"
    );
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(clientRows),
        "Clients"
    );
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(productRows),
        "Products"
    );

    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Jemsky-Invoices-${date}.xlsx`);
}

// ─── Autocomplete Hook ────────────────────────────────────────────────────────

type AcSuggestion = {
    label: string;
    sub?: string;
    onSelect: () => void;
};

function useAutocomplete() {
    const [suggestions, setSuggestions] = useState<
        Record<string, AcSuggestion[]>
    >({});

    const search = useCallback(
        async (
            field: string,
            query: string,
            type: "client" | "clientCompany" | "clientPhone" | "company" | "product",
            onFill: (val: AcSuggestion) => void
        ) => {
            if (!query.trim() || query.trim().length < 1) {
                setSuggestions((prev) => ({ ...prev, [field]: [] }));
                return;
            }
            const q = query.toLowerCase();
            let results: AcSuggestion[] = [];

            if (type === "client") {
                const clients = await dbGetAll<SavedClient>(STORES.clients);
                results = clients
                    .filter((c) => c.name?.toLowerCase().includes(q))
                    .slice(0, 6)
                    .map((c) => ({ label: c.name, sub: c.phone || c.email, onSelect: () => onFill({ label: c.name, sub: c.id, onSelect: () => { } }) }));
                // Pass full client for fill
                results = clients
                    .filter((c) => c.name?.toLowerCase().includes(q))
                    .slice(0, 6)
                    .map((c) => ({
                        label: c.name,
                        sub: c.phone || c.email || "",
                        onSelect: () => onFill({ label: JSON.stringify(c), sub: "client", onSelect: () => { } }),
                    }));
            } else if (type === "clientCompany") {
                const clients = await dbGetAll<SavedClient>(STORES.clients);
                const seen = new Set<string>();
                results = clients
                    .filter(
                        (c) =>
                            c.company?.toLowerCase().includes(q) && !seen.has(c.company) && seen.add(c.company)
                    )
                    .slice(0, 6)
                    .map((c) => ({
                        label: c.company,
                        sub: c.name || "",
                        onSelect: () => onFill({ label: c.company, sub: "company", onSelect: () => { } }),
                    }));
            } else if (type === "clientPhone") {
                const clients = await dbGetAll<SavedClient>(STORES.clients);
                results = clients
                    .filter((c) => c.phone?.includes(q))
                    .slice(0, 6)
                    .map((c) => ({
                        label: c.phone,
                        sub: c.name || "",
                        onSelect: () => onFill({ label: JSON.stringify(c), sub: "client", onSelect: () => { } }),
                    }));
            } else if (type === "company") {
                const companies = await dbGetAll<SavedCompany>(STORES.companies);
                results = companies
                    .filter((c) => c.name?.toLowerCase().includes(q))
                    .slice(0, 4)
                    .map((c) => ({
                        label: c.name,
                        sub: c.gst || "",
                        onSelect: () => onFill({ label: JSON.stringify(c), sub: "company-full", onSelect: () => { } }),
                    }));
            } else if (type === "product") {
                const products = await dbGetAll<SavedProduct>(STORES.products);
                results = products
                    .filter((p) => p.name?.toLowerCase().includes(q))
                    .slice(0, 6)
                    .map((p) => ({
                        label: p.name,
                        sub: `Rate: ${p.rate} | Tax: ${p.tax}%`,
                        onSelect: () => onFill({ label: JSON.stringify(p), sub: "product", onSelect: () => { } }),
                    }));
            }

            setSuggestions((prev) => ({ ...prev, [field]: results }));
        },
        []
    );

    const clear = useCallback((field: string) => {
        setSuggestions((prev) => ({ ...prev, [field]: [] }));
    }, []);

    return { suggestions, search, clear };
}

// ─── UI Components ────────────────────────────────────────────────────────────

function SectionHeader({
    icon: Icon,
    label,
    isDark,
}: {
    icon: React.ElementType;
    label: string;
    isDark: boolean;
}) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/12 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <span
                className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-white/40" : "text-black/40"
                    }`}
            >
                {label}
            </span>
            <div
                className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-black/6"}`}
            />
        </div>
    );
}

function Field({
    label,
    children,
    half,
    optional,
}: {
    label: string;
    children: React.ReactNode;
    half?: boolean;
    optional?: boolean;
}) {
    return (
        <div className={half ? "col-span-1" : "col-span-2"}>
            <label className="block text-[11px] font-semibold mb-1.5 opacity-50 uppercase tracking-wider">
                {label}
                {optional && (
                    <span className="ml-1 normal-case font-normal opacity-60">
                        (optional)
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

function inputCls(isDark: boolean, error?: boolean) {
    return `w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all border ${isDark
            ? "bg-white/4 border-white/8 text-white placeholder-white/20 focus:border-violet-500/60 focus:bg-white/6"
            : "bg-black/3 border-black/8 text-black placeholder-black/20 focus:border-violet-500/60 focus:bg-black/2"
        } ${error ? "border-red-500/50" : ""}`;
}

// ─── Autocomplete Input ───────────────────────────────────────────────────────

function AcInput({
    id,
    value,
    onChange,
    onSelect,
    suggestions,
    onClear,
    isDark,
    ...rest
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    onSelect: (s: AcSuggestion) => void;
    suggestions: AcSuggestion[];
    onClear: () => void;
    isDark: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const [open, setOpen] = useState(false);
    const inp = inputCls(isDark);

    useEffect(() => {
        setOpen(suggestions.length > 0);
    }, [suggestions]);

    return (
        <div className="relative">
            <input
                {...rest}
                id={id}
                value={value}
                className={inp}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => setTimeout(() => { setOpen(false); onClear(); }, 200)}
                autoComplete="off"
            />
            {open && (
                <div
                    className={`absolute z-30 top-full mt-1 w-full rounded-xl border overflow-hidden shadow-xl ${isDark
                            ? "bg-[#161618] border-white/10"
                            : "bg-white border-black/8"
                        }`}
                >
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onMouseDown={() => {
                                onSelect(s);
                                setOpen(false);
                                onClear();
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors ${isDark
                                    ? "hover:bg-white/6 text-white/70"
                                    : "hover:bg-violet-50 text-black/70"
                                }`}
                        >
                            <span className="flex-1 truncate">{s.label}</span>
                            {s.sub && (
                                <span
                                    className={`text-xs shrink-0 ${isDark ? "text-white/30" : "text-black/30"
                                        }`}
                                >
                                    {s.sub}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Notification Toast ───────────────────────────────────────────────────────

function Toast({
    msg,
    visible,
}: {
    msg: string;
    visible: boolean;
}) {
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1a1826] text-white text-sm font-medium shadow-2xl transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
        >
            {msg}
        </div>
    );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({
    isDark,
    onLoad,
    onClose,
    currencySymbol,
}: {
    isDark: boolean;
    onLoad: (inv: SavedInvoice) => void;
    onClose: () => void;
    currencySymbol: string;
}) {
    const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
    const [clients, setClients] = useState<SavedClient[]>([]);
    const [products, setProducts] = useState<SavedProduct[]>([]);
    const [tab, setTab] = useState<"invoices" | "clients" | "products">("invoices");

    useEffect(() => {
        dbGetAll<SavedInvoice>(STORES.invoices).then((d) =>
            setInvoices([...d].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()))
        );
        dbGetAll<SavedClient>(STORES.clients).then(setClients);
        dbGetAll<SavedProduct>(STORES.products).then(setProducts);
    }, []);

    const cardCls = `rounded-2xl border p-6 ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-white"
        }`;

    const tabs = [
        { id: "invoices" as const, label: "Invoices", icon: History },
        { id: "clients" as const, label: "Clients", icon: BookUser },
        { id: "products" as const, label: "Products", icon: Package },
    ];

    return (
        <div className="space-y-0">
            <div className={cardCls}>
                <div className="flex items-center justify-between mb-5">
                    <SectionHeader icon={TableProperties} label="Saved Data" isDark={isDark} />
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/6 text-white/40" : "hover:bg-black/5 text-black/40"}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-2 mb-5">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id
                                    ? "bg-violet-500 text-white"
                                    : isDark
                                        ? "bg-white/5 text-white/50 hover:bg-white/8"
                                        : "bg-black/5 text-black/50 hover:bg-black/8"
                                }`}
                        >
                            <t.icon className="w-3 h-3" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Invoices */}
                {tab === "invoices" && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {invoices.length === 0 ? (
                            <p className={`text-sm ${isDark ? "text-white/30" : "text-black/30"}`}>No saved invoices yet.</p>
                        ) : (
                            invoices.map((inv) => {
                                const t = calcTotals(inv.items || []);
                                return (
                                    <div
                                        key={inv.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isDark
                                                ? "border-white/6 bg-white/2 hover:border-white/12"
                                                : "border-black/6 bg-black/1 hover:border-black/10"
                                            }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold font-mono">
                                                {inv.invoiceNumber || "—"}
                                            </p>
                                            <p className={`text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>
                                                {inv.clientName} · {currencySymbol}
                                                {t.grandTotal.toFixed(2)} ·{" "}
                                                {new Date(inv.savedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { onLoad(inv); onClose(); }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await dbDelete(STORES.invoices, inv.id);
                                                    setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
                                                }}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                        ? "hover:bg-red-500/15 text-white/30 hover:text-red-400"
                                                        : "hover:bg-red-500/10 text-black/30 hover:text-red-500"
                                                    }`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Clients */}
                {tab === "clients" && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {clients.length === 0 ? (
                            <p className={`text-sm ${isDark ? "text-white/30" : "text-black/30"}`}>No saved clients yet.</p>
                        ) : (
                            clients.map((c) => (
                                <div
                                    key={c.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-black/1"
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{c.name}</p>
                                        <p className={`text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>
                                            {c.company} {c.phone}
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await dbDelete(STORES.clients, c.id);
                                            setClients((prev) => prev.filter((i) => i.id !== c.id));
                                        }}
                                        className={`p-1.5 rounded-lg ${isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-500/10 text-black/30 hover:text-red-500"}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Products */}
                {tab === "products" && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {products.length === 0 ? (
                            <p className={`text-sm ${isDark ? "text-white/30" : "text-black/30"}`}>No saved products yet.</p>
                        ) : (
                            products.map((p) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-black/1"
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{p.name}</p>
                                        <p className={`text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>
                                            {currencySymbol}{p.rate} · Tax: {p.tax}%
                                            {p.hsn ? ` · HSN: ${p.hsn}` : ""}
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await dbDelete(STORES.products, p.id);
                                            setProducts((prev) => prev.filter((i) => i.id !== p.id));
                                        }}
                                        className={`p-1.5 rounded-lg ${isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-500/10 text-black/30 hover:text-red-500"}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoicePage() {
    const [invoice, setInvoice] = useState<InvoiceData>(DEFAULT_INVOICE);
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPreview, setShowPreview] = useState(true);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [toast, setToast] = useState({ msg: "", visible: false });
    const printRef = useRef<HTMLDivElement>(null);
    const { suggestions, search, clear } = useAutocomplete();

    // ── Notify helper ──
    const notify = useCallback((msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2500);
    }, []);

    // ── Mount + theme ──
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("jemsky-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = saved === "dark" || (!saved && prefersDark);
        setIsDark(dark);
        if (dark) document.documentElement.classList.add("dark");

        try {
            const draft = localStorage.getItem("jemsky-invoice-draft-v2");
            if (draft) {
                setInvoice(JSON.parse(draft));
            } else {
                setInvoice((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
            }
        } catch {
            setInvoice((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
        }
    }, []);

    // ── Auto-save ──
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const autoSave = useCallback(
        debounce((...args: unknown[]) => {
            const data = args[0] as InvoiceData;
            setSaveState("saving");
            try {
                localStorage.setItem("jemsky-invoice-draft-v2", JSON.stringify(data));
                setTimeout(() => setSaveState("saved"), 400);
                setTimeout(() => setSaveState("idle"), 2000);
            } catch {
                setSaveState("idle");
            }
        }, 800),
        []
    );

    useEffect(() => {
        if (mounted) autoSave(invoice);
    }, [invoice, mounted, autoSave]);

    // ── State helpers ──
    const set = (key: keyof InvoiceData, val: unknown) =>
        setInvoice((prev) => ({ ...prev, [key]: val }));

    const setItem = (id: string, key: keyof InvoiceItem, val: unknown) =>
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === id ? { ...item, [key]: val } : item
            ),
        }));

    const addItem = () =>
        setInvoice((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    id: generateId(),
                    name: "",
                    description: "",
                    quantity: 1,
                    rate: 0,
                    tax: 0,
                    discount: 0,
                    hsn: "",
                },
            ],
        }));

    const removeItem = (id: string) =>
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.filter((i) => i.id !== id),
        }));

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("jemsky-theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
    };

    const resetDraft = () => {
        localStorage.removeItem("jemsky-invoice-draft-v2");
        setInvoice({ ...DEFAULT_INVOICE, invoiceNumber: generateInvoiceNumber() });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set("companyLogo", ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!invoice.invoiceNumber.trim()) errs.invoiceNumber = "Required";
        if (!invoice.clientName.trim()) errs.clientName = "Required";
        if (invoice.items.length === 0) errs.items = "Add at least one item";
        invoice.items.forEach((item, i) => {
            if (!item.name.trim()) errs[`item-${i}-name`] = "Required";
            if (Number(item.quantity) <= 0) errs[`item-${i}-qty`] = "Must be > 0";
            if (Number(item.rate) < 0) errs[`item-${i}-rate`] = "Must be ≥ 0";
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Save to IndexedDB ──
    const saveInvoice = async () => {
        if (!validate()) return;
        const inv: SavedInvoice = {
            ...invoice,
            id: invoice.invoiceNumber || Date.now().toString(),
            savedAt: new Date().toISOString(),
            items: invoice.items.map((i) => ({ ...i })),
        };
        await dbPut(STORES.invoices, inv);

        if (invoice.clientName) {
            const client: SavedClient = {
                id: invoice.clientEmail || invoice.clientPhone || invoice.clientName,
                name: invoice.clientName,
                company: invoice.clientCompany,
                email: invoice.clientEmail,
                phone: invoice.clientPhone,
                address: invoice.clientAddress,
            };
            await dbPut(STORES.clients, client);
        }

        if (invoice.companyName) {
            const co: SavedCompany = {
                id: invoice.companyEmail || invoice.companyName,
                name: invoice.companyName,
                email: invoice.companyEmail,
                phone: invoice.companyPhone,
                address: invoice.companyAddress,
                gst: invoice.companyGST,
                logo: invoice.companyLogo,
            };
            await dbPut(STORES.companies, co);
        }

        for (const it of invoice.items) {
            if (it.name) {
                const prod: SavedProduct = {
                    id: it.name,
                    name: it.name,
                    rate: Number(it.rate),
                    tax: Number(it.tax),
                    description: it.description,
                    hsn: it.hsn,
                };
                await dbPut(STORES.products, prod);
            }
        }

        notify("✅ Invoice saved to history!");
    };

    // ── Autocomplete handlers ──
    const handleClientSelect = (s: AcSuggestion) => {
        if (s.sub === "client") {
            try {
                const c: SavedClient = JSON.parse(s.label);
                setInvoice((prev) => ({
                    ...prev,
                    clientName: c.name || prev.clientName,
                    clientCompany: c.company || prev.clientCompany,
                    clientEmail: c.email || prev.clientEmail,
                    clientPhone: c.phone || prev.clientPhone,
                    clientAddress: c.address || prev.clientAddress,
                }));
            } catch { }
        } else if (s.sub === "company") {
            set("clientCompany", s.label);
        }
    };

    const handleCompanySelect = (s: AcSuggestion) => {
        if (s.sub === "company-full") {
            try {
                const c: SavedCompany = JSON.parse(s.label);
                setInvoice((prev) => ({
                    ...prev,
                    companyName: c.name || prev.companyName,
                    companyEmail: c.email || prev.companyEmail,
                    companyPhone: c.phone || prev.companyPhone,
                    companyAddress: c.address || prev.companyAddress,
                    companyGST: c.gst || prev.companyGST,
                    companyLogo: c.logo || prev.companyLogo,
                }));
            } catch { }
        }
    };

    const handleProductSelect = (itemId: string, s: AcSuggestion) => {
        if (s.sub === "product") {
            try {
                const p: SavedProduct = JSON.parse(s.label);
                setInvoice((prev) => ({
                    ...prev,
                    items: prev.items.map((it) =>
                        it.id === itemId
                            ? {
                                ...it,
                                name: p.name,
                                rate: p.rate,
                                tax: p.tax,
                                description: p.description || it.description,
                                hsn: p.hsn || it.hsn,
                            }
                            : it
                    ),
                }));
            } catch { }
        }
    };

    const handleDownload = () => {
        if (!validate()) return;
        window.print();
    };

    const handleExcelExport = async () => {
        try {
            await exportToExcel(invoice, invoice.currencySymbol);
            notify("⬇ Excel exported!");
        } catch {
            notify("❌ Excel export failed. Check console.");
        }
    };

    const loadInvoice = (inv: SavedInvoice) => {
        setInvoice(inv);
        setShowHistory(false);
        notify("📂 Invoice loaded!");
    };

    const totals = calcTotals(invoice.items);
    const sym = invoice.currencySymbol;

    if (!mounted) return null;

    const inp = (error?: boolean) => inputCls(isDark, error);
    const cardCls = `rounded-2xl border p-6 mb-4 ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-white"
        }`;

    return (
        <>
            {/* Print styles */}
            <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print {
            position: fixed !important;
            inset: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background: white !important;
            color: black !important;
            padding: 12mm 14mm !important;
            font-family: 'Sora', sans-serif !important;
          }
          @page { size: A4; margin: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            <div
                className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0c0c0e] text-[#f0ede8]" : "bg-[#f0eff9] text-[#1a1a1a]"
                    }`}
            >
                {/* ─── Top bar ─────────────────────────────────────────────────── */}
                <header
                    className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${isDark
                            ? "border-white/5 bg-[#0c0c0e]/85"
                            : "border-black/5 bg-[#f0eff9]/85"
                        }`}
                >
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/"
                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                        ? "hover:bg-white/6 text-white/40 hover:text-white/80"
                                        : "hover:bg-black/5 text-black/40 hover:text-black/80"
                                    }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div className="h-4 w-px bg-current opacity-10" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                                    <FileText className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-bold text-sm bg-linear-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">
                                    Jemsky Invoice
                                </span>
                            </div>
                            {invoice.invoiceNumber && (
                                <>
                                    <span className={`text-xs ${isDark ? "text-white/20" : "text-black/20"}`}>/</span>
                                    <span className={`text-xs font-mono ${isDark ? "text-white/40" : "text-black/40"}`}>
                                        {invoice.invoiceNumber}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Save indicator */}
                            <div
                                className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${saveState === "saved"
                                        ? "text-emerald-500 bg-emerald-500/10"
                                        : saveState === "saving"
                                            ? isDark ? "text-white/30 bg-white/4" : "text-black/30 bg-black/4"
                                            : "bg-transparent"
                                    }`}
                            >
                                {saveState === "saved" ? (
                                    <><CheckCircle2 className="w-3 h-3" /> Saved</>
                                ) : saveState === "saving" ? (
                                    <><Save className="w-3 h-3 animate-pulse" /> Saving…</>
                                ) : null}
                            </div>

                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${isDark
                                        ? "hover:bg-white/6 text-white/30 hover:text-white/60"
                                        : "hover:bg-black/5 text-black/30 hover:text-black/60"
                                    }`}
                                title="History"
                            >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-xs">History</span>
                            </button>

                            <button
                                onClick={handleExcelExport}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${isDark
                                        ? "hover:bg-white/6 text-white/30 hover:text-white/60"
                                        : "hover:bg-black/5 text-black/30 hover:text-black/60"
                                    }`}
                                title="Export Excel"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-xs">Excel</span>
                            </button>

                            <button
                                onClick={resetDraft}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${isDark
                                        ? "hover:bg-white/6 text-white/30 hover:text-white/60"
                                        : "hover:bg-black/5 text-black/30 hover:text-black/60"
                                    }`}
                                title="Reset draft"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-xs">Reset</span>
                            </button>

                            <button
                                onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
                                className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                        ? "bg-white/6 text-white/60 hover:bg-white/10"
                                        : "bg-black/5 text-black/60 hover:bg-black/8"
                                    }`}
                            >
                                {activeTab === "form" ? (
                                    <><Eye className="w-3.5 h-3.5" /> Preview</>
                                ) : (
                                    <><EyeOff className="w-3.5 h-3.5" /> Edit</>
                                )}
                            </button>

                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark
                                        ? "bg-white/6 text-white/60 hover:bg-white/10"
                                        : "bg-black/5 text-black/60 hover:bg-black/8"
                                    }`}
                            >
                                {showPreview ? (
                                    <><EyeOff className="w-3.5 h-3.5" /> Hide Preview</>
                                ) : (
                                    <><Eye className="w-3.5 h-3.5" /> Show Preview</>
                                )}
                            </button>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors ${isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white/50"
                                        : "bg-black/5 hover:bg-black/8 text-black/50"
                                    }`}
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-px"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* ─── Body ────────────────────────────────────────────────────── */}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
                    <div
                        className={`flex gap-6 ${showPreview ? "md:grid md:grid-cols-[1fr_420px]" : ""
                            }`}
                    >
                        {/* ═══ FORM / HISTORY PANEL ══════════════════════════════════ */}
                        <div
                            className={`flex-1 min-w-0 space-y-0 ${activeTab === "preview" ? "hidden md:block" : ""
                                }`}
                        >
                            {/* History panel (overlay) */}
                            {showHistory && (
                                <HistoryPanel
                                    isDark={isDark}
                                    onLoad={loadInvoice}
                                    onClose={() => setShowHistory(false)}
                                    currencySymbol={sym}
                                />
                            )}

                            {!showHistory && (
                                <>
                                    {/* ── Company ── */}
                                    <div className={cardCls}>
                                        <SectionHeader icon={Building2} label="Your Company" isDark={isDark} />
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Logo upload */}
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-semibold mb-1.5 opacity-50 uppercase tracking-wider">
                                                    Company Logo
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    {invoice.companyLogo ? (
                                                        <div className="relative">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={invoice.companyLogo}
                                                                alt="Logo"
                                                                className="w-16 h-16 object-contain rounded-xl border border-white/10"
                                                            />
                                                            <button
                                                                onClick={() => set("companyLogo", "")}
                                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                                                            >
                                                                <X className="w-3 h-3 text-white" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label
                                                            className={`flex items-center justify-center gap-2 w-16 h-16 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${isDark
                                                                    ? "border-white/12 hover:border-violet-500/40 hover:bg-violet-500/5"
                                                                    : "border-black/12 hover:border-violet-500/40 hover:bg-violet-500/5"
                                                                }`}
                                                        >
                                                            <ImagePlus className="w-5 h-5 text-violet-400" />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={handleLogoUpload}
                                                            />
                                                        </label>
                                                    )}
                                                    <div className={`text-xs ${isDark ? "text-white/30" : "text-black/30"}`}>
                                                        <p>Upload your logo</p>
                                                        <p>PNG, JPG, SVG up to 2MB</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Field label="Company Name" half>
                                                <AcInput
                                                    id="companyName"
                                                    value={invoice.companyName}
                                                    onChange={(v) => {
                                                        set("companyName", v);
                                                        search("companyName", v, "company", handleCompanySelect);
                                                    }}
                                                    onSelect={handleCompanySelect}
                                                    suggestions={suggestions["companyName"] || []}
                                                    onClear={() => clear("companyName")}
                                                    isDark={isDark}
                                                    placeholder="Jemsky Technologies"
                                                />
                                            </Field>
                                            <Field label="GST / VAT Number" half>
                                                <input
                                                    className={inp()}
                                                    placeholder="27XXXXX1234X1Z5"
                                                    value={invoice.companyGST}
                                                    onChange={(e) => set("companyGST", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Email" half>
                                                <input
                                                    className={inp()}
                                                    type="email"
                                                    placeholder="hello@jemsky.com"
                                                    value={invoice.companyEmail}
                                                    onChange={(e) => set("companyEmail", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Phone" half>
                                                <input
                                                    className={inp()}
                                                    placeholder="+91 98765 43210"
                                                    value={invoice.companyPhone}
                                                    onChange={(e) => set("companyPhone", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Address">
                                                <textarea
                                                    className={`${inp()} resize-none`}
                                                    rows={2}
                                                    placeholder="123 Business Park, Mumbai 400001"
                                                    value={invoice.companyAddress}
                                                    onChange={(e) => set("companyAddress", e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    {/* ── Client ── */}
                                    <div className={cardCls}>
                                        <SectionHeader icon={User} label="Bill To" isDark={isDark} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Client Name *" half>
                                                <AcInput
                                                    id="clientName"
                                                    value={invoice.clientName}
                                                    onChange={(v) => {
                                                        set("clientName", v);
                                                        setErrors((p) => ({ ...p, clientName: "" }));
                                                        search("clientName", v, "client", handleClientSelect);
                                                    }}
                                                    onSelect={handleClientSelect}
                                                    suggestions={suggestions["clientName"] || []}
                                                    onClear={() => clear("clientName")}
                                                    isDark={isDark}
                                                    placeholder="Rajesh Kumar"
                                                    className={errors.clientName ? "border-red-500/50" : ""}
                                                />
                                                {errors.clientName && (
                                                    <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {errors.clientName}
                                                    </p>
                                                )}
                                            </Field>
                                            <Field label="Company Name" half>
                                                <AcInput
                                                    id="clientCompany"
                                                    value={invoice.clientCompany}
                                                    onChange={(v) => {
                                                        set("clientCompany", v);
                                                        search("clientCompany", v, "clientCompany", handleClientSelect);
                                                    }}
                                                    onSelect={(s) => set("clientCompany", s.label)}
                                                    suggestions={suggestions["clientCompany"] || []}
                                                    onClear={() => clear("clientCompany")}
                                                    isDark={isDark}
                                                    placeholder="Acme Corp Pvt. Ltd."
                                                />
                                            </Field>
                                            <Field label="Email" half>
                                                <input
                                                    className={inp()}
                                                    type="email"
                                                    placeholder="rajesh@acme.in"
                                                    value={invoice.clientEmail}
                                                    onChange={(e) => set("clientEmail", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Phone" half>
                                                <AcInput
                                                    id="clientPhone"
                                                    value={invoice.clientPhone}
                                                    onChange={(v) => {
                                                        set("clientPhone", v);
                                                        search("clientPhone", v, "clientPhone", handleClientSelect);
                                                    }}
                                                    onSelect={handleClientSelect}
                                                    suggestions={suggestions["clientPhone"] || []}
                                                    onClear={() => clear("clientPhone")}
                                                    isDark={isDark}
                                                    placeholder="+91 99887 76655"
                                                />
                                            </Field>
                                            <Field label="Billing Address">
                                                <textarea
                                                    className={`${inp()} resize-none`}
                                                    rows={2}
                                                    placeholder="456 Client Street, Delhi 110001"
                                                    value={invoice.clientAddress}
                                                    onChange={(e) => set("clientAddress", e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    {/* ── Invoice Meta ── */}
                                    <div className={cardCls}>
                                        <SectionHeader icon={Hash} label="Invoice Details" isDark={isDark} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Invoice Number *" half>
                                                <div className="flex gap-2">
                                                    <input
                                                        className={`${inp(!!errors.invoiceNumber)} flex-1 font-mono`}
                                                        placeholder="INV-2405-001"
                                                        value={invoice.invoiceNumber}
                                                        onChange={(e) => {
                                                            set("invoiceNumber", e.target.value);
                                                            setErrors((p) => ({ ...p, invoiceNumber: "" }));
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => set("invoiceNumber", generateInvoiceNumber())}
                                                        className={`px-2.5 rounded-xl text-xs transition-colors shrink-0 ${isDark
                                                                ? "bg-white/6 hover:bg-white/10 text-white/50"
                                                                : "bg-black/5 hover:bg-black/8 text-black/50"
                                                            }`}
                                                        title="Generate new number"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {errors.invoiceNumber && (
                                                    <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {errors.invoiceNumber}
                                                    </p>
                                                )}
                                            </Field>

                                            {/* Currency */}
                                            <Field label="Currency" half>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setCurrencyOpen(!currencyOpen)}
                                                        className={`${inp()} flex items-center justify-between text-left`}
                                                    >
                                                        <span>
                                                            {invoice.currencySymbol} — {invoice.currency}
                                                        </span>
                                                        <ChevronDown
                                                            className={`w-4 h-4 opacity-40 transition-transform ${currencyOpen ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </button>
                                                    {currencyOpen && (
                                                        <div
                                                            className={`absolute z-20 top-full mt-1 w-full rounded-xl border overflow-hidden shadow-xl ${isDark
                                                                    ? "bg-[#161618] border-white/10"
                                                                    : "bg-white border-black/8"
                                                                }`}
                                                        >
                                                            {CURRENCIES.map((c) => (
                                                                <button
                                                                    key={c.code}
                                                                    onClick={() => {
                                                                        set("currency", c.code);
                                                                        set("currencySymbol", c.symbol);
                                                                        setCurrencyOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${invoice.currency === c.code
                                                                            ? "text-violet-500 bg-violet-500/8"
                                                                            : isDark
                                                                                ? "hover:bg-white/4 text-white/70"
                                                                                : "hover:bg-black/3 text-black/70"
                                                                        }`}
                                                                >
                                                                    <span className="font-mono font-bold w-6">
                                                                        {c.symbol}
                                                                    </span>
                                                                    <span>{c.code}</span>
                                                                    <span
                                                                        className={`text-xs ml-auto ${isDark ? "text-white/30" : "text-black/30"
                                                                            }`}
                                                                    >
                                                                        {c.label}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Field>

                                            <Field label="Invoice Date" half>
                                                <input
                                                    className={inp()}
                                                    type="date"
                                                    value={invoice.invoiceDate}
                                                    onChange={(e) => set("invoiceDate", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Due Date" half>
                                                <input
                                                    className={inp()}
                                                    type="date"
                                                    value={invoice.dueDate}
                                                    onChange={(e) => set("dueDate", e.target.value)}
                                                />
                                            </Field>

                                            {/* Payment Terms */}
                                            <Field label="Payment Terms" half>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setTermsOpen(!termsOpen)}
                                                        className={`${inp()} flex items-center justify-between text-left`}
                                                    >
                                                        <span>{invoice.paymentTerms}</span>
                                                        <ChevronDown
                                                            className={`w-4 h-4 opacity-40 transition-transform ${termsOpen ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </button>
                                                    {termsOpen && (
                                                        <div
                                                            className={`absolute z-20 top-full mt-1 w-full rounded-xl border overflow-hidden shadow-xl ${isDark
                                                                    ? "bg-[#161618] border-white/10"
                                                                    : "bg-white border-black/8"
                                                                }`}
                                                        >
                                                            {PAYMENT_TERMS.map((t) => (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => {
                                                                        set("paymentTerms", t);
                                                                        setTermsOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${invoice.paymentTerms === t
                                                                            ? "text-violet-500 bg-violet-500/8"
                                                                            : isDark
                                                                                ? "hover:bg-white/4 text-white/70"
                                                                                : "hover:bg-black/3 text-black/70"
                                                                        }`}
                                                                >
                                                                    {t}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Field>

                                            <Field label="PO / Reference #" half optional>
                                                <input
                                                    className={inp()}
                                                    placeholder="PO-2024-XYZ"
                                                    value={invoice.poNumber}
                                                    onChange={(e) => set("poNumber", e.target.value)}
                                                />
                                            </Field>

                                            <Field label="HSN / SAC Code" half optional>
                                                <input
                                                    className={inp()}
                                                    placeholder="e.g. 998314 (IT services)"
                                                    value={invoice.hsnCode}
                                                    onChange={(e) => set("hsnCode", e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    {/* ── Line Items ── */}
                                    <div className={cardCls}>
                                        <SectionHeader icon={FileText} label="Line Items" isDark={isDark} />

                                        {errors.items && (
                                            <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.items}
                                            </p>
                                        )}

                                        {/* Table header */}
                                        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_36px] gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider opacity-40 px-1">
                                            <span>Item</span>
                                            <span>Qty</span>
                                            <span>Rate ({sym})</span>
                                            <span>Tax %</span>
                                            <span>Disc %</span>
                                            <span className="text-right">Total</span>
                                            <span />
                                        </div>

                                        <div className="space-y-3">
                                            {invoice.items.map((item, idx) => {
                                                const c = calcItem(item);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`rounded-xl border p-3 transition-all ${isDark
                                                                ? "border-white/6 bg-white/2 hover:border-white/10"
                                                                : "border-black/6 bg-black/1 hover:border-black/10"
                                                            }`}
                                                    >
                                                        <div className={`sm:hidden text-[10px] font-bold uppercase tracking-widest mb-2 opacity-40`}>
                                                            Item {idx + 1}
                                                        </div>

                                                        {/* Row 1 */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_36px] gap-2 items-start">
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <AcInput
                                                                    id={`item-name-${item.id}`}
                                                                    value={item.name}
                                                                    onChange={(v) => {
                                                                        setItem(item.id, "name", v);
                                                                        setErrors((p) => ({ ...p, [`item-${idx}-name`]: "" }));
                                                                        search(
                                                                            `item-${item.id}`,
                                                                            v,
                                                                            "product",
                                                                            (s) => handleProductSelect(item.id, s)
                                                                        );
                                                                    }}
                                                                    onSelect={(s) => handleProductSelect(item.id, s)}
                                                                    suggestions={suggestions[`item-${item.id}`] || []}
                                                                    onClear={() => clear(`item-${item.id}`)}
                                                                    isDark={isDark}
                                                                    placeholder="Service or product name"
                                                                    className={errors[`item-${idx}-name`] ? "border-red-500/50" : ""}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="sm:hidden block text-[10px] mb-1 opacity-40">Qty</label>
                                                                <input
                                                                    className={`${inp(!!errors[`item-${idx}-qty`])} text-center`}
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => setItem(item.id, "quantity", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="sm:hidden block text-[10px] mb-1 opacity-40">Rate</label>
                                                                <input
                                                                    className={`${inp()} text-right`}
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    value={item.rate}
                                                                    onChange={(e) => setItem(item.id, "rate", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="sm:hidden block text-[10px] mb-1 opacity-40">Tax %</label>
                                                                <input
                                                                    className={`${inp()} text-center`}
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    placeholder="18"
                                                                    value={item.tax}
                                                                    onChange={(e) => setItem(item.id, "tax", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="sm:hidden block text-[10px] mb-1 opacity-40">Disc %</label>
                                                                <input
                                                                    className={`${inp()} text-center`}
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    placeholder="0"
                                                                    value={item.discount}
                                                                    onChange={(e) => setItem(item.id, "discount", e.target.value)}
                                                                />
                                                            </div>
                                                            <div
                                                                className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-right ${isDark
                                                                        ? "bg-violet-500/8 text-violet-300"
                                                                        : "bg-violet-500/8 text-violet-700"
                                                                    }`}
                                                            >
                                                                {fmt(sym, c.total)}
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    invoice.items.length > 1 && removeItem(item.id)
                                                                }
                                                                className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors ${invoice.items.length === 1
                                                                        ? "opacity-20 cursor-not-allowed"
                                                                        : isDark
                                                                            ? "hover:bg-red-500/15 text-white/30 hover:text-red-400"
                                                                            : "hover:bg-red-500/10 text-black/30 hover:text-red-500"
                                                                    }`}
                                                                disabled={invoice.items.length === 1}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Row 2: description + HSN */}
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <input
                                                                className={`${inp()} text-xs`}
                                                                placeholder="Optional description…"
                                                                value={item.description}
                                                                onChange={(e) =>
                                                                    setItem(item.id, "description", e.target.value)
                                                                }
                                                            />
                                                            <input
                                                                className={`${inp()} text-xs`}
                                                                placeholder="HSN / SAC code (optional)"
                                                                value={item.hsn}
                                                                onChange={(e) =>
                                                                    setItem(item.id, "hsn", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={addItem}
                                            className={`mt-3 w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                                                    ? "border-white/10 text-white/30 hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/4"
                                                    : "border-black/10 text-black/30 hover:border-violet-500/30 hover:text-violet-600 hover:bg-violet-500/4"
                                                }`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Line Item
                                        </button>

                                        {/* Totals */}
                                        <div
                                            className={`mt-5 ml-auto w-full sm:w-80 rounded-xl border p-4 space-y-2 ${isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-black/2"
                                                }`}
                                        >
                                            <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
                                                <span>Subtotal</span>
                                                <span>{fmt(sym, totals.subtotal)}</span>
                                            </div>
                                            {totals.totalDiscount > 0 && (
                                                <div className="flex justify-between text-sm text-emerald-500">
                                                    <span>Discount</span>
                                                    <span>− {fmt(sym, totals.totalDiscount)}</span>
                                                </div>
                                            )}
                                            {totals.totalTax > 0 && (
                                                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
                                                    <span>Tax</span>
                                                    <span>+ {fmt(sym, totals.totalTax)}</span>
                                                </div>
                                            )}
                                            <div
                                                className={`flex justify-between font-bold text-base pt-2 border-t ${isDark ? "border-white/8" : "border-black/8"
                                                    }`}
                                            >
                                                <span>Grand Total</span>
                                                <span className="text-violet-500">
                                                    {fmt(sym, totals.grandTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Additional Info ── */}
                                    <div className={cardCls}>
                                        <SectionHeader icon={StickyNote} label="Additional Info" isDark={isDark} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Notes (visible on invoice)">
                                                <textarea
                                                    className={`${inp()} resize-none`}
                                                    rows={3}
                                                    placeholder="Thank you for your business!"
                                                    value={invoice.notes}
                                                    onChange={(e) => set("notes", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Terms & Conditions">
                                                <textarea
                                                    className={`${inp()} resize-none`}
                                                    rows={3}
                                                    value={invoice.terms}
                                                    onChange={(e) => set("terms", e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Payment Details / Bank Info">
                                                <textarea
                                                    className={`${inp()} resize-none`}
                                                    rows={3}
                                                    placeholder="Account: XXXX, IFSC: SBIN0001234, UPI: pay@jemsky"
                                                    value={invoice.paymentDetails}
                                                    onChange={(e) => set("paymentDetails", e.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    {/* Bottom actions */}
                                    <div className="flex justify-end gap-3 pb-8">
                                        <button
                                            onClick={resetDraft}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark
                                                    ? "border-white/8 hover:bg-white/4 text-white/50"
                                                    : "border-black/8 hover:bg-black/4 text-black/50"
                                                }`}
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={saveInvoice}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark
                                                    ? "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                                                    : "border-violet-500/30 text-violet-600 hover:bg-violet-500/8"
                                                }`}
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Invoice
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ═══ PREVIEW PANEL ════════════════════════════════════════ */}
                        {(showPreview || activeTab === "preview") && (
                            <div
                                className={`${activeTab === "form" ? "hidden md:block" : ""
                                    } md:sticky md:top-[72px] md:self-start`}
                            >
                                <div
                                    className={`text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-white/30" : "text-black/30"
                                        }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Live Preview
                                </div>

                                {/* Printable invoice */}
                                <div
                                    id="invoice-print"
                                    ref={printRef}
                                    className="w-full bg-white text-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden"
                                    style={{ fontFamily: "var(--font-sora, sans-serif)", minHeight: 600 }}
                                >
                                    {/* Invoice header */}
                                    <div className="bg-linear-to-br from-violet-600 to-violet-800 px-8 pt-8 pb-6 text-white">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                {invoice.companyLogo ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={invoice.companyLogo}
                                                        alt="Logo"
                                                        className="h-10 w-auto object-contain mb-3 rounded"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                                                        <FileText className="w-5 h-5 text-white/70" />
                                                    </div>
                                                )}
                                                <p className="font-bold text-lg leading-tight">
                                                    {invoice.companyName || "Your Company"}
                                                </p>
                                                {invoice.companyGST && (
                                                    <p className="text-white/60 text-xs mt-0.5">
                                                        GST: {invoice.companyGST}
                                                    </p>
                                                )}
                                                {invoice.companyEmail && (
                                                    <p className="text-white/60 text-xs">{invoice.companyEmail}</p>
                                                )}
                                                {invoice.companyPhone && (
                                                    <p className="text-white/60 text-xs">{invoice.companyPhone}</p>
                                                )}
                                                {invoice.companyAddress && (
                                                    <p className="text-white/60 text-xs mt-1 max-w-[160px] leading-relaxed">
                                                        {invoice.companyAddress}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">
                                                    Invoice
                                                </p>
                                                <p className="font-bold text-xl font-mono">
                                                    {invoice.invoiceNumber || "—"}
                                                </p>
                                                {invoice.invoiceDate && (
                                                    <p className="text-white/60 text-xs mt-2">
                                                        Date:{" "}
                                                        {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                )}
                                                {invoice.dueDate && (
                                                    <p className="text-white/60 text-xs">
                                                        Due:{" "}
                                                        {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                )}
                                                {invoice.paymentTerms && (
                                                    <p className="text-white/50 text-xs mt-1">
                                                        {invoice.paymentTerms}
                                                    </p>
                                                )}
                                                {invoice.poNumber && (
                                                    <p className="text-white/50 text-xs">PO: {invoice.poNumber}</p>
                                                )}
                                                {invoice.hsnCode && (
                                                    <p className="text-white/50 text-xs">HSN/SAC: {invoice.hsnCode}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bill to */}
                                    <div className="px-8 py-5 bg-violet-50/60 border-b border-violet-100">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">
                                            Bill To
                                        </p>
                                        <p className="font-bold text-sm">
                                            {invoice.clientName || "Client Name"}
                                        </p>
                                        {invoice.clientCompany && (
                                            <p className="text-xs text-gray-500">{invoice.clientCompany}</p>
                                        )}
                                        {invoice.clientEmail && (
                                            <p className="text-xs text-gray-500">{invoice.clientEmail}</p>
                                        )}
                                        {invoice.clientPhone && (
                                            <p className="text-xs text-gray-500">{invoice.clientPhone}</p>
                                        )}
                                        {invoice.clientAddress && (
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {invoice.clientAddress}
                                            </p>
                                        )}
                                    </div>

                                    {/* Items table */}
                                    <div className="px-8 py-5">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b-2 border-violet-100">
                                                    <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 pr-3">
                                                        Item
                                                    </th>
                                                    <th className="text-center pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-10">
                                                        Qty
                                                    </th>
                                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">
                                                        Rate
                                                    </th>
                                                    <th className="text-center pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-12">
                                                        Tax
                                                    </th>
                                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {invoice.items.map((item) => {
                                                    const c = calcItem(item);
                                                    return (
                                                        <tr key={item.id}>
                                                            <td className="py-2.5 pr-3">
                                                                <p className="font-semibold text-gray-800">
                                                                    {item.name || (
                                                                        <span className="text-gray-300 italic">
                                                                            Unnamed item
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {item.description && (
                                                                    <p className="text-gray-400 text-[10px] mt-0.5">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                                {item.hsn && (
                                                                    <p className="text-gray-400 text-[10px]">
                                                                        HSN/SAC: {item.hsn}
                                                                    </p>
                                                                )}
                                                                {Number(item.discount) > 0 && (
                                                                    <p className="text-emerald-500 text-[10px]">
                                                                        {item.discount}% discount applied
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 text-center text-gray-600">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="py-2.5 text-right text-gray-600">
                                                                {fmt(sym, Number(item.rate))}
                                                            </td>
                                                            <td className="py-2.5 text-center text-gray-600">
                                                                {item.tax}%
                                                            </td>
                                                            <td className="py-2.5 text-right font-semibold text-violet-700">
                                                                {fmt(sym, c.total)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="px-8 pb-5">
                                        <div className="ml-auto w-52 space-y-1.5">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Subtotal</span>
                                                <span>{fmt(sym, totals.subtotal)}</span>
                                            </div>
                                            {totals.totalDiscount > 0 && (
                                                <div className="flex justify-between text-xs text-emerald-600">
                                                    <span>Discount</span>
                                                    <span>− {fmt(sym, totals.totalDiscount)}</span>
                                                </div>
                                            )}
                                            {totals.totalTax > 0 && (
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Tax</span>
                                                    <span>+ {fmt(sym, totals.totalTax)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-violet-200">
                                                <span>Total</span>
                                                <span className="text-violet-700">
                                                    {fmt(sym, totals.grandTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes / Terms / Payment */}
                                    {(invoice.notes || invoice.terms || invoice.paymentDetails) && (
                                        <div className="px-8 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                                            {invoice.notes && (
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">
                                                        Notes
                                                    </p>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        {invoice.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {invoice.paymentDetails && (
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">
                                                        Payment Details
                                                    </p>
                                                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                                                        {invoice.paymentDetails}
                                                    </p>
                                                </div>
                                            )}
                                            {invoice.terms && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">
                                                        Terms & Conditions
                                                    </p>
                                                    <p className="text-xs text-gray-400 leading-relaxed">
                                                        {invoice.terms}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-[10px] text-gray-300">
                                            Generated by Jemsky Invoice · jemsky.com
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                                                <FileText className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-violet-600">
                                                Jemsky
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview actions */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={saveInvoice}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${isDark
                                                ? "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                                                : "border-violet-500/30 text-violet-600 hover:bg-violet-500/8"
                                            }`}
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast notification */}
            <Toast msg={toast.msg} visible={toast.visible} />
        </>
    );
}