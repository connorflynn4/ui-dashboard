import {
  AlertTriangle,
  CalendarClock,
  CircleDot,
  PauseCircle,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { connection } from "next/server";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PerformanceChart } from "@/components/performance-chart";
import { ReportFilterBar } from "@/components/report-filter-bar";
import { StatusHistoryChart } from "@/components/status-history-chart";
import { StatusTimeline } from "@/components/status-timeline";
import { getReportPageContent, getShellContent } from "@/lib/content";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { fetchReport } from "@/lib/report-api";
import { resolvePageRange } from "@/lib/report-data";
import {
  createMetricCardViewModels,
  createPerformancePillViewModels,
  createStatusTimelinePillViewModels,
} from "@/lib/report-view";
import type { LineStatus } from "@/types/report";

const statusAccent: Record<LineStatus, { bar: string; dot: string; icon: typeof CircleDot }> = {
  running: { bar: "bg-emerald-500", dot: "bg-emerald-500", icon: CircleDot },
  downtime: { bar: "bg-amber-500", dot: "bg-amber-500", icon: AlertTriangle },
  stopped: { bar: "bg-slate-400", dot: "bg-slate-400", icon: PauseCircle },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();

  const params = await searchParams;
  const range = resolvePageRange(params);
  const shellContent = getShellContent();
  const reportPageContent = getReportPageContent();

  const fallbackStart = range.ok ? range.rawStart : new Date().toISOString();
  const fallbackEnd = range.ok ? range.rawEnd : new Date().toISOString();

  if (!range.ok) {
    return (
      <AppShell
        generatedAt={new Date().toISOString()}
        facilityName={shellContent.brand.defaultFacilityName}
        lineName={shellContent.brand.defaultLineName}
        shellContent={shellContent}
      >
        <div className="space-y-5">
          <ReportFilterBar start={fallbackStart} end={fallbackEnd} content={reportPageContent.filterBar} />

          <section className="rounded-[32px] border border-rose-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              {reportPageContent.invalidRange.badgeLabel}
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">{reportPageContent.invalidRange.title}</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">{range.message}</p>
          </section>
        </div>
      </AppShell>
    );
  }

  const report = await fetchReport(range.start.toISOString(), range.end.toISOString());
  const isEmpty = report.summary.totalProduced === 0 && report.summary.totalDowntimeMinutes === 0;
  const currentStatusSegment = report.statusTimeline.at(-1);
  const currentStatus: LineStatus = currentStatusSegment?.status ?? "stopped";
  const currentStatusLabel =
    currentStatus === "running"
      ? "Running"
      : currentStatus === "downtime"
        ? currentStatusSegment?.downtimeKind === "planned"
          ? "Planned downtime"
          : "Unplanned downtime"
        : "Stopped";
  const currentStatusDetail =
    currentStatus === "running"
      ? "The line is currently producing products."
      : currentStatus === "downtime"
        ? currentStatusSegment?.downtimeKind === "planned"
          ? "The line is currently in a planned downtime window."
          : "The line is currently in unplanned downtime."
        : "The line is currently stopped (scheduled off).";
  const StatusIcon = statusAccent[currentStatus].icon;
  const metricCards = createMetricCardViewModels(report, reportPageContent.metrics);
  const performancePills = createPerformancePillViewModels(report, reportPageContent);
  const statusTimelinePills = createStatusTimelinePillViewModels(report, reportPageContent);

  return (
    <AppShell
      generatedAt={report.range.generatedAt}
      facilityName={report.line.facilityName}
      lineName={report.line.name}
      shellContent={shellContent}
    >
      <div className="space-y-5">
        <ReportFilterBar start={report.range.start} end={report.range.end} content={reportPageContent.filterBar} />

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{reportPageContent.header.eyebrow}</p>
              <h2 className="mt-2 text-[30px] font-semibold tracking-tight text-slate-950">
                {report.line.name}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                {formatDateLabel(report.range.start)} to {formatDateLabel(report.range.end)} • {reportPageContent.header.generatedLabel} {formatDateTimeLabel(report.range.generatedAt)} • {report.line.productName} • {report.range.timezone}
              </p>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
              <div className={`h-1.5 w-full ${statusAccent[currentStatus].bar}`} />
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{reportPageContent.currentStatus.eyebrow}</p>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${currentStatus === "running" ? "text-emerald-600" : currentStatus === "downtime" ? "text-amber-600" : "text-slate-500"}`} aria-hidden="true" />
                      <p className="text-2xl font-semibold text-slate-950">{currentStatusLabel}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{currentStatusDetail}</p>
                  </div>

                  <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                      title={reportPageContent.tooltips.currentBlock}
                    >
                      <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400">{reportPageContent.currentStatus.currentBlockLabel}</span>
                      <span className="mt-1 block text-sm font-medium text-slate-900">
                        {formatDuration(currentStatusSegment?.durationMinutes ?? 0)}
                      </span>
                    </div>
                    {currentStatusSegment?.reasonLabel ? (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                        title={`${reportPageContent.tooltips.currentCause} Current cause: ${currentStatusSegment.reasonLabel}.`}
                      >
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400">{reportPageContent.currentStatus.causeLabel}</span>
                        <span className="mt-1 block text-sm font-medium text-slate-900">
                          {currentStatusSegment.reasonLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{reportPageContent.performance.eyebrow}</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-slate-950">{reportPageContent.performance.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {reportPageContent.metrics.averagePerformance.hintPrefix} {formatPercent(report.line.targetPerformance)} • {reportPageContent.performance.helperTextSuffix}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {performancePills.map((pill) => (
                    <span
                      key={pill.key}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5"
                      title={pill.tooltip}
                    >
                      {pill.label} {pill.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
                {metricCards.map((metric) => (
                  <MetricCard
                    key={metric.key}
                    label={metric.label}
                    value={metric.value}
                    hint={metric.hint}
                    tooltip={metric.tooltip}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-[18px] border border-slate-200 bg-white p-4">
                <PerformanceChart
                  data={report.performanceSeries}
                  targetPerformance={report.line.targetPerformance}
                  rangeStart={report.range.start}
                  rangeEnd={report.range.end}
                />
              </div>
            </article>
          </div>

          {isEmpty ? (
            <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <TriangleAlert className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">{reportPageContent.emptyState.title}</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                {reportPageContent.emptyState.description}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{reportPageContent.statusTimeline.eyebrow}</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-950">{reportPageContent.statusTimeline.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{reportPageContent.statusTimeline.helperText}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {statusTimelinePills.map((pill) => (
                        <span key={pill.key} className={pill.className} title={pill.tooltip}>
                          {pill.value} {pill.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <StatusTimeline
                      segments={report.statusTimeline}
                      rangeStart={report.range.start}
                      rangeEnd={report.range.end}
                      labels={reportPageContent.statusTimeline.labels}
                    />
                  </div>
                </article>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{reportPageContent.downtime.eyebrow}</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-950">{reportPageContent.downtime.title}</h3>
                    </div>
                    <div
                      className="flex items-center gap-2 rounded-full bg-[#fff4df] px-3 py-1.5 text-xs text-[#b0781c]"
                      title={reportPageContent.tooltips.rankedByImpact}
                    >
                      <Wrench className="h-4 w-4" />
                      {reportPageContent.downtime.rankedByImpactLabel}
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {report.downtimePareto.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                        {reportPageContent.downtime.noEventsText}
                      </div>
                    ) : (
                      report.downtimePareto.map((event, index) => {
                        const sampleEvent = report.downtimeEvents.find((item) => item.cause === event.cause);
                        const isPlanned = event.kind === "planned";
                        const KindIcon = isPlanned ? CalendarClock : AlertTriangle;

                        return (
                          <div
                            key={event.cause}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                            title={`${event.cause}: ${event.eventCount} ${event.eventCount === 1 ? "event" : "events"}, ${formatDuration(event.totalMinutes)} total, ${formatPercent(event.impactShare)} of downtime impact.`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">#{index + 1} {reportPageContent.downtime.causeEyebrowSuffix}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <h4 className="text-base font-semibold text-slate-950">{event.cause}</h4>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                                      isPlanned
                                        ? "border-violet-200 bg-violet-50 text-violet-700"
                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    <KindIcon className="h-3 w-3" aria-hidden="true" />
                                    {isPlanned ? reportPageContent.downtime.kindLabels.planned : reportPageContent.downtime.kindLabels.unplanned}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-500">
                                  {event.eventCount} {event.eventCount === 1 ? reportPageContent.downtime.eventLabelSingular : reportPageContent.downtime.eventLabelPlural} • {formatDuration(event.totalMinutes)}
                                </p>
                                {sampleEvent ? (
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{sampleEvent.category}</span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{sampleEvent.source.toUpperCase()}</span>
                                    {sampleEvent.faultCode ? (
                                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{sampleEvent.faultCode}</span>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <div className="font-metric text-3xl text-slate-950">{formatPercent(event.impactShare)}</div>
                            </div>

                            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full ${isPlanned ? "bg-violet-400" : "bg-amber-400"}`}
                                style={{ width: `${Math.max(event.impactShare * 100, 6)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>

                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{reportPageContent.statusMix.eyebrow}</p>
                    <h3 className="mt-1.5 text-lg font-semibold text-slate-950">{reportPageContent.statusMix.title}</h3>
                  </div>
                  <div className="mt-5">
                    <StatusHistoryChart segments={report.statusTimeline} content={reportPageContent.statusMix} />
                  </div>
                </article>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
