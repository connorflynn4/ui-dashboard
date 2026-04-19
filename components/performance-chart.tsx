"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatAdaptiveTick, formatDateTimeLabel, formatPercent } from "@/lib/format";
import type { ReportResponse } from "@/types/report";

type PerformanceChartProps = {
  data: ReportResponse["performanceSeries"];
  targetPerformance: number;
  rangeStart: string;
  rangeEnd: string;
};

export function PerformanceChart({
  data,
  targetPerformance,
  rangeStart,
  rangeEnd,
}: PerformanceChartProps) {
  const rangeDurationMs = Math.max(
    1,
    new Date(rangeEnd).getTime() - new Date(rangeStart).getTime(),
  );

  // Plot actual performance only where the line produced something. connectNulls
  // bridges across scheduled stops so the trend reads continuously rather than
  // plummeting to 0% between shifts.
  const chartData = data.map((point) => ({
    ...point,
    target: targetPerformance,
    performanceLine: point.performance > 0 ? point.performance : null,
  }));

  const firstActualIndex = chartData.findIndex((point) => point.performanceLine !== null);
  const lastActualIndex = [...chartData]
    .reverse()
    .findIndex((point) => point.performanceLine !== null);

  if (firstActualIndex !== -1) {
    const firstActualValue = chartData[firstActualIndex]?.performanceLine ?? null;
    const resolvedLastActualIndex = chartData.length - 1 - lastActualIndex;
    const lastActualValue = chartData[resolvedLastActualIndex]?.performanceLine ?? null;

    for (let index = 0; index < firstActualIndex; index += 1) {
      chartData[index] = {
        ...chartData[index],
        performanceLine: firstActualValue,
      };
    }

    for (let index = resolvedLastActualIndex + 1; index < chartData.length; index += 1) {
      chartData[index] = {
        ...chartData[index],
        performanceLine: lastActualValue,
      };
    }
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 8 }}>
          <CartesianGrid stroke="#dfe7ff" strokeDasharray="4 5" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatAdaptiveTick(String(value), rangeDurationMs)}
            tick={{ fill: "#7a869f", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
            padding={{ left: 12, right: 20 }}
          />
          <YAxis
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            tick={{ fill: "#7a869f", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
            domain={[0, 1]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: "1px solid #dfe7ff",
              boxShadow: "0 18px 45px rgba(133, 155, 214, 0.18)",
            }}
            labelFormatter={(value) => formatDateTimeLabel(String(value))}
            formatter={(value, name) => {
              if (value === null || value === undefined) {
                return ["—", name === "target" ? "Target" : "Actual"];
              }

              const numericValue = typeof value === "number" ? value : Number(value ?? 0);

              if (name === "target") {
                return [formatPercent(numericValue), "Target"];
              }

              return [formatPercent(numericValue), "Actual"];
            }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#d78990"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="performanceLine"
            name="performance"
            stroke="#89a7ea"
            strokeWidth={3}
            connectNulls
            dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 5, fill: "#89a7ea" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
