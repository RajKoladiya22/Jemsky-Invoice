import React, { useState, useMemo } from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Upload,
  Globe,
  Briefcase,
  Smartphone,
  Mail,
  Home,
  CreditCard,
  FileCheck,
  Database,
  Download,
  LucideImageMinus,
} from "lucide-react";
import type { SavedCompany } from "../types";
import { exportDatabaseToJSON, importDatabaseFromJSON } from "../utils/backupRestore";

interface BusinessProfileManagerProps {
  isDark: boolean;
}

export const BusinessProfileManager: React.FC<BusinessProfileManagerProps> = ({ isDark }) => {
  const { companies, saveCompany, deleteCompany, switchCompanyProfile } = useInvoiceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<SavedCompany> | null>(null);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  const handleExportBackup = async () => {
    setIsBackupRunning(true);
    try {
      await exportDatabaseToJSON();
    } catch (err) {
      alert("Failed to export database: " + err);
    } finally {
      setIsBackupRunning(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to restore this backup? This will overwrite all your current local invoices, clients, products, and business profiles.")) {
      e.target.value = "";
      return;
    }

    setIsBackupRunning(true);
    try {
      await importDatabaseFromJSON(file);
      alert("Database restored successfully offline! Your workspace has been updated.");
    } catch (err) {
      alert("Restoration failed: " + err);
    } finally {
      setIsBackupRunning(false);
      e.target.value = "";
    }
  };

  const handleOpenForm = (company: SavedCompany | null = null) => {
    if (company) {
      setEditingCompany(company);
    } else {
      setEditingCompany({
        name: "",
        email: "",
        phone: "",
        address: "",
        gst: "",
        logo: "",
        pan: "",
        city: "",
        state: "",
        pincode: "",
        instagramHandle: "",
        bankName: "",
        bankBranch: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        signature: "",
        stamp: "",
        terms: "Payment is due within the specified terms. Late payments may incur charges.",
        isDefault: companies.length === 0, // Set default if first company
      });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editingCompany.name) return;

    await saveCompany(editingCompany as SavedCompany);
    setIsOpen(false);
    setEditingCompany(null);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "signature" | "stamp"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 500KB to prevent Dexie db bloat
    if (file.size > 500 * 1024) {
      alert("Image size exceeds 500KB limit. Please choose a smaller or compressed image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditingCompany((prev) => ({
          ...prev,
          [field]: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: "logo" | "signature" | "stamp") => {
    setEditingCompany((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const inputBgCls = isDark 
    ? "bg-white/[0.04] border-white/[0.08] text-white focus:border-violet-500/60 focus:bg-white/[0.06]" 
    : "bg-black/[0.03] border-black/[0.08] text-black focus:border-violet-500/60 focus:bg-black/[0.02]";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Profiles</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Register multiple company branches or business identities and toggle them instantly.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/15"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Business
        </button>
      </div>

      {/* Grid of Company Profiles */}
      {companies.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30 text-violet-500" />
          <p className="text-sm font-semibold">No business profiles created</p>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Create a profile to configure your business name, logos, and banking settlement terms.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`p-6 rounded-3xl border relative transition-all flex flex-col justify-between ${
                company.isDefault 
                  ? "border-violet-500/40 bg-gradient-to-br from-violet-500/[0.03] to-violet-500/[0.005] ring-1 ring-violet-500/10" 
                  : isDark 
                    ? "bg-[#161618] border-white/5" 
                    : "bg-white border-black/5 hover:shadow-lg hover:shadow-black/5"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-3.5">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt="Logo"
                        className="w-12 h-12 rounded-xl object-contain border border-gray-200 dark:border-white/5 p-1 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {company.name}
                        {company.isDefault && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                            Active Default
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">GSTIN: {company.gst || "—"}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {!company.isDefault && (
                      <button
                        onClick={() => switchCompanyProfile(company.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          isDark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-black/5 text-black/60 hover:bg-black/10"
                        }`}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenForm(company)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete profile: ${company.name}?`)) {
                          await deleteCompany(company.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark 
                          ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" 
                          : "hover:bg-red-500/10 text-black/30 hover:text-red-500"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Contacts</span>
                    <p className="truncate flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {company.email || "—"}</p>
                    <p className="mt-1 flex items-center gap-1"><Smartphone className="w-3 h-3 text-gray-400" /> {company.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Address</span>
                    <p className="line-clamp-2 leading-relaxed flex items-start gap-1"><Home className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" /> {company.address || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Local Database Backup & Recovery Panel */}
      <div className={`p-6 rounded-3xl border transition-all duration-200 ${
        isDark ? "bg-[#161618] border-white/5 hover:bg-white/[0.04]" : "bg-white border-black/5 hover:shadow-lg hover:shadow-black/5"
      }`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Local Database Backup & Recovery</h3>
              <p className={`text-[10px] mt-0.5 leading-relaxed ${isDark ? "text-white/40" : "text-black/40"}`}>
                Download secure JSON backups of all local company profiles, clients, products, and invoices, or restore a previous session entirely offline.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              disabled={isBackupRunning}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark 
                  ? "border-white/10 hover:bg-white/5 text-white/80" 
                  : "border-black/10 hover:bg-black/5 text-black/70"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export Backup
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/15 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={isBackupRunning}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* CRUD Modal Form */}
      {isOpen && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? "bg-[#111113] border-white/10 text-white" : "bg-white border-black/10 text-black"
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-white/5 shrink-0">
              <h2 className="text-base font-bold">
                {editingCompany.id ? "Edit Business Profile" : "Register Business Profile"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-black/5 text-black/40"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Images Upload Row */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.01] border border-gray-150 dark:border-white/5">
                {/* Logo Upload */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Company Logo</span>
                  {editingCompany.logo ? (
                    <div className="relative group w-20 h-20 rounded-xl overflow-hidden border bg-white border-gray-200">
                      <img src={editingCompany.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("logo")}
                        className="absolute inset-0 bg-red-600/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDark ? "hover:border-violet-500/50 hover:bg-white/2" : "hover:border-violet-500/50 hover:bg-black/2"
                    }`}>
                      <Upload className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Stamp Upload */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Official Stamp</span>
                  {editingCompany.stamp ? (
                    <div className="relative group w-20 h-20 rounded-xl overflow-hidden border bg-white border-gray-200">
                      <img src={editingCompany.stamp} alt="Stamp" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("stamp")}
                        className="absolute inset-0 bg-red-600/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDark ? "hover:border-violet-500/50 hover:bg-white/2" : "hover:border-violet-500/50 hover:bg-black/2"
                    }`}>
                      <Upload className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "stamp")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Signature Upload */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Signature Asset</span>
                  {editingCompany.signature ? (
                    <div className="relative group w-20 h-20 rounded-xl overflow-hidden border bg-white border-gray-200">
                      <img src={editingCompany.signature} alt="Sig" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("signature")}
                        className="absolute inset-0 bg-red-600/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDark ? "hover:border-violet-500/50 hover:bg-white/2" : "hover:border-violet-500/50 hover:bg-black/2"
                    }`}>
                      <Upload className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "signature")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* General Business Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 border-b pb-1">
                  General Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCompany.name || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      GSTIN (GST Number)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24ABCDE1234F1Z5"
                      value={editingCompany.gst || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, gst: e.target.value.toUpperCase() })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingCompany.phone || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editingCompany.email || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Full Address
                    </label>
                    <textarea
                      rows={2}
                      value={editingCompany.address || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingCompany.city || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={editingCompany.state || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, state: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Pincode / ZIP
                    </label>
                    <input
                      type="text"
                      value={editingCompany.pincode || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, pincode: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1 flex items-center gap-1">
                      <LucideImageMinus className="w-3.5 h-3.5" /> Instagram Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@handle"
                      value={editingCompany.instagramHandle || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, instagramHandle: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Banking & UPI */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 border-b pb-1">
                  Settlement & Payments Info
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={editingCompany.bankName || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, bankName: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={editingCompany.bankBranch || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, bankBranch: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={editingCompany.accountNumber || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, accountNumber: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={editingCompany.ifscCode || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, ifscCode: e.target.value.toUpperCase() })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      UPI ID (for payments QR Code)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. name@bank"
                      value={editingCompany.upiId || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, upiId: e.target.value })}
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                    />
                  </div>
                </div>
              </div>

              {/* Set Default */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={editingCompany.isDefault || false}
                  onChange={(e) => setEditingCompany({ ...editingCompany, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-600 dark:text-white/60 cursor-pointer select-none">
                  Set as default business profile
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
