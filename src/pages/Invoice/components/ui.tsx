import type { ReactNode, ElementType } from "react";

// ─────────────────────────────────────────────────────────────
// Input Class Helper
// ─────────────────────────────────────────────────────────────

export function inputCls(
    isDark: boolean,
    error?: boolean,
    disabled?: boolean
) {
    return [
        "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",

        isDark
            ? [
                  "bg-white/[0.04]",
                  "border-white/[0.08]",
                  "text-white",
                  "placeholder:text-white/[0.20]",
                  "focus:border-violet-500/60",
                  "focus:bg-white/[0.06]",
              ].join(" ")
            : [
                  "bg-black/[0.03]",
                  "border-black/[0.08]",
                  "text-black",
                  "placeholder:text-black/[0.20]",
                  "focus:border-violet-500/60",
                  "focus:bg-black/[0.02]",
              ].join(" "),

        error
            ? "border-red-500/60 focus:border-red-500"
            : "",

        disabled ? "pointer-events-none" : "",
    ]
        .filter(Boolean)
        .join(" ");
}

// ─────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
    icon: ElementType;
    label: string;
    isDark: boolean;
    compact?: boolean;
    className?: string;
}

export function SectionHeader({
    icon: Icon,
    label,
    isDark,
    compact = false,
    className = "",
}: SectionHeaderProps) {
    return (
        <div
            className={`flex items-center gap-2 ${
                compact ? "mb-4" : "mb-5"
            } ${className}`}
        >
            <div
                className={`flex shrink-0 items-center justify-center rounded-lg bg-violet-500/12 ${
                    compact ? "h-6 w-6" : "h-7 w-7"
                }`}
            >
                <Icon
                    className={`text-violet-500 ${
                        compact ? "h-3 w-3" : "h-3.5 w-3.5"
                    }`}
                />
            </div>

            <span
                className={`uppercase tracking-widest font-bold ${
                    compact ? "text-[11px]" : "text-xs"
                } ${
                    isDark
                        ? "text-white/40"
                        : "text-black/40"
                }`}
            >
                {label}
            </span>

            <div
                className={`h-px flex-1 ${
                    isDark
                        ? "bg-white/6"
                        : "bg-black/6"
                }`}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Field Wrapper
// ─────────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    children: ReactNode;
    half?: boolean;
    optional?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
}

export function Field({
    label,
    children,
    half = false,
    optional = false,
    required = false,
    error,
    className = "",
}: FieldProps) {
    return (
        <div
            className={`${half ? "col-span-1" : "col-span-2"} ${className}`}
        >
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider opacity-60">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

                {optional && !required && (
                    <span className="ml-1 normal-case font-normal opacity-60">
                        (optional)
                    </span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}