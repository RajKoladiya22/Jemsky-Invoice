import Dexie, { type Table } from "dexie";
import type { SavedClient, SavedProduct, SavedCompany, SavedInvoice, InvoiceTemplateConfig } from "../types";

export class JemskyDatabase extends Dexie {
  invoices!: Table<SavedInvoice, string>;
  clients!: Table<SavedClient, string>;
  products!: Table<SavedProduct, string>;
  companies!: Table<SavedCompany, string>;
  templates!: Table<InvoiceTemplateConfig, string>;

  constructor() {
    super("JemskyInvoiceDB");
    
    this.version(1).stores({
      invoices: "id, invoiceNumber, invoiceDate, clientName, grandTotal, status, savedAt",
      clients: "id, name, company, email, phone",
      products: "id, name, rate, tax, hsn",
      companies: "id, name, email, gst, isDefault",
      templates: "id, name, category",
    });

    // Version 2: Add businessCategory index for industry-based filtering
    this.version(2).stores({
      invoices: "id, invoiceNumber, invoiceDate, clientName, grandTotal, status, savedAt, businessCategory",
      clients: "id, name, company, email, phone",
      products: "id, name, rate, tax, hsn",
      companies: "id, name, email, gst, isDefault",
      templates: "id, name, category",
    });
  }
}

export const db = new JemskyDatabase();
