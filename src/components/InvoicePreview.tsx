import React, { useState, useEffect } from "react";
import type { InvoiceData } from "../types";
import {
  MinimalTemplate,
  ModernTemplate,
  PremiumTemplate,
  JewelryTemplate,
  ManufacturingTemplate,
  WholesaleTemplate,
  ServiceTemplate,
  ContractorTemplate,
} from "./templates/InvoiceTemplates";
import {
  ZoomIn,
  ZoomOut,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  RefreshCcw,
} from "lucide-react";
import { generateUPIQRCode } from "../utils/qrGenerator";

interface InvoicePreviewProps {
  invoice: InvoiceData;
  isDark: boolean;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, isDark }) => {
  const [zoom, setZoom] = useState<number>(() => {
    try {
      const val = localStorage.getItem("jemsky-preview-zoom");
      return val ? Number(val) : 100;
    } catch {
      return 100;
    }
  });
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    try {
      const val = localStorage.getItem("jemsky-preview-device-mode");
      return (val as DeviceMode) || "desktop";
    } catch {
      return "desktop";
    }
  });
  const [qrUrl, setQrUrl] = useState("");

  // Persist zoom & deviceMode
  useEffect(() => {
    try {
      localStorage.setItem("jemsky-preview-zoom", String(zoom));
    } catch (e) {
      console.warn(e);
    }
  }, [zoom]);

  useEffect(() => {
    try {
      localStorage.setItem("jemsky-preview-device-mode", deviceMode);
    } catch (e) {
      console.warn(e);
    }
  }, [deviceMode]);

  // Re-generate UPI QR code as the user types UPI details or totals update
  useEffect(() => {
    let active = true;
    const fetchQR = async () => {
      if (invoice.upiId) {
        const url = await generateUPIQRCode(
          invoice.upiId,
          invoice.companyName || "Merchant",
          invoice.dueAmount || invoice.grandTotal,
          invoice.currency,
          invoice.invoiceNumber
        );
        if (active) setQrUrl(url);
      } else {
        if (active) setQrUrl("");
      }
    };
    fetchQR();
    return () => {
      active = false;
    };
  }, [invoice.upiId, invoice.companyName, invoice.dueAmount, invoice.grandTotal, invoice.currency, invoice.invoiceNumber]);

  const renderTemplate = () => {
    const props = { invoice, qrCodeUrl: qrUrl, isDark };
    const category = invoice.templateCategory || "modern";
    
    switch (category) {
      case "minimal":
        return <MinimalTemplate {...props} />;
      case "premium":
        return <PremiumTemplate {...props} />;
      case "jewelry":
        return <JewelryTemplate {...props} />;
      case "manufacturing":
        return <ManufacturingTemplate {...props} />;
      case "wholesale":
        return <WholesaleTemplate {...props} />;
      case "service":
        return <ServiceTemplate {...props} />;
      case "contractor":
        return <ContractorTemplate {...props} />;
      case "modern":
      case "tax":
      case "proforma":
      case "quotation":
      case "challan":
      case "credit":
      case "debit":
      default:
        return <ModernTemplate {...props} />;
    }
  };

  // Device widths
  const deviceWidths = {
    desktop: "w-full",
    tablet: "max-w-[600px] border border-dashed border-gray-400 dark:border-white/10 rounded-2xl",
    mobile: "max-w-[360px] border border-dashed border-gray-400 dark:border-white/10 rounded-2xl",
  };

  return (
    <div className="flex flex-col h-full shrink-0">
      {/* Top Preview Control Bar */}
      <div className={`flex justify-between items-center p-3 border-b shrink-0 text-xs ${
        isDark ? "bg-[#111113] border-white/5" : "bg-white border-black/5"
      }`}>
        <div className="flex items-center gap-1">
          {/* Zoom Buttons */}
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"}`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-500 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"}`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black"}`}
            title="Reset Zoom"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Device Selection Tabs */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          {(["desktop", "tablet", "mobile"] as const).map((mode) => {
            const Icon = mode === "desktop" ? Monitor : mode === "tablet" ? TabletIcon : Smartphone;
            return (
              <button
                key={mode}
                onClick={() => setDeviceMode(mode)}
                className={`p-2 rounded-lg transition-colors ${
                  deviceMode === mode
                    ? isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm"
                    : isDark ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>


      </div>

      {/* Preview Sheet Area */}
      <div className={`flex-1 overflow-auto p-8 flex justify-center items-start ${
        isDark ? "bg-[#08080a]" : "bg-[#f5f5f7]"
      }`}>
        <div 
          className={`origin-top transition-transform duration-200 shadow-2xl ${deviceWidths[deviceMode]}`}
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div id="invoice-preview-container" className="shadow-2xl overflow-hidden rounded-2xl">
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};
