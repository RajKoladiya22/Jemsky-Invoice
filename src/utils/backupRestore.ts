import { db } from "../lib/db";
import { useInvoiceStore } from "../store/invoiceStore";

interface BackupData {
  version: number;
  timestamp: string;
  brand: string;
  data: {
    invoices: any[];
    clients: any[];
    products: any[];
    companies: any[];
  };
}

/**
 * Exports the entire offline database to a secure, human-readable JSON backup file.
 */
export async function exportDatabaseToJSON(): Promise<void> {
  try {
    const invoices = await db.invoices.toArray();
    const clients = await db.clients.toArray();
    const products = await db.products.toArray();
    const companies = await db.companies.toArray();

    const backup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      brand: "Bill.Jemsky",
      data: { invoices, clients, products, companies },
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `Bill-Jemsky-Backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to generate database backup:", err);
    throw new Error("Failed to generate database backup.");
  }
}

/**
 * Imports a JSON backup file and restores the tables, then updates the Zustand store.
 */
export function importDatabaseFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("Backup file is empty.");

        const parsed = JSON.parse(text) as BackupData;

        if (parsed.brand !== "Bill.Jemsky" && parsed.brand !== "Jemsky") {
          throw new Error("Invalid backup file: Incorrect brand identity.");
        }

        if (!parsed.data || typeof parsed.data !== "object") {
          throw new Error("Invalid backup file: Missing collections container.");
        }

        const { invoices, clients, products, companies } = parsed.data;

        if (
          !Array.isArray(invoices) ||
          !Array.isArray(clients) ||
          !Array.isArray(products) ||
          !Array.isArray(companies)
        ) {
          throw new Error("Invalid backup file format: Missing table arrays.");
        }

        await db.transaction("readwrite", [db.invoices, db.clients, db.products, db.companies], async () => {
          await db.invoices.clear();
          await db.clients.clear();
          await db.products.clear();
          await db.companies.clear();

          for (const inv of invoices) await db.invoices.put(inv);
          for (const cli of clients) await db.clients.put(cli);
          for (const prod of products) await db.products.put(prod);
          for (const comp of companies) await db.companies.put(comp);
        });

        await useInvoiceStore.getState().loadAllData();
        resolve();
      } catch (err: any) {
        console.error("Backup restoration failed:", err);
        reject(err?.message || "Backup restoration failed.");
      }
    };

    reader.onerror = () => reject("Error reading backup file.");
    reader.readAsText(file);
  });
}

// ─── Aliases used by Settings page ─────────────────────────────────────────
export const exportAllDataToJSON = exportDatabaseToJSON;
export const importDataFromJSON = importDatabaseFromJSON;
