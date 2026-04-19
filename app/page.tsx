import { AlertTriangle, TriangleAlert, Wrench } from "lucide-react";
import { connection } from "next/server";

import { AppShell } from "@/components/app-shell";
import { PerformanceChart } from "@/components/performance-chart";
import { ReportFilterBar } from "@/components/report-filter-bar";
import { StatusHistoryChart } from "@/components/status-history-chart";
import { StatusTimeline } from "@/components/status-timeline";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatDuration,
  formatNumber,
  formatPercent,
  formatSpeed,
} from "@/lib/format";
import { fetchReport } from "@/lib/report-api";
import { resolvePageRange } from "@/lib/report-data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();

  const params = await searchParams;
  const range = resolvePageRange(params);

  const fallbackStart = range.ok ? range.rawStart : new Date().toISOString();
  const fallbackEnd = range.ok ? range.rawEnd : new Date().toISOString();

  if (!range.ok) {
    return (
      <AppShell
        generatedAt={new Date().toISOString()}
        facilityName="Cascade Foods - Vancouver Plant"
        lineName="Packaging Line 1"
      >
        <div className="space-y-5">
          <ReportFilterBar start={fallbackStart} end={fallbackEnd} />

          <section className="rounded-[32px] border border-rose-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              Invalid report range
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">We could not generate that report.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">{range.message}</p>
          </section>
        </div>
      </AppShell>
    );
  }

  const report = await fetchReport(range.start.toISOString(), range.end.toISOString());
  const isEmpty = report.summary.totalProduced === 0 && report.summary.totalDowntimeMinutes === 0;
  const currentStatusSegment = report.statusTimeline.at(-1);
  const currentStatus = currentStatusSegment?.status ?? "stopped";
  const currentStatusLabel =
    currentStatus === "running" ? "Running" : currentStatus === "downtime" ? "In downtime" : "Stopped";
  const currentStatusDetail =
    currentStatus === "running"
      ? "The line is currently producing products."
      : currentStatus === "downtime"
        ? "The line is currently in unplanned downtime."
        : "The line is currently stopped.";

  return (
    <AppShell
      generatedAt={report.range.generatedAt}
      facilityName={report.line.facilityName}
      lineName={report.line.name}
    >
      <div className="space-y-5">
        <ReportFilterBar start={report.range.start} end={report.range.end} />

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Current production report</p>
              <h2 className="mt-2 text-[30px] font-semibold tracking-tight text-slate-950">
                {report.line.name}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                {formatDateLabel(report.range.start)} to {formatDateLabel(report.range.end)} • Generated {formatDateTimeLabel(report.range.generatedAt)} • {report.line.productName}
              </p>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
              <div
                className={`h-1.5 w-full ${
                  currentStatus === "running"
                    ? "bg-emerald-500"
                    : currentStatus === "downtime"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current status</p>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          currentStatus === "running"
                            ? "bg-emerald-500"
                            : currentStatus === "downtime"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                        }`}
                      />
                      <p className="text-2xl font-semibold text-slate-950">{currentStatusLabel}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{currentStatusDetail}</p>
                  </div>

                  <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400">Current block</span>
                      <span className="mt-1 block text-sm font-medium text-slate-900">
                        {formatDuration(currentStatusSegment?.durationMinutes ?? 0)}
                      </span>
                    </div>
                    {currentStatusSegment?.reasonLabel ? (
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400">Cause</span>
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
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Performance</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-slate-950">Performance over selected range</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    Availability {formatPercent(report.summary.availability)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    Quality {formatPercent(report.summary.quality)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    OEE {formatPercent(report.summary.oee)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
                <MetricCard
                  label="Average speed"
                  value={formatSpeed(report.summary.averageSpeedUpm)}
                  hint={`Target ${report.line.targetUnitsPerMinute} upm`}
                />
                <MetricCard
                  label="Total produced"
                  value={formatNumber(report.summary.totalProduced)}
                  hint={report.line.unitOfMeasure}
                />
                <MetricCard
                  label="Average performance"
                  value={formatPercent(report.summary.averagePerformance)}
                  hint="Compared to max speed"
                />
              </div>

              <div className="mt-4 rounded-[18px] border border-slate-200 bg-white p-4">
                <PerformanceChart data={report.performanceSeries} />
              </div>
            </article>
          </div>

          {isEmpty ? (
            <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <TriangleAlert className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">No production activity in this range</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                The selected period appears to contain only scheduled stop time. Try a weekday or a broader range to surface running and downtime events.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status plan</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-950">Line status over time</h3>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                      {formatDuration(report.summary.totalDowntimeMinutes)} downtime
                    </div>
                  </div>

                  <div className="mt-5">
                    <StatusTimeline segments={report.statusTimeline} />
                  </div>
                </article>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Downtime ranking</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-950">Most common downtime events</h3>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-[#fff4df] px-3 py-1.5 text-xs text-[#b0781c]">
                      <Wrench className="h-4 w-4" />
                      Ranked by impact
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {report.downtimePareto.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                        No downtime events occurred during the selected range.
                      </div>
                    ) : (
                      report.downtimePareto.map((event, index) => {
                        const sampleEvent = report.downtimeEvents.find((item) => item.cause === event.cause);

                        return (
                        <div key={event.cause} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">#{index + 1} cause</p>
                              <h4 className="mt-1 text-base font-semibold text-slate-950">{event.cause}</h4>
                              <p className="mt-2 text-sm text-slate-500">
                                {event.eventCount} {event.eventCount === 1 ? "event" : "events"} • {formatDuration(event.totalMinutes)}
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
                              className="h-full rounded-full bg-gradient-to-r from-[#8aa8eb] via-[#b9b3f6] to-[#e39cb8]"
                              style={{ width: `${Math.max(event.impactShare * 100, 6)}%` }}
                            />
                          </div>
                        </div>
                      )})
                    )}
                  </div>
                </article>

                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Summary</p>
                    <h3 className="mt-1.5 text-lg font-semibold text-slate-950">Status mix</h3>
                  </div>
                  <div className="mt-5">
                    <StatusHistoryChart segments={report.statusTimeline} />
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

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-3 text-[18px] font-semibold leading-tight text-slate-950 md:text-[20px]">{value}</div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{hint}</p>
    </div>
  );
}
