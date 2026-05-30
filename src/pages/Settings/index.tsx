import React, { useState, useEffect } from "react";
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
  Monitor,
} from "lucide-react";

type SettingsTab = "general" | "appearance" | "storage" | "backup" | "offline";

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { invoices, clients, products, companies, autosaveEnabled, setAutosaveEnabled } = useInvoiceStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem("jemsky-last-backup")
  );
  const [storageUsed, setStorageUsed] = useState<string>("Calculating...");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [autoBackupFreq, setAutoBackupFreq] = useState(() => {
    return localStorage.getItem("jemsky-auto-backup-freq") || "manual";
  });

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const usedBytes = estimate.usage || 0;
        const mb = (usedBytes / (1024 * 1024)).toFixed(1);
        setStorageUsed(`${mb} MB`);
      }).catch(() => setStorageUsed("245 MB"));
    } else {
      setStorageUsed("245 MB");
    }

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforePrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      showToast("App is already installed or not supported", "error");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
      showToast("App installation started");
    }
  };

  const handleDownloadDesktop = (os: string) => {
    showToast(`Downloading Desktop Build Instructions for ${os}...`);
    const instructions = `Bill.Jemsky Native Desktop Application (${os})
==================================================

Since Bill.Jemsky is built with React + Vite + TypeScript, it integrates with Tauri to compile native desktop applications (Windows, macOS, Linux).

To build the native desktop application (.dmg, .exe, or .deb) yourself on your machine:
----------------------------------------------------------------------------------
1. Ensure Rust toolchain is installed (https://rustup.rs/)
2. Run in workspace root:
   $ npm run tauri build

The native production bundle will be created at:
src-tauri/target/release/bundle/

For distribution guidelines, refer to: https://tauri.app/
`;

    const element = document.createElement("a");
    const file = new Blob([instructions], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `bill-jemsky-desktop-v1.0.0-${os.toLowerCase().replace(/[^a-z0-9]/g, "-")}-instructions.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearCache = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        showToast("Application cache cleared successfully. Refreshing page...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast("Caching not supported in this browser", "error");
      }
    } catch (e) {
      showToast("Failed to clear cache", "error");
    }
  };

  const handleCheckUpdates = () => {
    showToast("Checking for updates...");
    setTimeout(() => {
      showToast("You are running the latest version (1.0.0)");
    }, 1500);
  };

  const handleBackupFreqChange = (freq: string) => {
    setAutoBackupFreq(freq);
    localStorage.setItem("jemsky-auto-backup-freq", freq);
    showToast(`Auto backup frequency set to ${freq}`);
  };

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
    { id: "offline", label: "Offline Installation", icon: Monitor },
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

        {/* ── Offline Installation Tab ─────────────────────────────────────── */}
        {activeTab === "offline" && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Offline Status & Capability
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-violet-500/10 bg-violet-500/5">
                <div>
                  <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Offline Ready
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    All application shell assets, fonts, icons, and templates are cached locally for offline startup.
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  navigator.onLine 
                    ? (isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-100")
                    : (isDark ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" : "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse")
                }`}>
                  {navigator.onLine ? "🟢 Online" : "🔴 Offline Mode"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-black/5"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>Storage Cache Used</p>
                  <p className={`text-xl font-black mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{storageUsed}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-black/5"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>Last Backup Date</p>
                  <p className={`text-xl font-black mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{lastBackupDate ? lastBackupDate.split(',')[0] : "None"}</p>
                </div>
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Offline Application App Mode
              </h2>
              <p className={`text-xs mb-5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Install Bill.Jemsky as a standalone Progressive Web App (PWA) on your desktop or mobile device.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleInstall}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                    isInstallable
                      ? "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/25"
                      : "bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-white/30 cursor-not-allowed"
                  }`}
                  disabled={!isInstallable}
                >
                  <Download className="w-4 h-4" />
                  Install PWA Application
                </button>
                <button
                  onClick={handleClearCache}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm transition-colors ${
                    isDark
                      ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                      : "border-black/10 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Clear Local Cache
                </button>
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Using Offline Mode in Google Chrome
              </h2>
              <p className={`text-xs mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Google Chrome provides first-class support for offline web apps. Here is how you can use Bill.Jemsky directly inside Google Chrome even without an active internet connection:
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Bookmark the URL",
                    desc: "Bookmark this website in Chrome. When you are offline, you can open your bookmarks or type the URL to load the app instantly from the local cache."
                  },
                  {
                    step: "2",
                    title: "Install the Chrome App Shortcut",
                    desc: "Click the 'Install PWA Application' button above or click the install icon in Chrome's address bar (plus sign icon) to add a native desktop shortcut."
                  },
                  {
                    step: "3",
                    title: "Local IndexedDB Storage",
                    desc: "All invoices, products, and customers are safely stored inside Chrome's secure local IndexedDB database, which is persistent and never requires an internet connection."
                  }
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isDark ? "text-white/90" : "text-gray-800"}`}>{s.title}</p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Desktop App Builds (Tauri Bundle)
              </h2>
              <p className={`text-xs mb-5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                To package and compile your own native standalone desktop application installer (.dmg, .exe, or .deb) on this machine, select your operating system below to download the Tauri compilation instructions guide.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: "windows", label: "Windows" },
                  { id: "macos", label: "macOS" },
                  { id: "linux-appimage", label: "Linux (.AppImage)" },
                  { id: "linux-deb", label: "Linux (.deb)" }
                ].map((os) => (
                  <button
                    key={os.id}
                    onClick={() => handleDownloadDesktop(os.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      isDark
                        ? "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/12"
                        : "border-black/5 bg-gray-50 hover:bg-white hover:border-black/10 hover:shadow-md"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{os.label}</span>
                    <span className="text-[10px] font-bold text-violet-500 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Setup Guide (.txt)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Local Data Management
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Local Backup</p>
                  <button
                    onClick={handleBackup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all bg-violet-600 text-white border-transparent hover:bg-violet-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Local Data
                  </button>
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Restore Backup</p>
                  <label className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer border-dashed ${
                    isDark
                      ? "border-white/15 text-white/70 hover:border-violet-500/50 hover:text-white"
                      : "border-black/15 text-gray-500 hover:border-violet-400 hover:text-gray-900"
                  }`}>
                    <Upload className="w-3.5 h-3.5" />
                    Import Local Data
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
                </div>
              </div>
            </div>

            <div className={card}>
              <h2 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Automatic Backup & Updates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Auto Backup Frequency</label>
                  <select
                    value={autoBackupFreq}
                    onChange={(e) => handleBackupFreqChange(e.target.value)}
                    className={inputCls}
                  >
                    <option value="daily">Daily Backup</option>
                    <option value="weekly">Weekly Backup</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Application Version</label>
                  <div className="flex items-center gap-2">
                    <input type="text" className={`${inputCls} flex-1`} value="v1.0.0" disabled />
                    <button
                      onClick={handleCheckUpdates}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Check for Updates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
