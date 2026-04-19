"use client";

import { AlertTriangle, CalendarClock, CircleDot, PauseCircle } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { formatAdaptiveTick, formatDateTimeLabel, formatDuration } from "@/lib/format";
import { getStatusDisplayLabel } from "@/lib/report-data";
import type { ReportPageContent } from "@/types/content";
import type { DowntimeKind, LineStatus, ReportResponse, StatusSegment } from "@/types/report";

type StatusTimelineProps = {
  segments: ReportResponse["statusTimeline"];
  rangeStart: string;
  rangeEnd: string;
  labels: ReportPageContent["statusTimeline"]["labels"];
};

type VisualKey = "running" | "unplanned" | "planned" | "stopped";

const visuals: Record<
  VisualKey,
  {
    label: string;
    color: string;
    barClass: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    patternId: string;
  }
> = {
  running: {
    label: "Running",
    color: "#10b981",
    barClass: "bg-emerald-500",
    icon: CircleDot,
    patternId: "pattern-running",
  },
  unplanned: {
    label: "Unplanned downtime",
    color: "#f59e0b",
    barClass: "bg-amber-500",
    icon: AlertTriangle,
    patternId: "pattern-unplanned",
  },
  planned: {
    label: "Planned downtime",
    color: "#8b5cf6",
    barClass: "bg-violet-500",
    icon: CalendarClock,
    patternId: "pattern-planned",
  },
  stopped: {
    label: "Stopped (scheduled off)",
    color: "#94a3b8",
    barClass: "bg-slate-400",
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

export function StatusTimeline({ segments, rangeStart, rangeEnd, labels }: StatusTimelineProps) {
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
          const tooltip = buildTooltip(segment, labels[key]);

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
          const pct = Math.round((minutes / legendDenominator) * 100);

          return (
            <div
              key={key}
              className="rounded-[18px] border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
              title={`${visual.label}: ${formatDuration(minutes)} across ${pct}% of the selected range.`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: visual.color }}
                      aria-hidden="true"
                    />
                    <p className="truncate text-[12px] font-medium text-slate-600">{labels[key]}</p>
                  </div>
                  <p className="mt-3 font-metric text-[28px] leading-none text-slate-950">
                    {formatDuration(minutes)}
                  </p>
                </div>
                <p className="pt-0.5 text-sm font-medium text-slate-400">{pct}%</p>
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
