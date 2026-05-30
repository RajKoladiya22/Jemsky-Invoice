import React from "react";
import type { InvoiceData, InvoiceItem } from "../../types";
import { fmt, calcItem } from "../../pages/Invoice/components/calculation";
import { FileText, Award, Layers, Zap } from "lucide-react";

interface TemplateProps {
  invoice: InvoiceData;
  qrCodeUrl?: string;
  isDark?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 1. MINIMAL TEMPLATE
// ─────────────────────────────────────────────────────────────
export const MinimalTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#000000";
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;
  
  return (
    <div 
      className="p-8 bg-white text-[#1a1a1a]" 
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight">{invoice.companyName || "Seller Name"}</h2>
          <p className="text-xs text-gray-500 max-w-[220px] whitespace-pre-line leading-relaxed">{invoice.companyAddress}</p>
          {invoice.companyGST && <p className="text-xs font-semibold text-gray-700 mt-1">GSTIN: {invoice.companyGST}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-light tracking-widest text-gray-400">INVOICE</h1>
          <p className="text-xs font-mono font-bold mt-2">No: {invoice.invoiceNumber || "—"}</p>
          <p className="text-xs text-gray-500 mt-1">Date: {invoice.invoiceDate}</p>
          {invoice.dueDate && <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bill To</span>
          <p className="font-bold text-gray-800">{invoice.clientName || "Client Name"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1">{invoice.clientAddress}</p>
          {invoice.clientGST && <p className="font-semibold text-gray-700 mt-1">GSTIN: {invoice.clientGST}</p>}
        </div>
        {invoice.clientShippingAddress && (
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ship To</span>
            <p className="font-bold text-gray-800">{invoice.clientName || "Client Name"}</p>
            <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1">{invoice.clientShippingAddress}</p>
          </div>
        )}
      </div>

      <table className="w-full text-xs mb-8">
        <thead>
          <tr className="border-b border-gray-800 text-left font-bold text-gray-500">
            <th className="pb-2 w-8">#</th>
            <th className="pb-2">Description</th>
            <th className="pb-2 text-center w-12">Qty</th>
            <th className="pb-2 text-right w-20">Rate</th>
            {invoice.templateConfig?.layout.columnVisibility.discount && (
              <th className="pb-2 text-center w-12">Disc %</th>
            )}
            <th className="pb-2 text-right w-24">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-top">
                <td className="py-2.5 text-gray-400">{idx + 1}</td>
                <td className="py-2.5 pr-2">
                  <p className="font-semibold text-gray-800">{item.name || "Unnamed Item"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
                </td>
                <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-600">{fmt(sym, Number(item.rate))}</td>
                {invoice.templateConfig?.layout.columnVisibility.discount && (
                  <td className="py-2.5 text-center text-gray-600">
                    {Number(item.discount) > 0 ? `${item.discount}%` : "—"}
                  </td>
                )}
                <td className="py-2.5 text-right font-semibold text-gray-800">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start pt-4 text-xs">
        <div className="max-w-[320px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3">
              <img src={qrCodeUrl} alt="UPI QR" className="w-20 h-20 border border-gray-100 p-0.5 rounded" />
              <div>
                <p className="font-bold text-gray-800 text-[10px] uppercase tracking-wide">UPI Payment</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Scan QR code using any UPI App to make secure payment.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bank Information</span>
              <p className="text-gray-500 whitespace-pre-line leading-relaxed font-mono text-[10px]">{invoice.paymentDetails}</p>
            </div>
          )}
        </div>

        <div className="w-56 space-y-1.5 text-right">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{fmt(sym, invoice.taxableAmount + (invoice.invoiceDiscountAmount || 0))}</span>
          </div>
          {invoice.invoiceDiscountAmount ? (
            <div className="flex justify-between text-emerald-600">
              <span>Inv Discount ({invoice.invoiceDiscountPercent}%)</span>
              <span>− {fmt(sym, invoice.invoiceDiscountAmount)}</span>
            </div>
          ) : null}
          {invoice.totalTax ? (
            <div className="flex justify-between text-gray-500">
              <span>GST Total</span><span>{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : null}
          {invoice.shippingCharges ? (
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span><span>{fmt(sym, invoice.shippingCharges)}</span>
            </div>
          ) : null}
          {invoice.additionalCharges ? (
            <div className="flex justify-between text-gray-500">
              <span>Additional</span><span>{fmt(sym, invoice.additionalCharges)}</span>
            </div>
          ) : null}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-500 text-[10px] italic">
              <span>Round Off</span><span>{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-300 text-gray-800">
            <span>Grand Total</span><span>{fmt(sym, invoice.grandTotal)}</span>
          </div>
          {invoice.oldPurchaseAmount ? (
            <>
              <div className="flex justify-between text-gray-500">
                <span>Old Metal Credit</span><span>− {fmt(sym, invoice.oldPurchaseAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-red-600">
                <span>Amount Due</span><span>{fmt(sym, invoice.dueAmount)}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 mt-12 text-[10px] text-gray-400 leading-relaxed">
        {invoice.terms && <p className="mb-2"><strong>Terms:</strong> {invoice.terms}</p>}
        {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. MODERN TEMPLATE
// ─────────────────────────────────────────────────────────────
export const ModernTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#6d28d9";
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="bg-white text-gray-800 rounded-2xl shadow-xl overflow-hidden text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      {/* Header Accent Band */}
      <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
      
      <div className="p-8">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            {invoice.companyLogo ? (
              <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-3 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-violet-50">
                <FileText className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900">{invoice.companyName || "Your Company"}</h2>
            <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1 max-w-[200px]">{invoice.companyAddress}</p>
            {invoice.companyGST && <p className="text-gray-500 font-medium mt-1">GSTIN: {invoice.companyGST}</p>}
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              {invoice.templateCategory?.toUpperCase() || "TAX INVOICE"}
            </span>
            <h1 className="text-xl font-bold font-mono mt-2" style={{ color: primaryColor }}>{invoice.invoiceNumber || "—"}</h1>
            <div className="mt-3 space-y-1 text-gray-500">
              <p>Date: <span className="font-semibold text-gray-800">{invoice.invoiceDate}</span></p>
              {invoice.dueDate && <p>Due: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
              {invoice.poNumber && <p>PO: <span className="font-semibold text-gray-800">{invoice.poNumber}</span></p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50/70 border border-gray-100 mb-8">
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Bill To</h4>
            <p className="font-bold text-gray-900">{invoice.clientName || "Client Name"}</p>
            {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
            <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1">{invoice.clientAddress}</p>
            {invoice.clientGST && <p className="text-gray-700 font-semibold mt-1">GST: {invoice.clientGST}</p>}
          </div>
          {invoice.clientShippingAddress && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Ship To</h4>
              <p className="font-bold text-gray-900">{invoice.clientName || "Client Name"}</p>
              <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1">{invoice.clientShippingAddress}</p>
            </div>
          )}
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-100 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
              <th className="pb-3 w-8 text-center">#</th>
              <th className="pb-3">Item details</th>
              {invoice.templateConfig?.layout.columnVisibility.hsn && <th className="pb-3 w-16">HSN/SAC</th>}
              <th className="pb-3 text-center w-12">Qty</th>
              <th className="pb-3 text-right w-20">Rate</th>
              {invoice.templateConfig?.layout.columnVisibility.discount && <th className="pb-3 text-center w-12">Disc</th>}
              {invoice.templateConfig?.layout.columnVisibility.tax && invoice.taxMode === "item" && <th className="pb-3 text-center w-12">GST</th>}
              <th className="pb-3 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item, idx) => {
              const c = calcItem(item);
              return (
                <tr key={item.id} className="align-middle">
                  <td className="py-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                  <td className="py-3 pr-2">
                    <p className="font-semibold text-gray-900">{item.name || "Unnamed Item"}</p>
                    {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
                  </td>
                  {invoice.templateConfig?.layout.columnVisibility.hsn && <td className="py-3 font-mono text-[10px]">{item.hsn || "—"}</td>}
                  <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{fmt(sym, Number(item.rate))}</td>
                  {invoice.templateConfig?.layout.columnVisibility.discount && (
                    <td className="py-3 text-center text-gray-600">{Number(item.discount) > 0 ? `${item.discount}%` : "—"}</td>
                  )}
                  {invoice.templateConfig?.layout.columnVisibility.tax && invoice.taxMode === "item" && (
                    <td className="py-3 text-center text-gray-600">{Number(item.tax) > 0 ? `${item.tax}%` : "—"}</td>
                  )}
                  <td className="py-3 text-right font-bold text-gray-900">{fmt(sym, c.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-start gap-8 pt-4">
          <div className="flex-1 max-w-[340px] space-y-4">
            {qrCodeUrl && (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-violet-50/30 border border-violet-100/50">
                <img src={qrCodeUrl} alt="UPI QR" className="w-20 h-20 p-0.5 bg-white border border-gray-100 rounded-lg shrink-0 shadow-sm" />
                <div>
                  <p className="font-bold text-gray-950 text-[10px] uppercase tracking-wide">Instant UPI Payment</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan QR code using BHIM, GPAY, PhonePe, Paytm, or any banking app.</p>
                </div>
              </div>
            )}
            {invoice.paymentDetails && (
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Bank Settlement Details</span>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono text-[10px]">{invoice.paymentDetails}</p>
              </div>
            )}
          </div>

          <div className="w-60 bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-2.5">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Subtotal</span><span>{fmt(sym, invoice.taxableAmount + (invoice.invoiceDiscountAmount || 0))}</span>
            </div>
            {invoice.invoiceDiscountAmount ? (
              <div className="flex justify-between text-emerald-600 text-xs font-medium">
                <span>Discount ({invoice.invoiceDiscountPercent}%)</span>
                <span>− {fmt(sym, invoice.invoiceDiscountAmount)}</span>
              </div>
            ) : null}
            {invoice.totalTax ? (
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Tax total</span><span>{fmt(sym, invoice.totalTax)}</span>
              </div>
            ) : null}
            {invoice.shippingCharges ? (
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Shipping</span><span>{fmt(sym, invoice.shippingCharges)}</span>
              </div>
            ) : null}
            {invoice.additionalCharges ? (
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Additional</span><span>{fmt(sym, invoice.additionalCharges)}</span>
              </div>
            ) : null}
            {invoice.roundOff ? (
              <div className="flex justify-between text-gray-400 text-[10px] italic">
                <span>Round Off</span><span>{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-gray-200 text-gray-900">
              <span className="uppercase tracking-wider text-[10px] text-gray-400 font-bold">Grand Total</span>
              <span className="text-[15px]" style={{ color: primaryColor }}>{fmt(sym, invoice.grandTotal)}</span>
            </div>
            {invoice.oldPurchaseAmount ? (
              <>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Metal Purchase Deduct</span><span>− {fmt(sym, invoice.oldPurchaseAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-red-200 text-red-600">
                  <span>Balance Due</span><span>{fmt(sym, invoice.dueAmount)}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-8 space-y-2 text-[10px] text-gray-400 leading-relaxed">
          {invoice.terms && <p><strong>Terms:</strong> {invoice.terms}</p>}
          {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. PREMIUM TEMPLATE
// ─────────────────────────────────────────────────────────────
export const PremiumTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#0f172a"; // Slate-900 / Navy
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="bg-white text-slate-800 shadow-2xl relative border border-slate-200/50 font-serif"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, serif)` }}
    >
      {/* Decorative Gold and Dark Borders */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
      <div className="absolute top-1.5 bottom-0 left-0 w-1.5 bg-slate-900" />
      
      <div className="p-10 pl-12">
        <div className="flex justify-between items-start gap-4 border-b border-amber-200/60 pb-8 mb-8">
          <div>
            {invoice.companyLogo && (
              <img src={invoice.companyLogo} alt="Logo" className="h-12 w-auto mb-4 object-contain" />
            )}
            <h2 className="text-xl font-bold tracking-wide uppercase text-slate-900">{invoice.companyName || "Your Company"}</h2>
            <p className="text-slate-500 text-xs whitespace-pre-line leading-relaxed mt-2 max-w-[240px] font-sans">{invoice.companyAddress}</p>
            {invoice.companyGST && <p className="text-xs font-semibold text-slate-700 mt-2 font-sans">GSTIN: {invoice.companyGST}</p>}
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-light tracking-widest text-slate-400 uppercase">Invoice</h1>
            <p className="text-sm font-bold font-mono text-amber-600 mt-1">{invoice.invoiceNumber || "—"}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-500 font-sans">
              <p>Date: <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span></p>
              {invoice.dueDate && <p>Due Date: <span className="font-semibold text-slate-800">{invoice.dueDate}</span></p>}
              {invoice.poNumber && <p>Ref: <span className="font-semibold text-slate-800">{invoice.poNumber}</span></p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-xs font-sans">
          <div className="border-l-2 border-amber-500 pl-4">
            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">CLIENT DETAILS</h4>
            <p className="font-bold text-slate-900 text-sm">{invoice.clientName || "Client Name"}</p>
            {invoice.clientCompany && <p className="text-slate-500 font-medium">{invoice.clientCompany}</p>}
            <p className="text-slate-500 whitespace-pre-line leading-relaxed mt-1.5">{invoice.clientAddress}</p>
            {invoice.clientGST && <p className="font-semibold text-slate-700 mt-1">GSTIN: {invoice.clientGST}</p>}
          </div>
          {invoice.clientShippingAddress && (
            <div className="border-l-2 border-slate-300 pl-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SHIPPING ADDRESS</h4>
              <p className="font-bold text-slate-900 text-sm">{invoice.clientName || "Client Name"}</p>
              <p className="text-slate-500 whitespace-pre-line leading-relaxed mt-1.5">{invoice.clientShippingAddress}</p>
            </div>
          )}
        </div>

        <table className="w-full text-xs text-left mb-10 font-sans">
          <thead>
            <tr className="border-b border-amber-300 text-slate-900 font-bold uppercase text-[9px] tracking-widest">
              <th className="pb-3 text-center w-8">#</th>
              <th className="pb-3">Description</th>
              <th className="pb-3 text-center w-12">Qty</th>
              <th className="pb-3 text-right w-20">Rate</th>
              {invoice.templateConfig?.layout.columnVisibility.discount && <th className="pb-3 text-center w-12">Disc %</th>}
              <th className="pb-3 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => {
              const c = calcItem(item);
              return (
                <tr key={item.id} className="align-middle">
                  <td className="py-3.5 text-center text-amber-600 font-semibold">{idx + 1}</td>
                  <td className="py-3.5 pr-2 font-serif">
                    <p className="font-bold text-slate-900">{item.name || "Unnamed Item"}</p>
                    {item.description && <p className="text-slate-400 text-[10px] mt-0.5 font-sans leading-relaxed">{item.description}</p>}
                  </td>
                  <td className="py-3.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-3.5 text-right text-slate-600">{fmt(sym, Number(item.rate))}</td>
                  {invoice.templateConfig?.layout.columnVisibility.discount && (
                    <td className="py-3.5 text-center text-slate-600">{Number(item.discount) > 0 ? `${item.discount}%` : "—"}</td>
                  )}
                  <td className="py-3.5 text-right font-bold text-slate-900">{fmt(sym, c.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-start gap-12 pt-6 font-sans">
          <div className="flex-1 max-w-[340px] space-y-5">
            {qrCodeUrl && (
              <div className="flex items-center gap-4 p-4 rounded bg-amber-50/40 border border-amber-100">
                <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 bg-white border border-amber-200/50 p-0.5 rounded shadow-sm shrink-0" />
                <div>
                  <p className="font-bold text-slate-950 text-[10px] uppercase tracking-wider">Premium Settlement QR</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Scan using mobile UPI application to complete payment instantly.</p>
                </div>
              </div>
            )}
            {invoice.paymentDetails && (
              <div className="p-4 rounded border border-slate-200 bg-slate-50/20">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Direct Settlement Details</span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed font-mono text-[10px]">{invoice.paymentDetails}</p>
              </div>
            )}
          </div>

          <div className="w-64 border border-amber-200/50 bg-amber-50/10 p-5 rounded space-y-2.5">
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Subtotal</span><span>{fmt(sym, invoice.taxableAmount + (invoice.invoiceDiscountAmount || 0))}</span>
            </div>
            {invoice.invoiceDiscountAmount ? (
              <div className="flex justify-between text-emerald-600 text-xs">
                <span>Discount ({invoice.invoiceDiscountPercent}%)</span>
                <span>− {fmt(sym, invoice.invoiceDiscountAmount)}</span>
              </div>
            ) : null}
            {invoice.totalTax ? (
              <div className="flex justify-between text-slate-500 text-xs">
                <span>GST Tax</span><span>{fmt(sym, invoice.totalTax)}</span>
              </div>
            ) : null}
            {invoice.shippingCharges ? (
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Shipping</span><span>{fmt(sym, invoice.shippingCharges)}</span>
              </div>
            ) : null}
            {invoice.additionalCharges ? (
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Additional</span><span>{fmt(sym, invoice.additionalCharges)}</span>
              </div>
            ) : null}
            {invoice.roundOff ? (
              <div className="flex justify-between text-slate-400 text-[10px] italic">
                <span>Round Off</span><span>{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-bold text-sm pt-3 border-t border-amber-300 text-slate-900">
              <span className="uppercase tracking-widest text-[9px] text-amber-600 font-bold">TOTAL AMOUNT</span>
              <span className="text-[16px] font-serif font-bold" style={{ color: primaryColor }}>{fmt(sym, invoice.grandTotal)}</span>
            </div>
            {invoice.oldPurchaseAmount ? (
              <>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Gold Purchase Credit</span><span>− {fmt(sym, invoice.oldPurchaseAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-amber-300 text-red-600">
                  <span>Balance Due</span><span>{fmt(sym, invoice.dueAmount)}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-10 text-[9px] text-slate-400 leading-relaxed font-sans">
          {invoice.terms && <p className="mb-1"><strong>Terms & Conditions:</strong> {invoice.terms}</p>}
          {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. JEWELRY TEMPLATE
// ─────────────────────────────────────────────────────────────
export const JewelryTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#c2410c"; // Rust / Orange-700
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="p-8 bg-white text-gray-800 text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b border-orange-100 pb-5 mb-5">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight text-orange-950 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-orange-600 shrink-0" />
            {invoice.companyName || "Jewelers"}
          </h2>
          <p className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed max-w-[200px] mt-1">{invoice.companyAddress}</p>
          {invoice.companyGST && <p className="text-[11px] font-bold text-gray-700 mt-1">GSTIN: {invoice.companyGST}</p>}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
            Gold, Silver & Diamond Invoice
          </span>
          <h1 className="text-xl font-bold font-mono text-gray-800 mt-2">{invoice.invoiceNumber || "—"}</h1>
          <div className="mt-2 space-y-0.5 text-gray-500 text-[11px]">
            <p>Bill Date: <span className="font-semibold text-gray-800">{invoice.invoiceDate}</span></p>
            {invoice.dueDate && <p>Due Date: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
            {invoice.hallmarkId && <p>Hallmark License: <span className="font-semibold text-gray-800 font-mono">{invoice.hallmarkId}</span></p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 p-3.5 bg-orange-50/20 border border-orange-100/50 rounded-xl">
        <div>
          <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest block mb-1">Customer / Buyer</span>
          <p className="font-bold text-gray-900">{invoice.clientName || "Buyer Name"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1">{invoice.clientAddress}</p>
          {invoice.clientPhone && <p className="text-gray-500">Phone: {invoice.clientPhone}</p>}
          {invoice.clientGST && <p className="text-gray-700 font-semibold mt-1">GST: {invoice.clientGST}</p>}
        </div>
        <div className="text-right text-[11px] text-gray-500 space-y-1 self-end">
          {invoice.state && <p>Place of Supply: <span className="font-semibold text-gray-700">{invoice.state}</span></p>}
          {invoice.instagramHandle && <p>Follow us: <span className="font-semibold text-orange-600 font-mono">@{invoice.instagramHandle}</span></p>}
        </div>
      </div>

      {/* Specialty Ornament Table with Weights & Labour */}
      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-b border-orange-200 text-orange-950 font-bold uppercase text-[9px] tracking-wider bg-orange-50/40">
            <th className="py-2 pl-2 w-8">#</th>
            <th className="py-2">Ornaments / Items</th>
            <th className="py-2 w-16">HSN/SAC</th>
            <th className="py-2 text-right w-16">Gross Wt</th>
            <th className="py-2 text-right w-16">Net Wt</th>
            <th className="py-2 text-right w-20">Rate/g</th>
            <th className="py-2 text-right w-16">Labour</th>
            {invoice.taxMode === "item" && <th className="py-2 text-center w-12">GST %</th>}
            <th className="py-2 text-right w-24 pr-2">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-middle">
                <td className="py-3 pl-2 text-orange-700 font-semibold">{idx + 1}</td>
                <td className="py-3">
                  <p className="font-semibold text-gray-900">{item.name || "Gold Ornament"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
                </td>
                <td className="py-3 font-mono text-[10px]">{item.hsn || "7113"}</td>
                <td className="py-3 text-right text-gray-600 font-mono">{item.grossWeight ? `${item.grossWeight} g` : "—"}</td>
                <td className="py-3 text-right text-gray-900 font-semibold font-mono">{item.netWeight ? `${item.netWeight} g` : "—"}</td>
                <td className="py-3 text-right text-gray-600 font-mono">{fmt(sym, Number(item.rate))}</td>
                <td className="py-3 text-right text-gray-600 font-mono">{fmt(sym, Number(item.labour || 0))}</td>
                {invoice.taxMode === "item" && <td className="py-3 text-center text-gray-600">{item.tax || 3}%</td>}
                <td className="py-3 text-right font-bold text-gray-900 pr-2 font-mono">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Invoice Math Summary */}
      <div className="flex justify-between items-start gap-8 pt-4 border-t border-orange-100">
        <div className="flex-1 max-w-[340px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/10">
              <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 p-0.5 bg-white border border-orange-100 rounded shadow-sm shrink-0" />
              <div>
                <p className="font-bold text-orange-950 text-[10px] uppercase tracking-wide">UPI Payment Terminal</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan QR code via mobile banking or wallet application (GPay, PhonePe) to pay balance.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-[10px]">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Bank Account details</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono">{invoice.paymentDetails}</p>
            </div>
          )}
          {invoice.amountInWords && (
            <p className="text-[10px] text-gray-400 italic"><strong>Amount In Words:</strong> {invoice.amountInWords}</p>
          )}
        </div>

        <div className="w-64 bg-orange-50/15 border border-orange-100/70 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal (Net)</span><span className="font-mono">{fmt(sym, invoice.taxableAmount + (invoice.invoiceDiscountAmount || 0))}</span>
          </div>
          {invoice.invoiceDiscountAmount ? (
            <div className="flex justify-between text-emerald-600">
              <span>Overall Discount</span><span className="font-mono">− {fmt(sym, invoice.invoiceDiscountAmount)}</span>
            </div>
          ) : null}
          {(!invoice.cgstAmount && !invoice.sgstAmount && !invoice.igstAmount && invoice.totalTax) ? (
            <div className="flex justify-between text-gray-500">
              <span>GST Total</span><span className="font-mono">{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : (
            <>
              {invoice.cgstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>CGST{invoice.taxMode !== "item" ? ` (${invoice.cgstRate}%)` : ""}</span><span className="font-mono">{fmt(sym, invoice.cgstAmount)}</span>
                </div>
              ) : null}
              {invoice.sgstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>SGST{invoice.taxMode !== "item" ? ` (${invoice.sgstRate}%)` : ""}</span><span className="font-mono">{fmt(sym, invoice.sgstAmount)}</span>
                </div>
              ) : null}
              {invoice.igstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>IGST{invoice.taxMode !== "item" ? ` (${invoice.igstRate}%)` : ""}</span><span className="font-mono">{fmt(sym, invoice.igstAmount)}</span>
                </div>
              ) : null}
            </>
          )}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-400 text-[10px] italic">
              <span>Round Off</span><span className="font-mono">{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2 border-t border-orange-200 text-orange-950">
            <span className="uppercase text-[9px] font-bold">Gross Total</span>
            <span className="text-[14px] font-mono">{fmt(sym, invoice.grandTotal)}</span>
          </div>
          {invoice.oldPurchaseAmount ? (
            <>
              <div className="flex justify-between text-gray-500 border-t border-dashed border-orange-100 pt-1.5">
                <span>(-) Old Gold Value</span><span className="font-mono text-emerald-600">− {fmt(sym, invoice.oldPurchaseAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1.5 border-t-2 border-orange-200 text-red-700">
                <span>Net Payable Due</span><span className="font-mono text-[15px]">{fmt(sym, invoice.dueAmount)}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-8 space-y-1.5 text-[9px] text-gray-400 leading-relaxed">
        <p><strong>Note:</strong> Quality and Weight of metals are subject to assay. Hallmark certification ensures standard purity.</p>
        {invoice.terms && <p><strong>Terms:</strong> {invoice.terms}</p>}
        {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 5. MANUFACTURING TEMPLATE
// ─────────────────────────────────────────────────────────────
export const ManufacturingTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#0f766e"; // Teal-700
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="p-8 bg-white text-gray-800 text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b-2 border-teal-700 pb-5 mb-5">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight text-teal-900 flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-teal-700" />
            {invoice.companyName || "Manufacturers"}
          </h2>
          <p className="text-[10px] text-gray-500 whitespace-pre-line leading-relaxed max-w-[200px] mt-1">{invoice.companyAddress}</p>
          {invoice.companyGST && <p className="text-[10px] font-bold text-gray-700 mt-1">GSTIN: {invoice.companyGST}</p>}
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
            Commercial Tax Invoice
          </span>
          <h1 className="text-xl font-bold font-mono text-gray-800 mt-2">{invoice.invoiceNumber || "—"}</h1>
          <div className="mt-2 text-gray-500 text-[10px] space-y-1">
            <p>Invoice Date: <span className="font-semibold text-gray-800">{invoice.invoiceDate}</span></p>
            {invoice.dueDate && <p>Due Date: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
            {invoice.poNumber && <p>P.O. Reference: <span className="font-semibold text-gray-800 font-mono">{invoice.poNumber}</span></p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-6">
        <div>
          <span className="text-[9px] font-bold text-teal-700 uppercase tracking-widest block mb-1">CONSIGNEE (BILL TO)</span>
          <p className="font-bold text-gray-900 text-sm">{invoice.clientName || "Client Business"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line leading-relaxed mt-1.5">{invoice.clientAddress}</p>
          {invoice.clientGST && <p className="text-gray-700 font-bold mt-1">GSTIN: {invoice.clientGST}</p>}
        </div>
        <div>
          <span className="text-[9px] font-bold text-teal-700 uppercase tracking-widest block mb-1">DESPATCH DETAILS (SHIP TO)</span>
          {invoice.clientShippingAddress ? (
            <p className="text-gray-500 whitespace-pre-line leading-relaxed">{invoice.clientShippingAddress}</p>
          ) : (
            <p className="text-gray-400 italic">Same as billing address</p>
          )}
        </div>
      </div>

      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-y-2 border-teal-800 text-teal-950 font-bold uppercase text-[9px] tracking-wider bg-teal-50/20">
            <th className="py-2.5 pl-2 w-8">#</th>
            <th className="py-2.5">Machinery / Goods / Specifications</th>
            <th className="py-2.5 text-center w-16">HSN/SAC</th>
            <th className="py-2.5 text-center w-14">Qty</th>
            <th className="py-2.5 text-right w-20">Rate</th>
            {invoice.templateConfig?.layout.columnVisibility.tax && invoice.taxMode === "item" && <th className="py-2.5 text-center w-14">Tax Rate</th>}
            <th className="py-2.5 text-right w-24 pr-2">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-top">
                <td className="py-3 pl-2 text-teal-800 font-bold">{idx + 1}</td>
                <td className="py-3">
                  <p className="font-semibold text-gray-900">{item.name || "Industrial Component"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5 leading-relaxed">{item.description}</p>}
                </td>
                <td className="py-3 text-center font-mono text-[10px]">{item.hsn || "—"}</td>
                <td className="py-3 text-center text-gray-600">{item.quantity} {item.unit || "Pcs"}</td>
                <td className="py-3 text-right text-gray-600 font-mono">{fmt(sym, Number(item.rate))}</td>
                {invoice.templateConfig?.layout.columnVisibility.tax && (
                  <td className="py-3 text-center text-gray-600 font-mono">{Number(item.tax) > 0 ? `${item.tax}%` : "—"}</td>
                )}
                <td className="py-3 text-right font-bold text-gray-900 pr-2 font-mono">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start gap-8 pt-4">
        <div className="flex-1 max-w-[340px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-teal-100 bg-teal-50/10">
              <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 bg-white border border-teal-200/50 p-0.5 rounded shadow-sm shrink-0" />
              <div>
                <p className="font-bold text-teal-950 text-[10px] uppercase tracking-wide">Commercial B2B QR</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan with UPI compatible app to initiate immediate electronic settlement.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px]">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Company Settlement Accounts</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono">{invoice.paymentDetails}</p>
            </div>
          )}
        </div>

        <div className="w-64 bg-teal-50/5 border border-teal-100/70 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-gray-500">
            <span>Taxable Amount</span><span className="font-mono">{fmt(sym, invoice.taxableAmount)}</span>
          </div>
          {(!invoice.cgstAmount && !invoice.sgstAmount && !invoice.igstAmount && invoice.totalTax) ? (
            <div className="flex justify-between text-gray-500">
              <span>GST Amount</span><span className="font-mono">{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : (
            <>
              {invoice.cgstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>CGST Amount</span><span className="font-mono">{fmt(sym, invoice.cgstAmount)}</span>
                </div>
              ) : null}
              {invoice.sgstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>SGST Amount</span><span className="font-mono">{fmt(sym, invoice.sgstAmount)}</span>
                </div>
              ) : null}
              {invoice.igstAmount ? (
                <div className="flex justify-between text-gray-500">
                  <span>IGST Amount</span><span className="font-mono">{fmt(sym, invoice.igstAmount)}</span>
                </div>
              ) : null}
            </>
          )}
          {invoice.shippingCharges ? (
            <div className="flex justify-between text-gray-500">
              <span>Freight/Shipping</span><span className="font-mono">{fmt(sym, invoice.shippingCharges)}</span>
            </div>
          ) : null}
          {invoice.additionalCharges ? (
            <div className="flex justify-between text-gray-500">
              <span>Additional/Handling</span><span className="font-mono">{fmt(sym, invoice.additionalCharges)}</span>
            </div>
          ) : null}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-400 text-[10px] italic">
              <span>Round Off</span><span className="font-mono">{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-teal-200 text-teal-950">
            <span className="uppercase text-[9px] font-bold">Invoice Total</span>
            <span className="text-[15px] font-mono">{fmt(sym, invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-8 space-y-1.5 text-[9px] text-gray-400 leading-relaxed">
        <p><strong>Despatch Terms:</strong> Material once sold will not be returned unless quality discrepancy is identified within 7 days.</p>
        {invoice.terms && <p><strong>Terms:</strong> {invoice.terms}</p>}
        {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 6. WHOLESALE TEMPLATE
// ─────────────────────────────────────────────────────────────
export const WholesaleTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#0369a1"; // Sky-700
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="p-8 bg-white text-gray-800 text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b border-sky-100 pb-5 mb-5">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight text-sky-950 flex items-center gap-1">
            <Zap className="w-5 h-5 text-sky-600 shrink-0" />
            {invoice.companyName || "Wholesalers"}
          </h2>
          <p className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed max-w-[200px] mt-1">{invoice.companyAddress}</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            Bulk Distribution Invoice
          </span>
          <h1 className="text-lg font-bold font-mono text-gray-800 mt-2">{invoice.invoiceNumber || "—"}</h1>
          <p className="text-[10px] text-gray-400 mt-1">Date: {invoice.invoiceDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 p-4 rounded-xl border border-sky-50 bg-sky-50/10">
        <div>
          <span className="text-[9px] font-bold text-sky-700 uppercase tracking-widest block mb-1">CONSIGNEE DETAILS</span>
          <p className="font-bold text-gray-900">{invoice.clientName || "Buyer Name"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line mt-1">{invoice.clientAddress}</p>
          {invoice.clientGST && <p className="text-gray-700 font-bold mt-1">GSTIN: {invoice.clientGST}</p>}
        </div>
        <div className="text-right text-[11px] text-gray-500 self-end">
          {invoice.poNumber && <p>PO Reference: <span className="font-semibold text-gray-800 font-mono">{invoice.poNumber}</span></p>}
          {invoice.dueDate && <p>Due Date: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
        </div>
      </div>

      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-b border-sky-200 text-sky-950 font-bold uppercase text-[9px] tracking-wider bg-sky-50/30">
            <th className="py-2 pl-2 w-8">#</th>
            <th className="py-2">Item / Brand / Catalog</th>
            <th className="py-2 w-16">HSN/SAC</th>
            <th className="py-2 text-center w-14">Bulk Qty</th>
            <th className="py-2 text-right w-20">Bulk Rate</th>
            <th className="py-2 text-center w-12">Disc %</th>
            <th className="py-2 text-right w-24 pr-2">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-middle">
                <td className="py-2.5 pl-2 text-sky-700 font-semibold">{idx + 1}</td>
                <td className="py-2.5">
                  <p className="font-semibold text-gray-900">{item.name || "Bulk Product"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
                </td>
                <td className="py-2.5 font-mono text-[10px]">{item.hsn || "—"}</td>
                <td className="py-2.5 text-center text-gray-600 font-semibold">{item.quantity} {item?.unit! || "Box"}</td>
                <td className="py-2.5 text-right text-gray-600 font-mono">{fmt(sym, Number(item.rate))}</td>
                <td className="py-2.5 text-center text-gray-600">{Number(item.discount) > 0 ? `${item.discount}%` : "—"}</td>
                <td className="py-2.5 text-right font-bold text-gray-900 pr-2 font-mono">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start gap-8 pt-4">
        <div className="flex-1 max-w-[340px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-sky-100 bg-sky-50/10">
              <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 bg-white border border-sky-200/50 p-0.5 rounded shadow-sm shrink-0" />
              <div>
                <p className="font-bold text-sky-950 text-[10px] uppercase tracking-wide">B2B Payment Hub</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan QR code using UPI to pay wholesale invoices instantly.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px]">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Company Account Details</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono">{invoice.paymentDetails}</p>
            </div>
          )}
        </div>

        <div className="w-64 bg-sky-50/5 border border-sky-100/70 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span className="font-mono">{fmt(sym, invoice.taxableAmount + (invoice.invoiceDiscountAmount || 0))}</span>
          </div>
          {invoice.invoiceDiscountAmount ? (
            <div className="flex justify-between text-emerald-600">
              <span>Overall Discount</span><span className="font-mono">− {fmt(sym, invoice.invoiceDiscountAmount)}</span>
            </div>
          ) : null}
          {invoice.totalTax ? (
            <div className="flex justify-between text-gray-500">
              <span>Taxes</span><span className="font-mono">{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : null}
          {invoice.shippingCharges ? (
            <div className="flex justify-between text-gray-500">
              <span>Freight/Delivery</span><span className="font-mono">{fmt(sym, invoice.shippingCharges)}</span>
            </div>
          ) : null}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-400 text-[10px] italic">
              <span>Round Off</span><span className="font-mono">{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-sky-200 text-sky-950">
            <span className="uppercase text-[9px] font-bold">Net Invoice Total</span>
            <span className="text-[15px] font-mono">{fmt(sym, invoice.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 7. SERVICE TEMPLATE
// ─────────────────────────────────────────────────────────────
export const ServiceTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#3b82f6"; // Blue-500
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="p-8 bg-white text-gray-800 text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-9 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight text-gray-900">{invoice.companyName || "Service Provider"}</h2>
          <p className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed max-w-[200px] mt-1">{invoice.companyAddress}</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Service Invoice
          </span>
          <h1 className="text-xl font-bold font-mono text-gray-800 mt-2">{invoice.invoiceNumber || "—"}</h1>
          <p className="text-[10px] text-gray-400 mt-1">Invoice Date: {invoice.invoiceDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">CLIENT REFERENCE</span>
          <p className="font-bold text-gray-900">{invoice.clientName || "Client Name"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line mt-1">{invoice.clientAddress}</p>
        </div>
        <div className="text-right text-[11px] text-gray-500 self-end">
          {invoice.poNumber && <p>Project Ref: <span className="font-semibold text-gray-800">{invoice.poNumber}</span></p>}
          {invoice.dueDate && <p>Due Date: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
        </div>
      </div>

      {/* Services breakdown: Hours / Rates */}
      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-900 font-bold uppercase text-[9px] tracking-wider">
            <th className="py-2.5 w-8">#</th>
            <th className="py-2.5">Scope of Work / Deliverables</th>
            <th className="py-2.5 text-center w-14">Hours</th>
            <th className="py-2.5 text-right w-20">Hourly Rate</th>
            <th className="py-2.5 text-right w-24 pr-2">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-top">
                <td className="py-3 text-gray-400 font-medium">{idx + 1}</td>
                <td className="py-3">
                  <p className="font-semibold text-gray-900">{item.name || "Consulting Services"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5 leading-relaxed">{item.description}</p>}
                </td>
                <td className="py-3 text-center text-gray-600 font-semibold">{item.quantity} hrs</td>
                <td className="py-3 text-right text-gray-600 font-mono">{fmt(sym, Number(item.rate))}</td>
                <td className="py-3 text-right font-bold text-gray-900 pr-2 font-mono">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start gap-8 pt-4">
        <div className="flex-1 max-w-[340px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 bg-white border border-gray-200/50 p-0.5 rounded shadow-sm shrink-0" />
              <div>
                <p className="font-bold text-gray-950 text-[10px] uppercase tracking-wide">Direct Transfer QR</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan to pay balance due immediately with no additional service fees.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px]">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Direct Deposit Account</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono">{invoice.paymentDetails}</p>
            </div>
          )}
        </div>

        <div className="w-64 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-gray-500">
            <span>Scope Subtotal</span><span className="font-mono">{fmt(sym, invoice.taxableAmount)}</span>
          </div>
          {invoice.totalTax ? (
            <div className="flex justify-between text-gray-500">
              <span>Tax/VAT</span><span className="font-mono">{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : null}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-400 text-[10px] italic">
              <span>Round Off</span><span className="font-mono">{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-gray-200 text-gray-900">
            <span className="uppercase text-[9px] font-bold">Total Service Fee</span>
            <span className="text-[15px] font-mono">{fmt(sym, invoice.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 8. CONTRACTOR TEMPLATE
// ─────────────────────────────────────────────────────────────
export const ContractorTemplate: React.FC<TemplateProps> = ({ invoice, qrCodeUrl }) => {
  const primaryColor = invoice.templateConfig?.branding.primaryColor || "#15803d"; // Green-700
  const fontFamily = invoice.templateConfig?.branding.fontFamily || "Inter";
  const sym = invoice.currencySymbol;

  return (
    <div 
      className="p-8 bg-white text-gray-800 text-xs"
      style={{ fontFamily: `var(--font-${fontFamily.toLowerCase()}, sans-serif)` }}
    >
      <div className="flex justify-between items-start border-b-2 border-green-700 pb-5 mb-5">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
          )}
          <h2 className="text-xl font-bold tracking-tight text-green-900">{invoice.companyName || "Contractor Services"}</h2>
          <p className="text-[10px] text-gray-500 whitespace-pre-line leading-relaxed max-w-[200px] mt-1">{invoice.companyAddress}</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-800 bg-green-50 px-2 py-0.5 rounded">
            Labor & Contractor Invoice
          </span>
          <h1 className="text-xl font-bold font-mono text-gray-800 mt-2">{invoice.invoiceNumber || "—"}</h1>
          <p className="text-[10px] text-gray-400 mt-1">Date: {invoice.invoiceDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest block mb-1">EMPLOYER / CLIENT</span>
          <p className="font-bold text-gray-900">{invoice.clientName || "Employer Name"}</p>
          {invoice.clientCompany && <p className="text-gray-500">{invoice.clientCompany}</p>}
          <p className="text-gray-500 whitespace-pre-line mt-1">{invoice.clientAddress}</p>
        </div>
        <div className="text-right text-[11px] text-gray-500 self-end">
          {invoice.poNumber && <p>Work Order: <span className="font-semibold text-gray-800">{invoice.poNumber}</span></p>}
          {invoice.dueDate && <p>Payment Due: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>}
        </div>
      </div>

      <table className="w-full text-left mb-6 border-collapse">
        <thead>
          <tr className="border-y border-green-200 text-green-950 font-bold uppercase text-[9px] tracking-wider bg-green-50/20">
            <th className="py-2 pl-2 w-8">#</th>
            <th className="py-2">Labor Category / Project Code</th>
            <th className="py-2 text-center w-14">Headcount</th>
            <th className="py-2 text-center w-14">Units/Days</th>
            <th className="py-2 text-right w-20">Rate/Day</th>
            <th className="py-2 text-right w-24 pr-2">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoice.items.map((item, idx) => {
            const c = calcItem(item);
            return (
              <tr key={item.id} className="align-middle">
                <td className="py-2.5 pl-2 text-green-700 font-semibold">{idx + 1}</td>
                <td className="py-2.5">
                  <p className="font-semibold text-gray-900">{item.name || "Contract Labor"}</p>
                  {item.description && <p className="text-gray-400 text-[10px] mt-0.5">{item.description}</p>}
                </td>
                <td className="py-2.5 text-center text-gray-600 font-mono">{item.grossWeight || "—"}</td>
                <td className="py-2.5 text-center text-gray-600 font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-600 font-mono">{fmt(sym, Number(item.rate))}</td>
                <td className="py-2.5 text-right font-bold text-gray-900 pr-2 font-mono">{fmt(sym, c.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-start gap-8 pt-4">
        <div className="flex-1 max-w-[340px] space-y-4">
          {qrCodeUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50/10">
              <img src={qrCodeUrl} alt="UPI QR" className="w-18 h-18 bg-white border border-green-200/50 p-0.5 rounded shadow-sm shrink-0" />
              <div>
                <p className="font-bold text-green-950 text-[10px] uppercase tracking-wide">UPI Settlement Terminal</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Scan QR code using UPI to pay contractor dues instantly.</p>
              </div>
            </div>
          )}
          {invoice.paymentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px]">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Contractor Settlement Accounts</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono">{invoice.paymentDetails}</p>
            </div>
          )}
        </div>

        <div className="w-64 bg-green-50/5 border border-green-100/70 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span className="font-mono">{fmt(sym, invoice.taxableAmount)}</span>
          </div>
          {invoice.totalTax ? (
            <div className="flex justify-between text-gray-500">
              <span>Service Tax</span><span className="font-mono">{fmt(sym, invoice.totalTax)}</span>
            </div>
          ) : null}
          {invoice.roundOff ? (
            <div className="flex justify-between text-gray-400 text-[10px] italic">
              <span>Round Off</span><span className="font-mono">{invoice.roundOff < 0 ? "" : "+"}{fmt(sym, invoice.roundOff)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-sm pt-2.5 border-t border-green-200 text-green-950">
            <span className="uppercase text-[9px] font-bold">Total Dues</span>
            <span className="text-[15px] font-mono">{fmt(sym, invoice.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
