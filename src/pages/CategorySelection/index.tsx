import React, { useState } from "react";
import { X, Search, FileText } from "lucide-react";
import { BUSINESS_CATEGORIES, type BusinessCategory } from "../../data/categorySchema";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useTheme } from "../../context/ThemeContext";

export default function CategorySelection() {
  const { isDark } = useTheme();
  const { closeCategorySelection, openTemplatePicker } = useInvoiceStore();
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = BUSINESS_CATEGORIES.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cat: BusinessCategory) => {
    useInvoiceStore.setState({ businessCategory: cat.id });
    openTemplatePicker();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-enter"
      style={{ backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className={`category-panel-enter relative w-full max-w-7xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Select Business Category
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-white/40" : "text-gray-500"
                }`}
              >
                Choose your industry to get the perfect invoice template
              </p>
            </div>
          </div>
          <button
            onClick={closeCategorySelection}
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

        {/* Search */}
        <div
          className={`px-8 py-4 border-b shrink-0 ${
            isDark ? "border-white/6" : "border-black/5"
          }`}
        >
          <div className="relative max-w-md">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:bg-white/8"
                  : "bg-gray-50 border-black/8 text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white"
              }`}
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 stagger-children">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat)}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`cat-card-glow text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isDark
                    ? "bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/20"
                    : "bg-gray-50 border-black/6 hover:bg-white hover:border-black/12 hover:shadow-xl"
                } ${hoveredId === cat.id ? "scale-[1.02] -translate-y-0.5" : ""}`}
                style={
                  {
                    "--card-glow-color": cat.accentColor + "44",
                  } as React.CSSProperties
                }
              >
                {/* Emoji circle with gradient */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${cat.gradientFrom}, ${cat.gradientTo})`,
                  }}
                >
                  {cat.emoji}
                </div>

                {/* Category info */}
                <p
                  className={`font-bold text-sm leading-snug mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {cat.label}
                </p>
                <p
                  className={`text-xs leading-snug line-clamp-2 ${
                    isDark ? "text-white/40" : "text-gray-500"
                  }`}
                >
                  {cat.description}
                </p>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p
                  className={`text-sm ${
                    isDark ? "text-white/30" : "text-gray-400"
                  }`}
                >
                  No categories match &ldquo;{search}&rdquo;
                </p>
              </div>
            )}
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
            {BUSINESS_CATEGORIES.length} categories · Click a category to pick
            a template
          </p>
          <button
            onClick={closeCategorySelection}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isDark
                ? "bg-white/6 hover:bg-white/10 text-white/60 hover:text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
