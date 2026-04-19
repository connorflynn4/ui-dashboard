"use client";

import { AlertTriangle, CalendarClock, CircleDot, PauseCircle } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

import { formatDuration, formatPercent } from "@/lib/format";
import type { ReportPageContent } from "@/types/content";
import type { ReportResponse } from "@/types/report";

type StatusHistoryChartProps = {
  segments: ReportResponse["statusTimeline"];
  content: ReportPageContent["statusMix"];
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

export function StatusHistoryChart({ segments, content }: StatusHistoryChartProps) {
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

  const data = (Object.keys(sliceConfig) as SliceKey[]).map((key) => ({
    key,
    label: content.labels[key],
    color: sliceConfig[key].color,
    icon: sliceConfig[key].icon,
    minutes: minutesByKey[key],
    share: minutesByKey[key] / totalDuration,
  }));

  const chartData = data.filter((entry) => entry.minutes > 0);

  const runningShare = minutesByKey.running / totalDuration;

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-[280px]">
        <div className="relative h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip
                formatter={(value, _name, item) => {
                  const payload = item.payload as (typeof data)[number];
                  return [formatDuration(Number(value ?? 0)), payload.label];
                }}
                labelFormatter={(_label, payload) => {
                  const item = payload?.[0]?.payload as (typeof data)[number] | undefined;

                  return item ? `${formatPercent(item.share)} of selected range` : "";
                }}
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid #dfe7ff",
                  boxShadow: "0 18px 45px rgba(133, 155, 214, 0.18)",
                  backgroundColor: "#ffffff",
                }}
                labelStyle={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}
                itemStyle={{ fontSize: 12, color: "#0f172a" }}
                wrapperStyle={{ outline: "none", zIndex: 20 }}
              />
              <Pie
                data={chartData}
                dataKey="minutes"
                nameKey="label"
                innerRadius={72}
                outerRadius={104}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={3}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{content.centerLabel}</p>
            <p className="mt-1 font-metric text-4xl text-slate-900">{formatPercent(runningShare)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDuration(minutesByKey.running)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((entry) => {
          return (
            <div
              key={entry.key}
              className="rounded-[18px] border border-slate-200 bg-white px-4 py-3.5"
              title={`${entry.label}: ${formatDuration(entry.minutes)} across ${formatPercent(entry.share)} of the selected range.`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <p className="truncate text-[13px] font-medium text-slate-600">{entry.label}</p>
                </div>
                <p className="shrink-0 text-[12px] font-medium text-slate-400">{formatPercent(entry.share)}</p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="font-metric text-[32px] leading-none text-slate-950">{formatDuration(entry.minutes)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{content.rangeHint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
