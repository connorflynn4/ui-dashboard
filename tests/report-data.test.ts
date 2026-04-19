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

  test("splits downtime into planned and unplanned totals", () => {
    const report = buildReportResponse(
      new Date("2026-03-10T00:00:00.000Z"),
      new Date("2026-03-17T00:00:00.000Z"),
    );

    const plannedFromTimeline = report.statusTimeline
      .filter((segment) => segment.status === "downtime" && segment.downtimeKind === "planned")
      .reduce((sum, segment) => sum + segment.durationMinutes, 0);
    const unplannedFromTimeline = report.statusTimeline
      .filter((segment) => segment.status === "downtime" && segment.downtimeKind !== "planned")
      .reduce((sum, segment) => sum + segment.durationMinutes, 0);

    expect(report.summary.totalPlannedDowntimeMinutes).toBe(plannedFromTimeline);
    expect(report.summary.totalUnplannedDowntimeMinutes).toBe(unplannedFromTimeline);
    expect(report.summary.totalPlannedDowntimeMinutes).toBeGreaterThan(0);
    expect(report.summary.totalUnplannedDowntimeMinutes).toBeGreaterThan(0);
  });

  test("availability excludes planned downtime from the denominator", () => {
    const report = buildReportResponse(
      new Date("2026-03-10T00:00:00.000Z"),
      new Date("2026-03-17T00:00:00.000Z"),
    );

    const expectedDenominator =
      report.summary.totalRunningMinutes + report.summary.totalUnplannedDowntimeMinutes;
    const expectedAvailability =
      expectedDenominator === 0 ? 0 : report.summary.totalRunningMinutes / expectedDenominator;

    expect(report.summary.availability).toBeCloseTo(expectedAvailability, 2);
    expect(report.summary.plannedProductionMinutes).toBe(expectedDenominator);
  });

  test("exposes shifts and target performance from the fixture", () => {
    const report = buildReportResponse(
      new Date("2026-03-16T00:00:00.000Z"),
      new Date("2026-03-17T00:00:00.000Z"),
    );

    expect(report.line.targetPerformance).toBeGreaterThan(0);
    expect(report.shifts.length).toBeGreaterThan(0);
    for (const shift of report.shifts) {
      expect(new Date(shift.startsAt).getTime()).toBeLessThan(new Date(shift.endsAt).getTime());
    }
  });
});
