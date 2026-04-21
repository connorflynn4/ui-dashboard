"use client";

import {
  Blocks,
  ChevronDown,
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
import { formatHeaderTime } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import type { IconKey, ShellContent } from "@/types/content";

type AppShellProps = {
  children: ReactNode;
  generatedAt: string;
  facilityName: string;
  lineName: string;
  shellContent: ShellContent;
};

const iconMap: Record<IconKey, typeof LayoutGrid> = {
  layoutGrid: LayoutGrid,
  blocks: Blocks,
  list: List,
  squareCheckBig: SquareCheckBig,
  inbox: Inbox,
  slidersHorizontal: SlidersHorizontal,
  settings: Settings,
  helpCircle: HelpCircle,
};

function getUserInitials(displayName: string, fallbackInitials: string) {
  if (fallbackInitials.trim().length > 0) {
    return fallbackInitials.trim().slice(0, 2).toUpperCase();
  }

  const initials = displayName
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

export function AppShell({ children, generatedAt, facilityName, lineName, shellContent }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();
  const isNavigating = pendingHref !== null && pendingHref !== pathname;
  const userInitials = getUserInitials(shellContent.currentUser.displayName, shellContent.currentUser.initials);

  function handleNavClick(href: string) {
    setIsMobileMenuOpen(false);

    if (href !== pathname) {
      setPendingHref(href);
    }
  }

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
                    alt={shellContent.brand.logoAlt}
                    width={150}
                    height={65}
                    style={{ height: "auto" }}
                    className="object-contain"
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
                {shellContent.navigation.mainSectionLabel}
              </p>
              <ul className="space-y-1.5">
                {shellContent.navigation.mainItems.map((item) => {
                  const Icon = iconMap[item.iconKey];
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
                {shellContent.navigation.footerItems.map((item) => {
                  const Icon = iconMap[item.iconKey];

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-[#5e6778] transition-colors duration-200 hover:bg-[#f8fafc] hover:text-[#111827]"
                      >
                        <Icon className="h-[19px] w-[19px] text-[#697385]" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 xl:px-7">
              <div className="lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <p className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      {shellContent.brand.headerEyebrow}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[12px] font-medium leading-none text-slate-700">
                        {shellContent.brand.liveBadgeLabel}
                      </span>
                      <span className="text-[12px] text-slate-500">
                        {formatHeaderTime(generatedAt)}
                      </span>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.45)]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd956] text-[11px] font-semibold text-slate-900 shadow-[inset_0_-5px_10px_rgba(245,158,11,0.14)]">
                        {userInitials}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="truncate text-[16px] font-semibold text-slate-900 sm:text-[17px]">{lineName}</p>
                  <p className="mt-0.5 truncate text-[13px] text-slate-500 sm:text-[14px]">{facilityName}</p>
                </div>
              </div>

              <div className="hidden lg:flex lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{shellContent.brand.headerEyebrow}</p>
                    <div className="mt-1 flex min-w-0 flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-3">
                      <p className="truncate text-[16px] font-semibold text-slate-900 sm:text-[17px] md:text-[18px]">{lineName}</p>
                      <p className="truncate text-[13px] text-slate-500 sm:text-[14px]">{facilityName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 lg:self-auto">
                  <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-medium leading-none text-slate-700 sm:text-[13px]">
                      {shellContent.brand.liveBadgeLabel}
                    </span>
                    <span className="text-[12px] text-slate-500 sm:text-[13px]">
                      {formatHeaderTime(generatedAt)}
                    </span>
                  </div>

                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.45)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd956] text-[11px] font-semibold text-slate-900 shadow-[inset_0_-5px_10px_rgba(245,158,11,0.14)]">
                      {userInitials}
                    </div>
                    <div className="flex items-center gap-0.5 pl-2 pr-2">
                      <span className="text-[13px] font-medium tracking-[-0.01em] text-slate-900">
                        {shellContent.currentUser.displayName}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
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
