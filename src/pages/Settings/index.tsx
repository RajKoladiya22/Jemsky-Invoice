import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useInvoiceStore } from "../../store/invoiceStore";
import { db } from "../../lib/db";
import { exportAllDataToJSON, importDataFromJSON } from "../../utils/backupRestore";
import {
  Settings,
  Database,
  Shield,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun,
  Palette,
} from "lucide-react";

type SettingsTab = "general" | "appearance" | "storage" | "backup";

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { invoices, clients, products, companies, autosaveEnabled, setAutosaveEnabled } = useInvoiceStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem("jemsky-last-backup")
  );

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClear = async (table: string) => {
    try {
      if (table === "invoices") await db.invoices.clear();
      else if (table === "clients") await db.clients.clear();
      else if (table === "products") await db.products.clear();
      else if (table === "companies") await db.companies.clear();
      else if (table === "all") {
        await db.invoices.clear();
        await db.clients.clear();
        await db.products.clear();
        await db.companies.clear();
      }
      useInvoiceStore.getState().loadAllData();
      showToast(`${table === "all" ? "All data" : table.charAt(0).toUpperCase() + table.slice(1)} cleared successfully`);
    } catch (e) {
      showToast("Failed to clear data", "error");
    }
    setConfirmClear(null);
  };

  const handleBackup = async () => {
    try {
      await exportAllDataToJSON();
      const now = new Date().toLocaleString();
      localStorage.setItem("jemsky-last-backup", now);
      setLastBackupDate(now);
      showToast("Backup downloaded successfully");
    } catch (e) {
      showToast("Backup failed", "error");
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importDataFromJSON(file);
      useInvoiceStore.getState().loadAllData();
      showToast("Data imported successfully");
    } catch (e) {
      showToast("Import failed — invalid backup file", "error");
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card = `rounded-2xl border p-6 ${isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5 shadow-sm"}`;
  const labelCls = `block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-white/40" : "text-gray-400"}`;
  const inputCls = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white focus:border-violet-500/60"
      : "bg-gray-50 border-black/8 text-gray-900 focus:border-violet-400"
  }`;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "storage", label: "Storage", icon: Database },
    { id: "backup", label: "Backup & Restore", icon: Shield },
  ];

  return (
    <div className={`flex-1 overflow-y-auto pb-24 md:pb-8 ${isDark ? "bg-[#0c0c0e]" : "bg-[#f8f7f4]"}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.6)" }}>
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${isDark ? "bg-[#1a1a1d] border-white/10" : "bg-white border-black/8"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                  Confirm Delete
                </h3>
                <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-400"}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={`text-sm mb-5 ${isDark ? "text-white/70" : "text-gray-600"}`}>
              Are you sure you want to clear all <strong>{confirmClear}</strong>? This data will be permanently deleted from your device.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-white/70" : "border-black/10 hover:bg-gray-100 text-gray-600"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleClear(confirmClear)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Settings
          </h1>
          <p className={`text-xs mt-1 ${isDark ? "text-white/35" : "text-gray-400"}`}>
            Preferences, storage, and backup management
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl border w-fit ${isDark ? "bg-white/4 border-white/5" : "bg-black/4 border-black/5"}`}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : isDark
                    ? "text-white/45 hover:text-white"
                    : "text-black/45 hover:text-black"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── General Tab ─────────────────────────────────────────────────── */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className={`font-bold text-sm mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                Invoice Defaults
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Default Currency</label>
                  <select className={inputCls} defaultValue="INR">
                    <option value="INR">INR (₹) — Indian Rupee</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Default Payment Terms</label>
                  <select className={inputCls} defaultValue="Net 30">
                    <option>Net 7</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Due on Receipt</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Invoice Number Prefix</label>
                  <input type="text" className={inputCls} defaultValue="INV-" placeholder="e.g. INV-" />
                </div>
                <div>
                  <label className={labelCls}>Default GST Rate (%)</label>
                  <input type="number" className={inputCls} defaultValue="18" step="0.5" min="0" max="100" />
                </div>
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                Auto-Save
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Auto-save to IndexedDB
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    Automatically saves your invoice 700ms after any change
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutosaveEnabled(!autosaveEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                    autosaveEnabled ? "bg-violet-600" : "bg-gray-300 dark:bg-white/10"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    autosaveEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Appearance Tab ──────────────────────────────────────────────── */}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className={`font-bold text-sm mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                Theme
              </h2>
              <div className="flex gap-3">
                {[
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "light", label: "Light", icon: Sun },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = (t.id === "dark") === isDark;
                  return (
                    <button
                      key={t.id}
                      onClick={toggleTheme}
                      className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-violet-500 bg-violet-500/10"
                          : isDark
                          ? "border-white/8 hover:border-white/20"
                          : "border-black/8 hover:border-black/20"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-violet-500" : isDark ? "text-white/40" : "text-gray-400"}`} />
                      <span className={`text-sm font-bold ${isSelected ? "text-violet-500" : isDark ? "text-white/60" : "text-gray-500"}`}>
                        {t.label}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] rounded-full font-bold">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                Accent Color
              </h2>
              <div className="flex gap-3 flex-wrap">
                {[
                  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#db2777",
                ].map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-xl border-2 border-white/20 transition-transform hover:scale-110`}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Storage Tab ─────────────────────────────────────────────────── */}
        {activeTab === "storage" && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className={`font-bold text-sm mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                Local Storage Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Invoices", count: invoices.length, color: "text-violet-500", bg: "bg-violet-500/12" },
                  { label: "Customers", count: clients.length, color: "text-emerald-500", bg: "bg-emerald-500/12" },
                  { label: "Products", count: products.length, color: "text-blue-500", bg: "bg-blue-500/12" },
                  { label: "Profiles", count: companies.length, color: "text-amber-500", bg: "bg-amber-500/12" },
                ].map((s) => (
                  <div key={s.label} className={`p-4 rounded-xl ${s.bg}`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                    <p className={`text-xs font-semibold mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              <p className={`text-xs font-semibold mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                DANGER ZONE — These actions are irreversible
              </p>

              <div className="space-y-2">
                {[
                  { key: "invoices", label: "Clear all invoices", count: invoices.length },
                  { key: "clients", label: "Clear all customers", count: clients.length },
                  { key: "products", label: "Clear all products", count: products.length },
                  { key: "companies", label: "Clear all profiles", count: companies.length },
                  { key: "all", label: "Clear ALL data", count: invoices.length + clients.length + products.length + companies.length, danger: true },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      item.danger
                        ? isDark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                        : isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${item.danger ? "text-red-400" : isDark ? "text-white/80" : "text-gray-700"}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
                        {item.count} record{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmClear(item.key)}
                      disabled={item.count === 0}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        item.danger
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : isDark
                          ? "bg-red-500/15 hover:bg-red-500/25 text-red-400"
                          : "bg-red-100 hover:bg-red-200 text-red-600"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Backup & Restore Tab ─────────────────────────────────────────── */}
        {activeTab === "backup" && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                Export Backup
              </h2>
              <p className={`text-xs mb-5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Downloads all invoices, customers, products and profiles as a JSON file.
              </p>
              {lastBackupDate && (
                <p className={`text-xs mb-4 flex items-center gap-1.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Last backup: {lastBackupDate}
                </p>
              )}
              <button
                onClick={handleBackup}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-violet-600/25"
              >
                <Download className="w-4 h-4" />
                Download Backup JSON
              </button>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                Import Backup
              </h2>
              <p className={`text-xs mb-5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Restores all data from a previously exported Bill.Jemsky backup JSON file.
              </p>
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-dashed cursor-pointer w-fit text-sm font-bold transition-all ${
                isDark
                  ? "border-white/15 hover:border-violet-500/50 text-white/60 hover:text-white"
                  : "border-black/15 hover:border-violet-400 text-gray-500 hover:text-gray-900"
              }`}>
                <Upload className="w-4 h-4" />
                Choose Backup File
                <input
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImport(f);
                  }}
                />
              </label>
              <p className={`text-[10px] mt-3 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                ⚠️ This will overwrite existing data. Export a backup first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
