"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type NavChild = { href: string; label: string };
type NavItem = { href: string; label: string; children?: NavChild[] };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  {
    href: "/clienti",
    label: "Clienti",
    children: [{ href: "/abbinamenti", label: "Da abbinare" }],
  },
  { href: "/fatture", label: "Fatture" },
  { href: "/impostazioni", label: "Impostazioni" },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemIsActive(pathname: string, item: NavItem) {
  if (item.children?.some((child) => pathMatches(pathname, child.href))) {
    return true;
  }
  return pathMatches(pathname, item.href);
}

function tabClass(active: boolean) {
  return `whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? "text-emerald-900" : "text-stone-700 hover:text-stone-900"
  }`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) {
      return;
    }

    function update() {
      const node = tabsRef.current;
      if (!node) {
        return;
      }
      const active = node.querySelector("[data-nav-active='true']");
      if (!(active instanceof HTMLElement)) {
        setIndicator({ left: 0, width: 0, ready: true });
        return;
      }
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      });
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="min-h-full">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="pb-4">
            <Link href="/dashboard" className="text-lg font-semibold text-stone-900">
              Studio
            </Link>
            <p className="text-sm text-stone-500">Promemoria e cartelle clienti</p>
          </div>
          <div className="flex items-end gap-1">
            <nav aria-label="Principale" className="-mb-px min-w-0">
              <div ref={tabsRef} className="relative flex items-end">
                {NAV.map((item) =>
                  item.children ? (
                    <NavItemWithMenu
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      active={itemIsActive(pathname, item)}
                    />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-nav-active={itemIsActive(pathname, item)}
                      className={tabClass(itemIsActive(pathname, item))}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-0 h-0.5 bg-emerald-900 ${
                    indicator.ready ? "transition-[left,width] duration-200 ease-out" : ""
                  }`}
                  style={{
                    left: indicator.left,
                    width: indicator.width,
                    opacity: indicator.width > 0 ? 1 : 0,
                  }}
                />
              </div>
            </nav>
            <div className="pb-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function NavItemWithMenu({
  item,
  pathname,
  active,
}: {
  item: NavItem;
  pathname: string;
  active: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      data-nav-active={active}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center">
        <Link href={item.href} className={`${tabClass(active)} pr-1`}>
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`Apri sottomenu ${item.label}`}
          className={`-ml-0.5 py-2.5 pr-2 text-sm ${
            active ? "text-emerald-900" : "text-stone-700 hover:text-stone-900"
          }`}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M5.5 7.5 10 12l4.5-4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="absolute left-0 top-full z-20 pt-1">
          <div
            role="menu"
            aria-label={item.label}
            className="min-w-[11rem] rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
          >
            {children.map((child) => {
              const childActive = pathMatches(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  className={`block px-3 py-2 text-sm ${
                    childActive
                      ? "font-medium text-emerald-900"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
