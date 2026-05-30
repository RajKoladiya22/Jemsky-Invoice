import React, { useState, useMemo } from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Tag,
  DollarSign,
  Briefcase,
  Percent,
} from "lucide-react";
import type { SavedProduct } from "../types";
import { fmt } from "../pages/Invoice/components/calculation";

interface ProductManagerProps {
  isDark: boolean;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ isDark }) => {
  const { products, saveProduct, deleteProduct } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<SavedProduct> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.hsn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleOpenForm = (product: SavedProduct | null = null) => {
    if (product) {
      setEditingProduct(product);
    } else {
      setEditingProduct({
        name: "",
        sku: "",
        hsn: "",
        unit: "Pcs",
        tax: 0,
        rate: 0,
        description: "",
      });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    await saveProduct(editingProduct as SavedProduct);
    setIsOpen(false);
    setEditingProduct(null);
  };

  const inputBgCls = isDark 
    ? "bg-white/[0.04] border-white/[0.08] text-white focus:border-violet-500/60 focus:bg-white/[0.06]" 
    : "bg-black/[0.03] border-black/[0.08] text-black focus:border-violet-500/60 focus:bg-black/[0.02]";

  const sym = products[0]?.id ? "₹" : "₹"; // Default to INR symbol for Indian business settings, customizable on invoice

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Manage your service lines, bulk inventory, or ornaments to load them in one-click.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/15"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </button>
      </div>

      {/* Search Filter Controls */}
      <div className={`p-4 rounded-2xl border ${
        isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5"
      }`}>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, HSN, specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputBgCls}`}
          />
        </div>
      </div>

      {/* Grid of Catalog Cards */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-8 h-8 mx-auto mb-3 opacity-30 text-violet-500" />
          <p className="text-sm font-semibold">Product Catalog is empty</p>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Register catalog items using the 'Add Product' button.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5 hover:shadow-lg hover:shadow-black/5"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{p.name}</h3>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {p.sku && (
                        <span className="text-[9px] font-bold tracking-tight px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 font-mono">
                          SKU: {p.sku}
                        </span>
                      )}
                      {p.hsn && (
                        <span className="text-[9px] font-bold tracking-tight px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-500 font-mono">
                          HSN: {p.hsn}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenForm(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${p.name}?`)) {
                          await deleteProduct(p.id);
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

                {p.description && (
                  <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${isDark ? "text-white/40" : "text-black/40"}`}>
                    {p.description}
                  </p>
                )}
              </div>

              <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Base Rate</p>
                  <p className="text-base font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                    {fmt(sym, Number(p.rate))} <span className="text-[10px] font-normal text-gray-400">/ {p.unit || "Pcs"}</span>
                  </p>
                </div>
                {Number(p.tax) > 0 && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    {p.tax}% GST
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal Form */}
      {isOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? "bg-[#111113] border-white/10 text-white" : "bg-white border-black/10 text-black"
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-white/5 shrink-0">
              <h2 className="text-base font-bold">
                {editingProduct.id ? "Edit Catalog Item" : "New Catalog Item"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-black/5 text-black/40"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Product / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    HSN/SAC Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.hsn || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, hsn: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Default Unit
                  </label>
                  <select
                    value={editingProduct.unit || "Pcs"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all cursor-pointer ${inputBgCls}`}
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg (Kilograms)</option>
                    <option value="Gm">Gm (Grams)</option>
                    <option value="Hrs">Hrs (Hours)</option>
                    <option value="Nos">Nos (Numbers)</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.tax ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tax: Number(e.target.value) || 0 })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Default Sales Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.rate ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rate: Number(e.target.value) || 0 })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                  />
                </div>
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
