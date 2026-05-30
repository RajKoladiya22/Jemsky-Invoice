import React, { useState, useMemo } from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
} from "lucide-react";
import type { SavedClient } from "../types";

interface CustomerManagerProps {
  isDark: boolean;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ isDark }) => {
  const { clients, saveClient, deleteClient } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingClient, setEditingClient] = useState<Partial<SavedClient> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const handleOpenForm = (client: SavedClient | null = null) => {
    if (client) {
      setEditingClient(client);
    } else {
      setEditingClient({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        shippingAddress: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name) return;

    await saveClient(editingClient as SavedClient);
    setIsOpen(false);
    setEditingClient(null);
  };

  const inputBgCls = isDark 
    ? "bg-white/[0.04] border-white/[0.08] text-white focus:border-violet-500/60 focus:bg-white/[0.06]" 
    : "bg-black/[0.03] border-black/[0.08] text-black focus:border-violet-500/60 focus:bg-black/[0.02]";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Database</h1>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Save customer profiles and billing addresses to auto-fill invoices.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/15"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Customer
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
            placeholder="Search by client name, company, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputBgCls}`}
          />
        </div>
      </div>

      {/* Grid of Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-30 text-violet-500" />
          <p className="text-sm font-semibold">No customers registered yet</p>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
            Register a new customer using the 'Add Customer' action.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isDark ? "bg-[#161618] border-white/5" : "bg-white border-black/5 hover:shadow-lg hover:shadow-black/5"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3.5">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{client.name}</h3>
                    {client.company && (
                      <p className="text-[11px] text-violet-500 font-semibold mt-0.5 truncate flex items-center gap-1">
                        <Building className="w-3 h-3" /> {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenForm(client)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                          await deleteClient(client.id);
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

                <div className="space-y-1.5 text-xs text-gray-500">
                  {client.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {client.phone}
                    </p>
                  )}
                  {client.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {client.email}
                    </p>
                  )}
                  {client.gstNumber && (
                    <p className="flex items-center gap-2 text-[10px] font-bold text-gray-700 dark:text-white/60">
                      <FileText className="w-3.5 h-3.5 text-gray-400" /> GST: {client.gstNumber}
                    </p>
                  )}
                </div>

                {(client.address || client.shippingAddress) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2.5">
                    {client.address && (
                      <div className="flex gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold uppercase text-gray-400">Billing Address</p>
                          <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed mt-0.5 line-clamp-2">
                            {client.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal Form */}
      {isOpen && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? "bg-[#111113] border-white/10 text-white" : "bg-white border-black/10 text-black"
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-white/5 shrink-0">
              <h2 className="text-base font-bold">
                {editingClient.id ? "Edit Customer Details" : "Register Customer"}
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
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.name || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editingClient.company || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingClient.email || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingClient.phone || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    value={editingClient.gstNumber || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, gstNumber: e.target.value.toUpperCase() })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all font-mono ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    value={editingClient.address || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Shipping Address (if different)
                  </label>
                  <textarea
                    rows={2}
                    value={editingClient.shippingAddress || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, shippingAddress: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all resize-none ${inputBgCls}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={editingClient.notes || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all ${inputBgCls}`}
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
