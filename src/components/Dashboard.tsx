import React, { useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  FileText, CheckCircle, Clock, FileMinus, TrendingUp,
  Plus, Users, Package, List, Download, Edit2, Trash2,
  ChevronRight, BarChart2,
} from "lucide-react";
import { fmt } from "../pages/Invoice/components/calculation";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { exportDatabaseToExcel } from "../utils/excelGenerator";
import type { SavedInvoice } from "../types";

// Register Chart.js modules once
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DashboardProps { isDark: boolean }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS: Record<string, string> = {
  paid:      "#22c55e",
  pending:   "#f59e0b",
  draft:     "#6b7280",
  cancelled: "#ef4444",
};

export const Dashboard: React.FC<DashboardProps> = ({ isDark }) => {
  const { invoices, clients, openCategorySelection, loadInvoice, deleteInvoice, setActiveTab } =
    useInvoiceStore();

  // ── Metrics ────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const paid      = invoices.filter(i => i.status === "paid");
    const pending   = invoices.filter(i => i.status === "pending");
    const draft     = invoices.filter(i => i.status === "draft");
    const cancelled = invoices.filter(i => i.status === "cancelled");
    const paidRevenue    = paid.reduce((s, i) => s + (i.grandTotal || 0), 0);
    const pendingRevenue = pending.reduce((s, i) => s + (i.grandTotal || 0), 0);
    return {
      total: invoices.length,
      paid: paid.length, pending: pending.length,
      draft: draft.length, cancelled: cancelled.length,
      totalRevenue: paidRevenue + pendingRevenue,
      paidRevenue, pendingRevenue,
    };
  }, [invoices]);

  const sym = invoices[0]?.currencySymbol || "₹";

  // ── Monthly revenue (last 6 months) ───────────────────────────────────────
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const m = d.getMonth(), y = d.getFullYear();
      const filtered = invoices.filter(inv => {
        const dt = new Date(inv.invoiceDate || inv.savedAt);
        return dt.getMonth() === m && dt.getFullYear() === y;
      });
      return {
        label:   MONTH_NAMES[m],
        revenue: filtered.reduce((s, inv) => s + (inv.grandTotal || 0), 0),
        count:   filtered.length,
      };
    });
  }, [invoices]);

  // ── Chart.js: Bar ──────────────────────────────────────────────────────────
  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor  = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const tooltipBg  = isDark ? "#1a1a1d" : "#fff";
  const tooltipTxt = isDark ? "#fff" : "#111";

  const barData = {
    labels: monthlyData.map(m => m.label),
    datasets: [{
      label: "Revenue",
      data:  monthlyData.map(m => m.revenue),
      backgroundColor: isDark ? "rgba(124,58,237,0.85)" : "rgba(109,40,217,0.8)",
      hoverBackgroundColor: "#7c3aed",
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const barOptions: Parameters<typeof Bar>[0]["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tickColor,
        bodyColor: tooltipTxt,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: ctx => ` ${sym}${fmt("₹",ctx?.parsed?.y!)}`,
        },
      },
    },
    scales: {
      x: {
        grid:  { color: gridColor },
        ticks: { color: tickColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid:  { color: gridColor },
        ticks: {
          color: tickColor, font: { size: 10 },
          callback: (v: any) => `${sym}${Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + "k" : v}`,
        },
        border: { display: false },
      },
    },
  };

  // ── Chart.js: Doughnut ────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const c = { paid: 0, pending: 0, draft: 0, cancelled: 0 };
    invoices.forEach(inv => {
      const s = inv.status as keyof typeof c;
      if (s in c) c[s]++;
    });
    return Object.entries(c).filter(([, v]) => v > 0);
  }, [invoices]);

  const doughnutData = {
    labels:   statusCounts.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      data:            statusCounts.map(([, v]) => v),
      backgroundColor: statusCounts.map(([k]) => STATUS_COLORS[k]),
      hoverOffset:     6,
      borderWidth:     0,
    }],
  };

  const doughnutOptions: Parameters<typeof Doughnut>[0]["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: tickColor,
          font:  { size: 11 },
          padding: 14,
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tickColor,
        bodyColor: tooltipTxt,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        borderWidth: 1,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} invoices` },
      },
    },
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card = `rounded-2xl border transition-all ${
    isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5 shadow-sm"
  }`;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid:      "bg-green-500/12 text-green-500",
      pending:   "bg-amber-500/12 text-amber-500",
      draft:     "bg-gray-500/12 text-gray-400",
      cancelled: "bg-red-500/12 text-red-400",
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || map.draft}`;
  };

  const recentInvoices = invoices.slice(0, 6);
  const recentClients  = clients.slice(0, 4);

  return (
    <div className={`flex-1 overflow-y-auto pb-24 md:pb-8 ${isDark ? "bg-[#0c0c0e]" : "bg-[#f8f7f4]"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Workspace
            </h1>
            <p className={`text-xs mt-1 ${isDark ? "text-white/35" : "text-gray-400"}`}>
              All data stored locally · Offline first
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportDatabaseToExcel()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark ? "border-white/10 hover:bg-white/5 text-white/70" : "border-black/10 hover:bg-black/5 text-black/60"
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Export All
            </button>
            <button
              onClick={openCategorySelection}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-violet-600/25"
            >
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        </div>

        {/* ── Metric Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: metrics.total,                  sub: "All time",                       icon: FileText,   iconBg: "bg-violet-500/15", iconClr: "text-violet-500" },
            { label: "Revenue",        value: `${sym}${fmt("₹",metrics.totalRevenue)}`, sub: `${sym}${fmt("₹",metrics.paidRevenue)} collected`, icon: TrendingUp,  iconBg: "bg-green-500/15",  iconClr: "text-green-500"  },
            { label: "Paid",           value: metrics.paid,                   sub: `${sym}${fmt("₹",metrics.paidRevenue)}`,    icon: CheckCircle, iconBg: "bg-green-500/15",  iconClr: "text-green-400"  },
            { label: "Pending",        value: metrics.pending,                sub: `${sym}${fmt("₹",metrics.pendingRevenue)} due`, icon: Clock,    iconBg: "bg-amber-500/15",  iconClr: "text-amber-400"  },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${card} p-5 hover:-translate-y-0.5 hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <p className={`text-xs font-semibold ${isDark ? "text-white/45" : "text-gray-400"}`}>{m.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${m.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${m.iconClr}`} />
                  </div>
                </div>
                <p className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>{m.value}</p>
                <p className={`text-[11px] mt-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar: Monthly Revenue */}
          <div className={`${card} p-6 lg:col-span-2`}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-violet-500" />
              <div>
                <h2 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Monthly Revenue</h2>
                <p className={`text-[11px] ${isDark ? "text-white/35" : "text-gray-400"}`}>Last 6 months</p>
              </div>
            </div>
            {invoices.length === 0 ? (
              <div className={`h-44 flex items-center justify-center text-sm ${isDark ? "text-white/20" : "text-gray-300"}`}>
                No data yet — create your first invoice
              </div>
            ) : (
              <div style={{ height: 176 }}>
                <Bar data={barData} options={barOptions} />
              </div>
            )}
          </div>

          {/* Doughnut: Status */}
          <div className={`${card} p-6`}>
            <h2 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Invoice Status</h2>
            <p className={`text-[11px] mb-3 ${isDark ? "text-white/35" : "text-gray-400"}`}>Distribution</p>
            {statusCounts.length === 0 ? (
              <div className={`h-44 flex items-center justify-center text-sm ${isDark ? "text-white/20" : "text-gray-300"}`}>
                No data yet
              </div>
            ) : (
              <div style={{ height: 210 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div className={`${card} p-6`}>
          <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "New Invoice",  icon: Plus,    color: "from-violet-600 to-violet-800", action: openCategorySelection       },
              { label: "All Invoices", icon: List,    color: "from-blue-600 to-blue-800",     action: () => setActiveTab("invoices") },
              { label: "Customers",    icon: Users,   color: "from-emerald-600 to-emerald-800", action: () => setActiveTab("clients") },
              { label: "Products",     icon: Package, color: "from-amber-600 to-amber-800",   action: () => setActiveTab("products") },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={a.action}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${a.color} text-white font-bold text-sm hover:scale-[1.02] hover:shadow-xl transition-all duration-200`}
                >
                  <Icon className="w-6 h-6" />{a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Recent Invoices + Customers ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className={`${card} lg:col-span-2`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
              <h2 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Recent Invoices</h2>
              <button onClick={() => setActiveTab("invoices")}
                className="text-violet-500 text-xs font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className={`text-sm ${isDark ? "text-white/25" : "text-gray-300"}`}>No invoices yet</p>
                <button onClick={openCategorySelection} className="mt-3 text-xs text-violet-500 font-semibold hover:underline">
                  Create your first invoice →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-inherit">
                {recentInvoices.map((inv: SavedInvoice) => (
                  <div key={inv.id}
                    className={`flex items-center gap-3 px-6 py-3.5 group transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {inv.invoiceNumber || "—"}
                      </p>
                      <p className={`text-[10px] truncate ${isDark ? "text-white/35" : "text-gray-400"}`}>
                        {inv.clientName || "No client"} · {inv.invoiceDate || ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${isDark ? "text-white" : "text-gray-900"}`}>
                        {inv.currencySymbol || "₹"}{fmt("₹",inv.grandTotal || 0)}
                      </span>
                      <span className={statusBadge(inv.status || "draft")}>{inv.status || "draft"}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { loadInvoice(inv); setActiveTab("editor"); }} title="Edit"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-gray-100 text-gray-400"}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => generateInvoicePDF(inv)} title="Download PDF"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-gray-100 text-gray-400"}`}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteInvoice(inv.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Customers */}
          <div className={card}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
              <h2 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Customers</h2>
              <button onClick={() => setActiveTab("clients")}
                className="text-violet-500 text-xs font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {recentClients.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className={`text-sm ${isDark ? "text-white/25" : "text-gray-300"}`}>No customers yet</p>
                <button onClick={() => setActiveTab("clients")} className="mt-3 text-xs text-violet-500 font-semibold hover:underline">
                  Add a customer →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-inherit">
                {recentClients.map(c => (
                  <div key={c.id}
                    className={`flex items-center gap-3 px-6 py-3.5 ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"}`}>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-emerald-500">
                        {(c.name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs truncate ${isDark ? "text-white" : "text-gray-900"}`}>{c.name}</p>
                      <p className={`text-[10px] truncate ${isDark ? "text-white/35" : "text-gray-400"}`}>
                        {c.phone || c.email || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
