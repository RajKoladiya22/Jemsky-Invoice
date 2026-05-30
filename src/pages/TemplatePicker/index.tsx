import React from "react";
import { X, ArrowLeft, Check, Zap } from "lucide-react";
import { BUSINESS_CATEGORIES } from "../../data/categorySchema";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useTheme } from "../../context/ThemeContext";

const PDF_LAYOUT_LABELS: Record<string, string> = {
  corporate: "A4 Corporate",
  modern: "A4 Modern",
  premium: "A4 Premium",
  minimal: "A4 Minimal",
  luxury: "A4 Luxury",
  industrial: "A4 Industrial",
  government: "Government Format",
  thermal: "Thermal Receipt",
  a5: "A5 Format",
};

const LAYOUT_PREVIEW_COLORS: Record<string, [string, string]> = {
  corporate:  ["#1e40af", "#3b82f6"],
  modern:     ["#7c3aed", "#a855f7"],
  premium:    ["#b45309", "#d97706"],
  minimal:    ["#374151", "#6b7280"],
  luxury:     ["#92400e", "#d97706"],
  industrial: ["#0f766e", "#14b8a6"],
  government: ["#1e3a8a", "#2563eb"],
  thermal:    ["#111827", "#374151"],
  a5:         ["#6d28d9", "#8b5cf6"],
};

export default function TemplatePicker() {
  const { isDark } = useTheme();
  const {
    businessCategory,
    templateVariant,
    setCategoryAndTemplate,
    closeTemplatePicker,
    openCategorySelection,
  } = useInvoiceStore();

  const category = BUSINESS_CATEGORIES.find((c) => c.id === businessCategory);
  if (!category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-enter"
      style={{ backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className={`template-panel-enter relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
          isDark
            ? "bg-[#0d0d0f] border border-white/10"
            : "bg-white border border-black/8"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-8 py-6 border-b shrink-0 ${
            isDark ? "border-white/8" : "border-black/6"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={openCategorySelection}
              className={`p-2 rounded-xl transition-colors mr-1 ${
                isDark
                  ? "hover:bg-white/8 text-white/50 hover:text-white"
                  : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              }`}
              aria-label="Back to categories"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${category.gradientFrom}, ${category.gradientTo})`,
              }}
            >
              {category.emoji}
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {category.label}
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-white/40" : "text-gray-500"
                }`}
              >
                Select a template — {category.templates.length} available
              </p>
            </div>
          </div>
          <button
            onClick={closeTemplatePicker}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? "hover:bg-white/8 text-white/50 hover:text-white"
                : "hover:bg-gray-100 text-gray-400 hover:text-gray-900"
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {category.templates.map((tmpl, idx) => {
              const [c1, c2] =
                LAYOUT_PREVIEW_COLORS[tmpl.pdfLayout] || ["#7c3aed", "#4c1d95"];
              const isActive = tmpl.id === templateVariant;

              return (
                <button
                  key={tmpl.id}
                  onClick={() =>
                    setCategoryAndTemplate(category.id, tmpl.id, tmpl.accentColor)
                  }
                  className={`template-card text-left rounded-2xl border overflow-hidden transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? "border-violet-500/70 bg-violet-500/8"
                        : "border-violet-500 bg-violet-50 shadow-xl shadow-violet-500/10"
                      : isDark
                        ? "bg-white/4 border-white/10 hover:border-white/25"
                        : "bg-white border-black/8 hover:border-black/16 hover:shadow-xl"
                  }`}
                >
                  {/* Accent gradient bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${c1}, ${c2})`,
                    }}
                  />

                  {/* Mini PDF preview */}
                  <div
                    className={`p-5 border-b ${
                      isDark ? "border-white/6" : "border-black/4"
                    }`}
                  >
                    <div
                      className={`rounded-xl overflow-hidden shadow-inner aspect-[1.414/1] flex flex-col p-3 gap-2 ${
                        isDark ? "bg-white/6" : "bg-gray-50"
                      }`}
                    >
                      {/* Simulated invoice header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div
                            className="h-2 w-16 rounded-full"
                            style={{ background: c1 }}
                          />
                          <div
                            className={`h-1 w-10 rounded-full ${
                              isDark ? "bg-white/15" : "bg-gray-200"
                            }`}
                          />
                        </div>
                        <div
                          className="h-5 w-5 rounded"
                          style={{
                            background: `linear-gradient(135deg, ${c1}, ${c2})`,
                          }}
                        />
                      </div>
                      {/* Simulated table */}
                      <div
                        className={`flex-1 rounded-lg overflow-hidden border ${
                          isDark ? "border-white/8" : "border-gray-200"
                        }`}
                      >
                        <div
                          className="h-3 w-full"
                          style={{
                            background: `linear-gradient(90deg, ${c1}22, ${c2}22)`,
                          }}
                        />
                        {[1, 2, 3].map((r) => (
                          <div
                            key={r}
                            className={`h-2 w-full border-t ${
                              isDark ? "border-white/4" : "border-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                      {/* Simulated totals */}
                      <div className="flex justify-end">
                        <div className="space-y-1 w-1/3">
                          <div
                            className={`h-1 rounded-full ${
                              isDark ? "bg-white/10" : "bg-gray-200"
                            }`}
                          />
                          <div
                            className="h-1.5 rounded-full"
                            style={{ background: c1 + "90" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`font-bold text-sm mb-0.5 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {tmpl.name}
                        </p>
                        <p
                          className={`text-xs leading-snug ${
                            isDark ? "text-white/40" : "text-gray-500"
                          }`}
                        >
                          {tmpl.description}
                        </p>
                      </div>
                      {idx === 0 && (
                        <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/15 text-violet-400">
                          <Zap className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isDark
                            ? "bg-white/6 text-white/40"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {PDF_LAYOUT_LABELS[tmpl.pdfLayout] || tmpl.pdfLayout}
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-violet-500">
                          <Check className="w-3 h-3" />
                          Selected
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold opacity-70"
                          style={{ color: tmpl.accentColor }}
                        >
                          Select →
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-8 py-4 border-t shrink-0 flex items-center justify-between ${
            isDark ? "border-white/6" : "border-black/5"
          }`}
        >
          <p
            className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
          >
            All templates include multi-page support, QR codes, and embedded
            logos.
          </p>
          <button
            onClick={openCategorySelection}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isDark
                ? "bg-white/6 hover:bg-white/10 text-white/60 hover:text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            ← Back to Categories
          </button>
        </div>
      </div>
    </div>
  );
}
