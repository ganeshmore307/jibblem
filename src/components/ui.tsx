"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";

export function Avatar({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "orange" | "red" | "blue" }) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    orange: "bg-brand-light text-brand-dark",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function TabLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap ${
        active ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export function TabBar({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1 border-b border-line bg-white px-4 overflow-x-auto">{children}</div>;
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f7770f" strokeWidth="2">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      </div>
      <div className="font-extrabold text-ink">{title}</div>
      {subtitle && <div className="text-sm text-muted mt-1 max-w-sm">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Drawer({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full ${wide ? "sm:w-[560px]" : "sm:w-[440px]"} bg-white shadow-drawer flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-extrabold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">{children}</div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-drawer w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${checked ? "bg-brand" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white";
export const btnPrimary =
  "rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold px-4 py-2 disabled:opacity-60";
export const btnGhost =
  "rounded-lg border border-line bg-white hover:bg-gray-50 text-sm font-bold px-4 py-2 text-ink";

export function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 mb-3">{error}</div>;
}
