"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clienti", label: "Clienti" },
  { href: "/impostazioni", label: "Impostazioni" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="text-lg font-semibold text-stone-900">
              Studio
            </Link>
            <p className="text-sm text-stone-500">Promemoria e cartelle clienti</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/clienti"
                  ? pathname === "/clienti" || pathname.startsWith("/clienti/")
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-emerald-900 text-white"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
