import {
    STORES,
    DB_NAME,
    DB_VERSION,
} from "./constants";

// ─────────────────────────────────────────────────────────────
// DB Singleton
// ─────────────────────────────────────────────────────────────

export let _db: IDBDatabase | null = null;

// ─────────────────────────────────────────────────────────────
// Open Database
// ─────────────────────────────────────────────────────────────

export function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (_db) {
            return resolve(_db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Create / Upgrade
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            Object.values(STORES).forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, {
                        keyPath: "id",
                    });
                }
            });
        };

        // Success
        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Handle version changes safely
            db.onversionchange = () => {
                db.close();
                _db = null;
            };

            _db = db;

            resolve(db);
        };

        // Error
        request.onerror = () => {
            reject(request.error);
        };

        // Blocked upgrade
        request.onblocked = () => {
            reject(
                new Error(
                    "Database upgrade blocked. Close other tabs using this app."
                )
            );
        };
    });
}

// ─────────────────────────────────────────────────────────────
// Put Record
// ─────────────────────────────────────────────────────────────

export async function dbPut<T extends { id: string }>(
    store: string,
    obj: T
): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");

        tx.objectStore(store).put(obj);

        tx.oncomplete = () => {
            resolve();
        };

        tx.onerror = () => {
            reject(tx.error);
        };

        tx.onabort = () => {
            reject(tx.error);
        };
    });
}

// ─────────────────────────────────────────────────────────────
// Get All Records
// ─────────────────────────────────────────────────────────────

export async function dbGetAll<T>(
    store: string
): Promise<T[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");

        const request = tx.objectStore(store).getAll();

        request.onsuccess = () => {
            resolve(request.result as T[]);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ─────────────────────────────────────────────────────────────
// Get Single Record
// ─────────────────────────────────────────────────────────────

export async function dbGetById<T>(
    store: string,
    id: string
): Promise<T | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");

        const request = tx.objectStore(store).get(id);

        request.onsuccess = () => {
            resolve(request.result as T | undefined);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ─────────────────────────────────────────────────────────────
// Delete Record
// ─────────────────────────────────────────────────────────────

export async function dbDelete(
    store: string,
    id: string
): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");

        tx.objectStore(store).delete(id);

        tx.oncomplete = () => {
            resolve();
        };

        tx.onerror = () => {
            reject(tx.error);
        };

        tx.onabort = () => {
            reject(tx.error);
        };
    });
}

// ─────────────────────────────────────────────────────────────
// Clear Store
// ─────────────────────────────────────────────────────────────

export async function dbClear(
    store: string
): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");

        tx.objectStore(store).clear();

        tx.oncomplete = () => {
            resolve();
        };

        tx.onerror = () => {
            reject(tx.error);
        };
    });
}