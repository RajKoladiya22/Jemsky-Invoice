import React, { useState, useMemo } from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FilePlus,
  RefreshCcw,
} from "lucide-react";
import { fmt } from "../pages/Invoice/components/calculation";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { db } from "../lib/db";

interface InvoiceListProps {
  isDark: boolean;
}

type SortField = "invoiceDate" | "invoiceNumber" | "grandTotal";
type SortOrder = "asc" | "desc";

export const InvoiceList: React.FC<InvoiceListProps> = ({ isDark }) => {
  const { invoices, loadInvoice, deleteInvoice, createNewInvoice, loadAllData } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("invoiceDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter & Sort Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchesSearch =
          (inv.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inv.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inv.clientCompany || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || inv.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField] || "";
        let valB: string | number = b[sortField] || "";

        if (sortField === "grandTotal") {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [invoices, searchQuery, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleMarkPaid = async (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    
    await db.invoices.put({
      ...inv,
      status: "paid",
      updatedAt: new Date().toISOString(),
    });
    
    await loadAllData();
  };

  const inputBgCls = isDark 
    ? "bg-white/[0.04] border-white/[0.08] text-white focus:border-violet-500/60" 
    : "bg-black/[0.03] border-black/[0.08] text-black focus:border-violet-500/60";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Records</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Manage, filter, print, and export your local invoice invoices.
          </p>
        </div>
        <button
          onClick={createNewInvoice}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/15"
        >
          <FilePlus className="w-3.5 h-3.5" />
          New Invoice
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 ${
        isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5"
      }`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number, customer, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputBgCls}`}
          />
        </div>

        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border text-xs outline-none font-semibold cursor-pointer ${inputBgCls}`}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isDark ? "border-white/10 hover:bg-white/5 text-white/60" : "border-black/10 hover:bg-black/5 text-black/50"
              }`}
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoice Table Grid */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5"
      }`}>
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30 text-violet-500" />
            <p className="text-sm font-semibold">No invoices found</p>
            <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
              Try clearing filters or checking spelling, or create a new invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${
                  isDark ? "border-white/5 text-white/40 bg-white/[0.01]" : "border-black/5 text-black/40 bg-black/[0.01]"
                } uppercase tracking-wider text-[9px] font-bold`}>
                  <th 
                    onClick={() => handleSort("invoiceNumber")} 
                    className="py-3.5 pl-4 cursor-pointer hover:text-violet-500 transition-colors w-32"
                  >
                    <div className="flex items-center gap-1">
                      Invoice No
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5">Client / Company</th>
                  <th 
                    onClick={() => handleSort("invoiceDate")} 
                    className="py-3.5 cursor-pointer hover:text-violet-500 transition-colors w-32"
                  >
                    <div className="flex items-center gap-1">
                      Billing Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("grandTotal")} 
                    className="py-3.5 cursor-pointer hover:text-violet-500 transition-colors w-32"
                  >
                    <div className="flex items-center gap-1">
                      Grand Total
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 w-24">Status</th>
                  <th className="py-3.5 text-right pr-4 w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td 
                      onClick={() => loadInvoice(inv)} 
                      className="py-4 pl-4 font-semibold font-mono text-violet-500 hover:underline cursor-pointer"
                    >
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{inv.clientName}</p>
                      {inv.clientCompany && <p className="text-[10px] text-gray-400 mt-0.5">{inv.clientCompany}</p>}
                    </td>
                    <td className="py-4 text-gray-500">{inv.invoiceDate}</td>
                    <td className="py-4 font-semibold font-mono text-gray-900 dark:text-white">
                      {fmt(inv.currencySymbol, inv.grandTotal)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : inv.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : inv.status === "cancelled"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end gap-1">
                        {inv.status === "pending" && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className={`p-1.5 rounded-lg transition-colors text-emerald-500 ${
                              isDark ? "hover:bg-emerald-500/10" : "hover:bg-emerald-500/10"
                            }`}
                            title="Mark Paid"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => loadInvoice(inv)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"
                          }`}
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => generateInvoicePDF(inv)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"
                          }`}
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this invoice?")) {
                              await deleteInvoice(inv.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark 
                              ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" 
                              : "hover:bg-red-500/10 text-black/30 hover:text-red-500"
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
