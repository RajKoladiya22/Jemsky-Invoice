// ─── useLocalPrefs ──────────────────────────────────────────────────────────
// Reads / writes the jemsky-ui-prefs key in localStorage.
// All UI preferences that must survive page reload live here.

const PREFS_KEY = "jemsky-ui-prefs";

export interface UIPrefs {
  /** Sidebar collapsed to icon-only mode */
  sidebarCollapsed: boolean;
  /** Live preview panel visible on desktop */
  previewVisible: boolean;
  /** Active accordion section keys (array of open section ids) */
  openSections: string[];
  /** Last active main tab */
  activeTab: string;
  /** Preview zoom percentage */
  zoom: number;
  /** Preview device mode */
  deviceMode: "desktop" | "tablet" | "mobile" | "a4";
  /** Theme */
  theme: "dark" | "light";
  /** Automatically save invoices to IndexedDB on type */
  autosaveEnabled: boolean;
}

const DEFAULTS: UIPrefs = {
  sidebarCollapsed: false,
  previewVisible: true,
  openSections: ["business", "customer", "invoice", "items"],
  activeTab: "dashboard",
  zoom: 90,
  deviceMode: "desktop",
  theme: "dark",
  autosaveEnabled: false,
};

export function loadPrefs(): UIPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return { ...DEFAULTS, ...JSON.parse(raw) };
    }
  } catch (_) {}
  return { ...DEFAULTS };
}

export function savePrefs(prefs: Partial<UIPrefs>): void {
  try {
    const current = loadPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (_) {}
}

export function patchPrefs(patch: Partial<UIPrefs>): UIPrefs {
  const next = { ...loadPrefs(), ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}
