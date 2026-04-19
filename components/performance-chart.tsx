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

import { formatDateLabel, formatPercent } from "@/lib/format";
import type { ReportResponse } from "@/types/report";

type PerformanceChartProps = {
  data: ReportResponse["performanceSeries"];
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    target: 0.85,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 8 }}>
          <CartesianGrid stroke="#dfe7ff" strokeDasharray="4 5" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDateLabel}
            tick={{ fill: "#7a869f", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={32}
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
            labelFormatter={(value) => formatDateLabel(String(value))}
            formatter={(value, name) => {
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
            dataKey="performance"
            stroke="#89a7ea"
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 5, fill: "#89a7ea" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
