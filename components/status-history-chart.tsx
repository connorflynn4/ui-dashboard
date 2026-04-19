"use client";

import { AlertTriangle, CalendarClock, CircleDot, PauseCircle } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatDuration, formatPercent } from "@/lib/format";
import type { ReportResponse } from "@/types/report";

type StatusHistoryChartProps = {
  segments: ReportResponse["statusTimeline"];
};

type SliceKey = "running" | "unplanned" | "planned" | "stopped";

const sliceConfig: Record<
  SliceKey,
  {
    label: string;
    color: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  running: { label: "Running", color: "#10b981", icon: CircleDot },
  unplanned: { label: "Unplanned downtime", color: "#f59e0b", icon: AlertTriangle },
  planned: { label: "Planned downtime", color: "#8b5cf6", icon: CalendarClock },
  stopped: { label: "Stopped", color: "#94a3b8", icon: PauseCircle },
};

export function StatusHistoryChart({ segments }: StatusHistoryChartProps) {
  const totalDuration = Math.max(1, segments.reduce((sum, segment) => sum + segment.durationMinutes, 0));

  const minutesByKey: Record<SliceKey, number> = {
    running: 0,
    unplanned: 0,
    planned: 0,
    stopped: 0,
  };

  for (const segment of segments) {
    if (segment.status === "running") {
      minutesByKey.running += segment.durationMinutes;
    } else if (segment.status === "stopped") {
      minutesByKey.stopped += segment.durationMinutes;
    } else if (segment.downtimeKind === "planned") {
      minutesByKey.planned += segment.durationMinutes;
    } else {
      minutesByKey.unplanned += segment.durationMinutes;
    }
  }

  const data = (Object.keys(sliceConfig) as SliceKey[])
    .map((key) => ({
      key,
      label: sliceConfig[key].label,
      color: sliceConfig[key].color,
      icon: sliceConfig[key].icon,
      minutes: minutesByKey[key],
      share: minutesByKey[key] / totalDuration,
    }))
    .filter((entry) => entry.minutes > 0);

  const runningShare = minutesByKey.running / totalDuration;

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="label"
              innerRadius={64}
              outerRadius={92}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Running</p>
          <p className="mt-1 font-metric text-4xl text-slate-900">{formatPercent(runningShare)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((entry) => {
          const Icon = entry.icon;

          return (
            <div
              key={entry.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${entry.color}22`, color: entry.color }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">{formatPercent(entry.share)} of selected range</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-800">{formatDuration(entry.minutes)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
