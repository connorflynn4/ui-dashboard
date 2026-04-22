"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, RefreshCcw } from "lucide-react";

import { toDateInputValue } from "@/lib/format";
import type { ReportPageContent, ReportPresetKey } from "@/types/content";

type ReportFilterBarProps = {
  start: string;
  end: string;
  content: ReportPageContent["filterBar"];
};

function shiftDays(days: number) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  return { start, end };
}

function presetRange(key: ReportPresetKey) {
  if (key === "24h") {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return { start, end };
  }

  if (key === "30d") {
    return shiftDays(30);
  }

  return shiftDays(7);
}

export function ReportFilterBar({ start, end, content }: ReportFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState(toDateInputValue(start));
  const [endDate, setEndDate] = useState(toDateInputValue(end));

  const activePreset = useMemo(() => {
    const rangeHours = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60));

    if (rangeHours >= 23 && rangeHours <= 25) {
      return "24h";
    }

    if (rangeHours >= 166 && rangeHours <= 170) {
      return "7d";
    }

    if (rangeHours >= 718 && rangeHours <= 722) {
      return "30d";
    }

    return null;
  }, [end, start]);

  function navigate(nextStart: Date, nextEnd: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", nextStart.toISOString());
    params.set("end", nextEnd.toISOString());

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function applyPreset(key: ReportPresetKey) {
    const range = presetRange(key);
    setStartDate(toDateInputValue(range.start.toISOString()));
    setEndDate(toDateInputValue(range.end.toISOString()));
    navigate(range.start, range.end);
  }

  function handleSubmit(formData: FormData) {
    const nextStart = formData.get("startDate");
    const nextEnd = formData.get("endDate");

    if (typeof nextStart !== "string" || typeof nextEnd !== "string") {
      return;
    }

    const startAt = new Date(`${nextStart}T00:00:00.000Z`);
    const endAt = new Date(`${nextEnd}T23:59:59.999Z`);
    navigate(startAt, endAt);
  }

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm md:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <CalendarRange className="h-3.5 w-3.5" />
            {content.badgeLabel}
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {content.helperText}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.entries(content.presets) as Array<[ReportPresetKey, string]>).map(([preset, label]) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                activePreset === preset
                  ? "bg-[#89a7ea] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <form
        action={handleSubmit}
        className="mt-4 grid gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto] md:p-3"
      >
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{content.startLabel}</span>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#89a7ea] focus:ring-4 focus:ring-[#dfe7ff]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{content.endLabel}</span>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#89a7ea] focus:ring-4 focus:ring-[#dfe7ff]"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#89a7ea] px-5 text-sm font-medium text-white transition hover:bg-[#7898de] disabled:cursor-wait disabled:opacity-70"
        >
          <RefreshCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? content.pendingLabel : content.submitLabel}
        </button>
      </form>
    </div>
  );
}
