"use client";

import {
  Blocks,
  HelpCircle,
  Inbox,
  LayoutGrid,
  List,
  Menu,
  SquareCheckBig,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ContentTransitionSkeleton } from "@/components/content-transition-skeleton";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

type AppShellProps = {
  children: ReactNode;
  generatedAt: string;
  facilityName: string;
  lineName: string;
};

export function AppShell({ children, generatedAt, facilityName, lineName }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();
  const isNavigating = pendingHref !== null && pendingHref !== pathname;

  function handleNavClick(href: string) {
    setIsMobileMenuOpen(false);

    if (href !== pathname) {
      setPendingHref(href);
    }
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, href: "/" },
    { label: "Department", icon: Blocks, href: "/supervisor-view" },
    { label: "Production", icon: List, href: "/live-line" },
    { label: "Task", icon: SquareCheckBig, href: "/batch-log" },
    { label: "Inbox", icon: Inbox, href: "/downtime" },
    { label: "Control", icon: SlidersHorizontal, href: "/facility-map" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-ink)]">
      <div className="h-screen lg:flex">
        <div className="h-screen overflow-hidden border border-[#e9edf3] bg-white lg:flex lg:w-full">
          {isMobileMenuOpen ? (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/45 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ) : null}

          <aside
            className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[250px] shrink-0 flex-col border-r border-[#e8ecf2] bg-[#ffffff] text-slate-900 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="border-b border-[#eef1f5] px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src="/iotlogo.png"
                    alt="ioTORQ LEAN logo"
                    width={150}
                    height={42}
                    className="h-auto w-[150px] object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 lg:hidden"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <nav className="min-h-0 flex-1 px-4 py-5">
              <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Main
              </p>
              <ul className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.label} className="relative">
                      {isActive ? (
                        <span className="absolute left-[-16px] top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#4f6ff3]" />
                      ) : null}
                      <Link
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors duration-200 ${
                          isActive
                            ? "bg-[#edf5ff] text-[#111827]"
                            : "text-[#5e6778] hover:bg-[#f8fafc] hover:text-[#111827]"
                        }`}
                      >
                        <Icon className={`h-[19px] w-[19px] ${isActive ? "text-[#4f6ff3]" : "text-[#697385]"}`} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-[#eef1f5] px-4 py-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/settings"
                    onClick={() => handleNavClick("/settings")}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-[#5e6778] transition-colors duration-200 hover:bg-[#f8fafc] hover:text-[#111827]"
                  >
                    <Settings className="h-[19px] w-[19px] text-[#697385]" />
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    onClick={() => handleNavClick("/help")}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-[#5e6778] transition-colors duration-200 hover:bg-[#f8fafc] hover:text-[#111827]"
                  >
                    <HelpCircle className="h-[19px] w-[19px] text-[#697385]" />
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 xl:px-7">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">ioTORQ LEAN</p>
                    <div className="mt-0.5 flex min-w-0 flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-3">
                      <p className="truncate text-[16px] font-semibold text-slate-900 md:text-[18px]">{lineName}</p>
                      <p className="truncate text-[13px] text-slate-500">{facilityName}</p>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 lg:self-auto">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="text-left">
                    <p className="text-[12px] font-medium leading-none text-slate-700">Live report</p>
                  </div>
                  <span className="text-[12px] text-slate-500">
                    {new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit" }).format(new Date(generatedAt))}
                  </span>
                </div>
              </div>
            </header>

            <main className="relative min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 pb-4 pt-6 md:px-6 md:pb-5 md:pt-7 xl:px-7 xl:pb-6 xl:pt-8">
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-1 overflow-hidden transition-opacity duration-200 ${
                  isNavigating ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="h-full w-1/3 animate-[route-loader_1.1s_ease-in-out_infinite] rounded-full bg-[#4f6ff3]" />
              </div>
              <div
                className={`pointer-events-none absolute inset-0 z-10 bg-[#f8fafc]/80 backdrop-blur-[2px] transition-opacity duration-200 ${
                  isNavigating ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className={`pointer-events-none absolute inset-0 z-20 overflow-hidden px-4 py-4 transition-opacity duration-200 md:px-6 md:py-5 xl:px-7 xl:py-6 ${
                  isNavigating ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="mx-auto w-full max-w-[1180px] pt-2 md:pt-2 xl:pt-2">
                  <ContentTransitionSkeleton />
                </div>
              </div>
              <div className="mx-auto w-full max-w-[1180px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
