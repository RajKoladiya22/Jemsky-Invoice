import React from "react";
import { useInvoiceStore } from "../store/invoiceStore";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Users,
  Package,
  Building2,
  Moon,
  Sun,
  Settings,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { BUSINESS_CATEGORIES } from "../data/categorySchema";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isDark, toggleTheme }) => {
  const {
    activeTab,
    setActiveTab,
    openCategorySelection,
    businessCategory,
    sidebarCollapsed,
    toggleSidebar,
  } = useInvoiceStore();

  const currentCatEmoji = BUSINESS_CATEGORIES.find((c) => c.id === businessCategory)?.emoji;

  type NavItem = {
    id: "dashboard" | "invoices" | "editor" | "clients" | "products" | "profiles" | "settings";
    label: string;
    icon: React.ElementType;
    badge?: string;
    action?: () => void;
  };

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices", icon: List },
    {
      id: "editor",
      label: "Create Invoice",
      icon: FilePlus,
      badge: currentCatEmoji,
      action: openCategorySelection,
    },
    { id: "clients", label: "Customers", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "profiles", label: "Business Profiles", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const itemCls = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
        : isDark
        ? "text-white/50 hover:bg-white/5 hover:text-white"
        : "text-black/50 hover:bg-black/5 hover:text-black"
    }`;

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col border-r shrink-0 min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? "w-[64px]" : "w-[240px]"
        } ${isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5"}`}
      >
        {/* Logo row */}
        <div
          className={`flex items-center h-16 border-b border-inherit shrink-0 transition-all duration-200 ${
            sidebarCollapsed ? "justify-center px-2" : "gap-3 px-5"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-[15px] font-black bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent leading-none tracking-tight">
                Bill.Jemsky
              </h1>
              <p
                className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
                  isDark ? "text-white/25" : "text-black/25"
                }`}
              >
                Invoice Hub
              </p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className={`flex-1 py-4 space-y-1 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (sidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    item.action ? item.action() : setActiveTab(item.id)
                  }
                  title={item.label}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : isDark
                      ? "text-white/40 hover:bg-white/6 hover:text-white"
                      : "text-black/40 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <span className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() =>
                  item.action ? item.action() : setActiveTab(item.id)
                }
                className={itemCls(isActive)}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-violet-500"
                  }`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className={`text-base ${isActive ? "opacity-100" : "opacity-60"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom area: theme toggle + collapse */}
        <div className={`border-t border-inherit pb-4 ${sidebarCollapsed ? "px-2 pt-3 space-y-2" : "px-3 pt-3 space-y-2"}`}>
          {/* Theme toggle */}
          {sidebarCollapsed ? (
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-colors ${
                isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-black/5 text-black/40"
              }`}
            >
              {isDark ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isDark
                  ? "bg-white/5 hover:bg-white/10 text-white/60"
                  : "bg-black/5 hover:bg-black/10 text-black/60"
              }`}
            >
              <span className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-violet-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
              <div
                className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${
                  isDark ? "bg-violet-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    isDark ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-colors ${
              isDark
                ? "hover:bg-white/5 text-white/25 hover:text-white/60"
                : "hover:bg-black/5 text-black/20 hover:text-black/50"
            }`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────────── */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t flex justify-around items-center px-2 transition-colors duration-300 ${
          isDark
            ? "bg-[#0c0c0e]/95 border-white/5 backdrop-blur-md"
            : "bg-white/95 border-black/5 backdrop-blur-md"
        }`}
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                item.action ? item.action() : setActiveTab(item.id)
              }
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-violet-500"
                  : isDark
                  ? "text-white/30"
                  : "text-black/30"
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5 shrink-0" />
                {item.badge && isActive && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px]">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-bold tracking-tight">
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
