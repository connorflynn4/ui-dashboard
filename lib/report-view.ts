import { formatDuration, formatNumber, formatPercent, formatSpeed } from "@/lib/format";
import type { ReportResponse } from "@/types/report";
import type { ReportPageContent } from "@/types/content";

export type MetricCardViewModel = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tooltip: string;
};

export type SummaryPillViewModel = {
  key: string;
  label: string;
  value: string;
  tooltip: string;
  className?: string;
};

export function createMetricCardViewModels(
  report: ReportResponse,
  content: ReportPageContent["metrics"],
): MetricCardViewModel[] {
  return [
    {
      key: "averageSpeed",
      label: content.averageSpeed.label,
      value: formatSpeed(report.summary.averageSpeedUpm),
      hint: `${content.averageSpeed.hintPrefix} ${report.line.targetUnitsPerMinute} upm`,
      tooltip: content.averageSpeed.tooltip,
    },
    {
      key: "totalProduced",
      label: content.totalProduced.label,
      value: formatNumber(report.summary.totalProduced),
      hint: `${formatNumber(report.summary.goodUnits)} ${content.totalProducedHint.goodLabel}${content.totalProducedHint.separator}${formatNumber(report.summary.rejectedUnits)} ${content.totalProducedHint.rejectedLabel}`,
      tooltip: content.totalProduced.tooltip,
    },
    {
      key: "averagePerformance",
      label: content.averagePerformance.label,
      value: formatPercent(report.summary.averagePerformance),
      hint: `${content.averagePerformance.hintPrefix} ${formatPercent(report.line.targetPerformance)}`,
      tooltip: content.averagePerformance.tooltip,
    },
  ];
}

export function createPerformancePillViewModels(
  report: ReportResponse,
  content: ReportPageContent,
): SummaryPillViewModel[] {
  return [
    {
      key: "availability",
      label: content.performance.pills.availability,
      value: formatPercent(report.summary.availability),
      tooltip: content.tooltips.availability,
    },
    {
      key: "quality",
      label: content.performance.pills.quality,
      value: formatPercent(report.summary.quality),
      tooltip: content.tooltips.quality,
    },
    {
      key: "oee",
      label: content.performance.pills.oee,
      value: formatPercent(report.summary.oee),
      tooltip: content.tooltips.oee,
    },
  ];
}

export function createStatusTimelinePillViewModels(
  report: ReportResponse,
  content: ReportPageContent,
): SummaryPillViewModel[] {
  return [
    {
      key: "unplanned",
      label: content.statusTimeline.pills.unplanned,
      value: formatDuration(report.summary.totalUnplannedDowntimeMinutes),
      tooltip: content.tooltips.unplannedDowntime,
      className: "rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700",
    },
    {
      key: "planned",
      label: content.statusTimeline.pills.planned,
      value: formatDuration(report.summary.totalPlannedDowntimeMinutes),
      tooltip: content.tooltips.plannedDowntime,
      className: "rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700",
    },
  ];
}
