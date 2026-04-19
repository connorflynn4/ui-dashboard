"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatDuration, formatPercent } from "@/lib/format";
import type { ReportResponse } from "@/types/report";

type StatusHistoryChartProps = {
  segments: ReportResponse["statusTimeline"];
};

const statusConfig = {
  running: { label: "Net run time", color: "#89a7ea" },
  downtime: { label: "Maintenance", color: "#e39cb8" },
  stopped: { label: "Stopped", color: "#f0d390" },
} as const;

export function StatusHistoryChart({ segments }: StatusHistoryChartProps) {
  const totalDuration = Math.max(1, segments.reduce((sum, segment) => sum + segment.durationMinutes, 0));
  const data = (["running", "downtime", "stopped"] as const).map((status) => {
    const minutes = segments
      .filter((segment) => segment.status === status)
      .reduce((sum, segment) => sum + segment.durationMinutes, 0);

    return {
      status,
      label: statusConfig[status].label,
      color: statusConfig[status].color,
      minutes,
      share: minutes / totalDuration,
    };
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:items-center">
      <div className="relative h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="label"
              innerRadius={72}
              outerRadius={102}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-slate-500">Status mix</p>
          <p className="mt-2 font-metric text-4xl text-slate-900">{formatPercent(data[0].share)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((entry) => (
          <div
            key={entry.status}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#dce4fb] px-4 py-3"
            style={{ backgroundColor: `${entry.color}22` }}
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                <p className="text-xs text-slate-500">{formatPercent(entry.share)} of selected range</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-800">{formatDuration(entry.minutes)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
