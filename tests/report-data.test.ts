import { describe, expect, test } from "vitest";

import { buildReportResponse } from "@/lib/report-data";

describe("buildReportResponse", () => {
  test("returns non-negative metrics and bounded performance", () => {
    const report = buildReportResponse(new Date("2026-03-10T00:00:00.000Z"), new Date("2026-03-11T00:00:00.000Z"));

    expect(report.summary.averageSpeedUpm).toBeGreaterThanOrEqual(0);
    expect(report.summary.totalProduced).toBeGreaterThanOrEqual(0);
    expect(report.summary.goodUnits).toBeGreaterThanOrEqual(0);
    expect(report.summary.rejectedUnits).toBeGreaterThanOrEqual(0);
    expect(report.summary.goodUnits + report.summary.rejectedUnits).toBe(report.summary.totalProduced);
    expect(report.summary.availability).toBeGreaterThanOrEqual(0);
    expect(report.summary.availability).toBeLessThanOrEqual(1);
    expect(report.summary.performance).toBeGreaterThanOrEqual(0);
    expect(report.summary.performance).toBeLessThanOrEqual(1);
    expect(report.summary.quality).toBeGreaterThanOrEqual(0);
    expect(report.summary.quality).toBeLessThanOrEqual(1);
    expect(report.summary.oee).toBeGreaterThanOrEqual(0);
    expect(report.summary.oee).toBeLessThanOrEqual(1);
    expect(report.summary.averagePerformance).toBeGreaterThanOrEqual(0);
    expect(report.summary.averagePerformance).toBeLessThanOrEqual(1);
    expect(Array.isArray(report.downtimeEvents)).toBe(true);

    for (const point of report.performanceSeries) {
      expect(point.performance).toBeGreaterThanOrEqual(0);
      expect(point.performance).toBeLessThanOrEqual(1);
    }
  });

  test("sorts downtime pareto by impact and covers the selected range", () => {
    const start = new Date("2026-03-10T00:00:00.000Z");
    const end = new Date("2026-03-17T00:00:00.000Z");
    const report = buildReportResponse(start, end);

    for (let index = 1; index < report.downtimePareto.length; index += 1) {
      expect(report.downtimePareto[index - 1].totalMinutes).toBeGreaterThanOrEqual(report.downtimePareto[index].totalMinutes);
    }

    const totalTimelineMinutes = report.statusTimeline.reduce((sum, segment) => sum + segment.durationMinutes, 0);
    const rangeMinutes = (end.getTime() - start.getTime()) / 60000;

    expect(Math.round(totalTimelineMinutes)).toBe(Math.round(rangeMinutes));
    expect(report.downtimeEvents.every((event) => event.durationMinutes > 0)).toBe(true);
  });
});
