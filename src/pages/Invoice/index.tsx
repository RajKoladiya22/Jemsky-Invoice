import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Dashboard } from "../../components/Dashboard";
import { InvoiceList } from "../../components/InvoiceList";
import { InvoiceEditor } from "../../components/InvoiceEditor";
import { InvoicePreview } from "../../components/InvoicePreview";
import { CustomerManager } from "../../components/CustomerManager";
import { ProductManager } from "../../components/ProductManager";
import { BusinessProfileManager } from "../../components/BusinessProfileManager";
import SettingsPage from "../Settings";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useTheme } from "../../context/ThemeContext";
import { Eye, Edit3, EyeOff, PanelRight } from "lucide-react";
import CategorySelection from "../CategorySelection";
import TemplatePicker from "../TemplatePicker";
import { patchPrefs } from "../../hooks/useLocalPrefs";

export default function InvoicePage() {
  const { isDark, toggleTheme } = useTheme();
  const {
    activeTab,
    currentInvoice,
    loadAllData,
    isLoading,
    showCategorySelection,
    showTemplatePicker,
    sidebarCollapsed,
    previewVisible,
    togglePreview,
  } = useInvoiceStore();

  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("jemsky-editor-width");
      return saved ? Number(saved) : 45;
    } catch {
      return 45;
    }
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = editorWidth;
    const container = document.getElementById("workspace-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const pct = (deltaX / rect.width) * 100;
      const clamped = Math.max(25, Math.min(75, startWidth + pct));
      setEditorWidth(clamped);
      try {
        localStorage.setItem("jemsky-editor-width", String(clamped));
      } catch (err) {
        console.warn(err);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [editorWidth]);

  // Persist active tab on each change
  useEffect(() => {
    patchPrefs({ activeTab });
  }, [activeTab]);

  // Load IndexedDB caches on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Restore draft from localStorage on first load
  useEffect(() => {
    try {
      const draft = localStorage.getItem("jemsky-invoice-draft-v2");
      if (draft) {
        useInvoiceStore.getState().updateInvoiceFields(JSON.parse(draft));
      }
    } catch (e) {
      console.warn("Could not load draft:", e);
    }
  }, []);

  const renderActiveContent = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard isDark={isDark} />;
      case "invoices":
        return <InvoiceList isDark={isDark} />;
      case "clients":
        return <CustomerManager isDark={isDark} />;
      case "products":
        return <ProductManager isDark={isDark} />;
      case "profiles":
        return <BusinessProfileManager isDark={isDark} />;
      case "settings":
        return <SettingsPage />;
      case "editor":
        return (
          <div id="workspace-container" className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {/* ── Form Panel ──────────────────────────────────────────────── */}
            <div
              style={previewVisible ? { width: `${editorWidth}%` } : undefined}
              className={`flex flex-col border-r h-full transition-all duration-200 ${
                isDark ? "border-white/5" : "border-black/5"
              } ${
                // Desktop: show if visible; Mobile: show only when mobileView=form
                mobileView === "preview" ? "hidden md:flex" : "flex"
              } ${
                // Desktop width fallback class if preview hidden
                !previewVisible ? "md:w-full" : ""
              }`}
            >
              <InvoiceEditor isDark={isDark} />
            </div>

            {/* ── Draggable Divider (visible on desktop when preview is open) ── */}
            {previewVisible && (
              <div
                onMouseDown={handleMouseDown}
                className={`hidden md:block w-1 hover:w-1.5 hover:bg-violet-500/50 cursor-col-resize h-full transition-all shrink-0 z-30 select-none ${
                  isDark ? "bg-white/5 border-x border-white/10" : "bg-black/5 border-x border-black/5"
                }`}
              />
            )}

            {/* ── Preview Panel ─────────────────────────────────────────── */}
            {previewVisible && (
              <div
                className={`flex-1 flex flex-col h-full ${
                  mobileView === "form" ? "hidden md:flex" : "flex"
                }`}
              >
                <InvoicePreview
                  invoice={currentInvoice}
                  isDark={isDark}
                />
              </div>
            )}

            {/* ── Desktop Hide/Show Preview Toggle ──────────────────────── */}
            <button
              onClick={togglePreview}
              title={previewVisible ? "Hide Preview" : "Show Preview"}
              className={`hidden md:flex items-center gap-1.5 absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-lg ${
                isDark
                  ? "bg-[#111113] border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  : "bg-white border-black/10 text-black/60 hover:text-black hover:bg-gray-50"
              }`}
            >
              {previewVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hide Preview
                </>
              ) : (
                <>
                  <PanelRight className="w-3.5 h-3.5" /> Show Preview
                </>
              )}
            </button>

            {/* ── Mobile Toggle FAB ─────────────────────────────────────── */}
            <button
              onClick={() => setMobileView(mobileView === "form" ? "preview" : "form")}
              className="md:hidden fixed bottom-20 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl"
              aria-label={mobileView === "form" ? "Show Preview" : "Show Form"}
            >
              {mobileView === "form" ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </button>
          </div>
        );
      default:
        return <Dashboard isDark={isDark} />;
    }
  }, [activeTab, isDark, mobileView, previewVisible, togglePreview, currentInvoice, editorWidth, handleMouseDown]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-[#0c0c0e] text-[#f0ede8]" : "bg-[#f8f7f4] text-[#1a1a1a]"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Synchronizing Workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 overflow-hidden ${
        isDark ? "bg-[#0c0c0e] text-[#f0ede8]" : "bg-[#f8f7f4] text-[#1a1a1a]"
      }`}
    >
      {/* Left Sidebar */}
      <Sidebar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Top Bar */}
        <div
          className={`md:hidden shrink-0 flex items-center justify-between px-4 h-14 border-b ${
            isDark ? "bg-[#0c0c0e] border-white/5" : "bg-[#f8f7f4] border-black/5"
          }`}
        >
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">
            Bill.Jemsky
          </span>
          <span className={`text-xs font-semibold capitalize ${isDark ? "text-white/40" : "text-black/40"}`}>
            {activeTab}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">{renderActiveContent()}</div>
      </main>

      {/* Category Selection Modal */}
      {showCategorySelection && <CategorySelection />}

      {/* Template Picker Modal */}
      {showTemplatePicker && <TemplatePicker />}
    </div>
  );
}