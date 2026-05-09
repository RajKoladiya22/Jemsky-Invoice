// ─── Constants ─────────────────────────────────────────────────────────────────
import {
    Building2,
    User,
    Hash,
    StickyNote,
    Receipt,
} from "lucide-react";
import type { InvoiceData, MobileSection } from "../../../types";
import { generateId } from "../../../utils/generateId";

export const CURRENCIES = [
    { code: "INR", symbol: "₹", label: "Indian Rupee" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
    { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
    { code: "AUD", symbol: "A$", label: "Australian Dollar" },
    { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
    { code: "JPY", symbol: "¥", label: "Japanese Yen" },
];

export const PAYMENT_TERMS = [
    "Due on Receipt",
    "Net 7",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
];

export const DB_NAME = "JemskyInvoice";
export const DB_VERSION = 2;
export const STORES = {
    invoices: "invoices",
    clients: "clients",
    products: "products",
    companies: "companies",
} as const;

// export const DEFAULT_INVOICE: InvoiceData = {
//     companyName: "",
//     companyEmail: "",
//     companyPhone: "",
//     companyAddress: "",
//     companyGST: "",
//     companyLogo: "",
//     clientName: "",
//     clientCompany: "",
//     clientEmail: "",
//     clientPhone: "",
//     clientAddress: "",
//     invoiceNumber: "",
//     invoiceDate: new Date().toISOString().split("T")[0],
//     dueDate: "",
//     currency: "INR",
//     currencySymbol: "₹",
//     paymentTerms: "Net 30",
//     poNumber: "",
//     hsnCode: "",
//     items: [
//         {
//             id: generateId(),
//             name: "",
//             description: "",
//             quantity: 1,
//             rate: 0,
//             tax: 0,
//             discount: 0,
//             hsn: "",
//         },
//     ],
//     notes: "",
//     terms:
//         "Payment is due within the specified payment terms. Late payments may incur additional charges.",
//     paymentDetails: "",
// };

export const DEFAULT_INVOICE: InvoiceData = {
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyGST: "",
    companyLogo: "",

    city: "",
    state: "",
    pincode: "",
    instagramHandle: "",

    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",

    invoiceNumber: "",
    billNumber: "",

    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",

    currency: "INR",
    currencySymbol: "₹",

    paymentTerms: "Net 30",
    paymentDetails: "",

    poNumber: "",

    hsnCode: "",
    hallmarkId: "",

    items: [
        {
            id: generateId(),

            name: "",
            description: "",

            quantity: 1,

            grossWeight: 0,
            netWeight: 0,

            rate: 0,
            labour: 0,

            amount: 0,

            tax: 0,
            discount: 0,

            hsn: "",
        },
    ],

    taxableAmount: 0,

    cgstRate: 1.5,
    cgstAmount: 0,

    sgstRate: 1.5,
    sgstAmount: 0,

    igstRate: 0,
    igstAmount: 0,

    totalTax: 0,

    grossTotal: 0,
    grandTotal: 0,

    oldPurchaseAmount: 0,
    dueAmount: 0,

    amountInWords: "",

    notes: "",

    terms:
        "Payment is due within the specified payment terms. Late payments may incur additional charges.",
};

export const MOBILE_SECTIONS: {
    id: MobileSection;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    sectionLabel: string;
}[] = [
        {
            id: "company",
            label: "Your Company",
            shortLabel: "Company",
            icon: Building2,
            sectionLabel: "Your Company",
        },
        {
            id: "client",
            label: "Bill To",
            shortLabel: "Client",
            icon: User,
            sectionLabel: "Bill To",
        },
        {
            id: "details",
            label: "Invoice Details",
            shortLabel: "Details",
            icon: Hash,
            sectionLabel: "Invoice Details",
        },
        {
            id: "items",
            label: "Line Items",
            shortLabel: "Items",
            icon: Receipt,
            sectionLabel: "Line Items",
        },
        {
            id: "notes",
            label: "Notes & Terms",
            shortLabel: "Notes",
            icon: StickyNote,
            sectionLabel: "Notes & Terms",
        },
    ];