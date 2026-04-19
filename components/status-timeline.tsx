"use client";

import { AlertTriangle, CalendarClock, CircleDot, PauseCircle } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { formatAdaptiveTick, formatDateTimeLabel, formatDuration } from "@/lib/format";
import { getStatusDisplayLabel } from "@/lib/report-data";
import type { DowntimeKind, LineStatus, ReportResponse, StatusSegment } from "@/types/report";

type StatusTimelineProps = {
  segments: ReportResponse["statusTimeline"];
  rangeStart: string;
  rangeEnd: string;
};

type VisualKey = "running" | "unplanned" | "planned" | "stopped";

const visuals: Record<
  VisualKey,
  {
    label: string;
    color: string;
    barClass: string;
    softClass: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    patternId: string;
  }
> = {
  running: {
    label: "Running",
    color: "#10b981",
    barClass: "bg-emerald-500",
    softClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CircleDot,
    patternId: "pattern-running",
  },
  unplanned: {
    label: "Unplanned downtime",
    color: "#f59e0b",
    barClass: "bg-amber-500",
    softClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
    patternId: "pattern-unplanned",
  },
  planned: {
    label: "Planned downtime",
    color: "#8b5cf6",
    barClass: "bg-violet-500",
    softClass: "bg-violet-50 text-violet-700 border-violet-200",
    icon: CalendarClock,
    patternId: "pattern-planned",
  },
  stopped: {
    label: "Stopped (scheduled off)",
    color: "#94a3b8",
    barClass: "bg-slate-400",
    softClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: PauseCircle,
    patternId: "pattern-stopped",
  },
};

function visualKeyFor(segment: { status: LineStatus; downtimeKind?: DowntimeKind }): VisualKey {
  if (segment.status === "running") return "running";
  if (segment.status === "stopped") return "stopped";
  return segment.downtimeKind === "planned" ? "planned" : "unplanned";
}

function sumBy(segments: StatusSegment[], predicate: (segment: StatusSegment) => boolean) {
  return segments.filter(predicate).reduce((sum, segment) => sum + segment.durationMinutes, 0);
}

export function StatusTimeline({ segments, rangeStart, rangeEnd }: StatusTimelineProps) {
  const rangeStartMs = new Date(rangeStart).getTime();
  const rangeEndMs = new Date(rangeEnd).getTime();
  const totalMs = Math.max(rangeEndMs - rangeStartMs, 1);

  const legendTotals: Array<{ key: VisualKey; minutes: number }> = [
    { key: "running", minutes: sumBy(segments, (segment) => segment.status === "running") },
    {
      key: "unplanned",
      minutes: sumBy(
        segments,
        (segment) => segment.status === "downtime" && segment.downtimeKind !== "planned",
      ),
    },
    {
      key: "planned",
      minutes: sumBy(
        segments,
        (segment) => segment.status === "downtime" && segment.downtimeKind === "planned",
      ),
    },
    { key: "stopped", minutes: sumBy(segments, (segment) => segment.status === "stopped") },
  ];
  const legendDenominator = Math.max(
    legendTotals.reduce((sum, item) => sum + item.minutes, 0),
    1,
  );

  const axisTicks = buildAxisTicks(rangeStartMs, rangeEndMs);

  return (
    <div>
      <div className="relative h-9 rounded-[14px] bg-[#eef2ff]">
        {segments.map((segment) => {
          const segmentStartMs = new Date(segment.start).getTime();
          const segmentEndMs = new Date(segment.end).getTime();
          const leftPercent = ((segmentStartMs - rangeStartMs) / totalMs) * 100;
          const widthPercent = Math.max(
            ((segmentEndMs - segmentStartMs) / totalMs) * 100,
            0.15,
          );
          const key = visualKeyFor(segment);
          const visual = visuals[key];
          const tooltip = buildTooltip(segment, visual.label);

          return (
            <div
              key={`${segment.start}-${segment.end}`}
              className={`${visual.barClass} absolute top-0 h-full first:rounded-l-[14px] last:rounded-r-[14px]`}
              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              title={tooltip}
              aria-label={tooltip}
              role="img"
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        {axisTicks.map((tick) => (
          <span key={tick.iso}>{tick.label}</span>
        ))}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {legendTotals.map(({ key, minutes }) => {
          const visual = visuals[key];
          const Icon = visual.icon;
          const pct = Math.round((minutes / legendDenominator) * 100);

          return (
            <div
              key={key}
              className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${visual.softClass}`}
            >
              <Icon className="mt-0.5 h-4 w-4" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">{visual.label}</p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="font-metric text-2xl text-slate-950">{formatDuration(minutes)}</span>
                  <span className="text-xs text-slate-600">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="sr-only">
        {segments
          .map((segment) => `${getStatusDisplayLabel(segment.status)} ${formatDateTimeLabel(segment.start)} for ${formatDuration(segment.durationMinutes)}`)
          .join(". ")}
      </p>
    </div>
  );
}

function buildTooltip(segment: StatusSegment, label: string) {
  const parts = [
    label,
    `${formatDateTimeLabel(segment.start)} → ${formatDateTimeLabel(segment.end)}`,
    formatDuration(segment.durationMinutes),
  ];

  if (segment.reasonLabel) {
    parts.push(`Cause: ${segment.reasonLabel}`);
  }

  return parts.join("\n");
}

function buildAxisTicks(startMs: number, endMs: number) {
  const tickCount = 5;
  const durationMs = Math.max(1, endMs - startMs);
  const ticks: Array<{ iso: string; label: string }> = [];

  for (let index = 0; index < tickCount; index += 1) {
    const t = startMs + (durationMs * index) / (tickCount - 1);
    const iso = new Date(t).toISOString();
    ticks.push({ iso, label: formatAdaptiveTick(iso, durationMs) });
  }

  return ticks;
}
