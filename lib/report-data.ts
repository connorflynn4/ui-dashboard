import reportFixtures from "@/data/report-fixtures.json";
import type {
  DowntimeKind,
  PerformancePoint,
  ReportResponse,
  Shift,
  StatusSegment,
} from "@/types/report";

const DEFAULT_TIMEZONE = "America/Vancouver";

const STATUS_LABELS = {
  running: "Running",
  downtime: "In downtime",
  stopped: "Stopped",
} as const;

type RangeResolution =
  | {
      ok: true;
      start: Date;
      end: Date;
      rawStart: string;
      rawEnd: string;
    }
  | {
      ok: false;
      rawStart: string;
      rawEnd: string;
      message: string;
    };

type ReportFixture = ReportResponse & { durationHours: number };
type ReportFixtureCollection = { reports: ReportFixture[] };

function subtractDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

const fixtures = reportFixtures as unknown as ReportFixtureCollection;

const downtimeEventMetadata: Record<
  string,
  {
    source: "operator" | "plc" | "system";
    impact: "minor" | "major" | "critical";
    kind: DowntimeKind;
    faultCode?: string;
  }
> = {
  "Conveyor belt breakdown": { source: "plc", impact: "critical", kind: "unplanned", faultCode: "CV-214" },
  "Electrical issue": { source: "plc", impact: "major", kind: "unplanned", faultCode: "EL-018" },
  "Waiting on products": { source: "operator", impact: "major", kind: "unplanned" },
  "Changeover delay": { source: "operator", impact: "major", kind: "planned" },
  "Sensor fault reset": { source: "plc", impact: "minor", kind: "unplanned", faultCode: "IR-007" },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function seedFromText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pseudoRandom(value: string) {
  const seeded = seedFromText(value);
  return ((seeded * 9301 + 49297) % 233280) / 233280;
}

function scaleTimestamp(
  timestamp: string,
  fixtureStartMs: number,
  fixtureDurationMs: number,
  requestedStartMs: number,
  requestedDurationMs: number,
) {
  const offset = new Date(timestamp).getTime() - fixtureStartMs;
  const ratio = fixtureDurationMs === 0 ? 0 : offset / fixtureDurationMs;

  return new Date(requestedStartMs + ratio * requestedDurationMs).toISOString();
}

function scaleMinutes(value: number, scaleFactor: number) {
  return Math.max(0, Math.round(value * scaleFactor));
}

function selectFixture(durationHours: number): ReportFixture {
  return fixtures.reports.reduce((closest, candidate) => {
    const closestDelta = Math.abs(closest.durationHours - durationHours);
    const candidateDelta = Math.abs(candidate.durationHours - durationHours);

    return candidateDelta < closestDelta ? candidate : closest;
  });
}

function inferPointMetrics(
  status: StatusSegment["status"],
  timestamp: string,
  targetPerformance: number,
  targetUnitsPerMinute: number,
) {
  if (status === "stopped") {
    return { performance: 0, speedUpm: 0 };
  }

  if (status === "downtime") {
    return { performance: 0, speedUpm: 0 };
  }

  const variation = pseudoRandom(timestamp) * 0.12 - 0.06;
  const runningPerformance = clamp(targetPerformance + variation, 0.68, 0.92);
  const speedUpm = Number((runningPerformance * targetUnitsPerMinute).toFixed(1));
  const performance = Number((speedUpm / targetUnitsPerMinute).toFixed(3));

  return {
    performance,
    speedUpm,
  };
}

function buildPerformanceSeriesFromTimeline(
  statusTimeline: StatusSegment[],
  start: Date,
  end: Date,
  targetPerformance: number,
  targetUnitsPerMinute: number,
): PerformancePoint[] {
  const durationMs = end.getTime() - start.getTime();
  const bucketHours = durationMs <= 48 * 60 * 60 * 1000 ? 4 : durationMs <= 14 * 24 * 60 * 60 * 1000 ? 12 : 24;
  const bucketMs = bucketHours * 60 * 60 * 1000;
  const points: PerformancePoint[] = [];
  let cumulativeProduced = 0;

  for (let bucketStartMs = start.getTime(); bucketStartMs < end.getTime(); bucketStartMs += bucketMs) {
    const bucketEndMs = Math.min(bucketStartMs + bucketMs, end.getTime());
    const overlappingSegments = statusTimeline.filter((segment) => {
      const segmentStartMs = new Date(segment.start).getTime();
      const segmentEndMs = new Date(segment.end).getTime();

      return segmentEndMs > bucketStartMs && segmentStartMs < bucketEndMs;
    });

    if (overlappingSegments.length === 0) {
      points.push({
        timestamp: new Date(bucketStartMs).toISOString(),
        speedUpm: 0,
        performance: 0,
        status: "stopped",
        cumulativeProduced,
      });
      continue;
    }

    let weightedSpeed = 0;
    let totalWeight = 0;
    let dominantStatus: PerformancePoint["status"] = "stopped";
    let dominantMinutes = 0;

    for (const segment of overlappingSegments) {
      const segmentStartMs = new Date(segment.start).getTime();
      const segmentEndMs = new Date(segment.end).getTime();
      const overlapMinutes = Math.max(0, Math.min(segmentEndMs, bucketEndMs) - Math.max(segmentStartMs, bucketStartMs)) / 60000;

      if (overlapMinutes <= 0) {
        continue;
      }

      const metrics = inferPointMetrics(
        segment.status,
        new Date(bucketStartMs).toISOString(),
        targetPerformance,
        targetUnitsPerMinute,
      );

      weightedSpeed += metrics.speedUpm * overlapMinutes;
      totalWeight += overlapMinutes;

      if (overlapMinutes > dominantMinutes) {
        dominantMinutes = overlapMinutes;
        dominantStatus = segment.status;
      }
    }

    const speedUpm = totalWeight === 0 ? 0 : Number((weightedSpeed / totalWeight).toFixed(1));
    const performance =
      targetUnitsPerMinute === 0 ? 0 : Number((speedUpm / targetUnitsPerMinute).toFixed(3));
    cumulativeProduced += Math.round(speedUpm * totalWeight);

    points.push({
      timestamp: new Date(bucketStartMs).toISOString(),
      speedUpm,
      performance,
      status: dominantStatus,
      cumulativeProduced,
    });
  }

  return points;
}

export function getDefaultRange(now = new Date()) {
  const end = now;
  const start = subtractDays(end, 7);

  return {
    start,
    end,
    rawStart: start.toISOString(),
    rawEnd: end.toISOString(),
  };
}

export function resolvePageRange(searchParams: Record<string, string | string[] | undefined>, now = new Date()): RangeResolution {
  const requestedStart = typeof searchParams.start === "string" ? searchParams.start : "";
  const requestedEnd = typeof searchParams.end === "string" ? searchParams.end : "";

  if (!requestedStart && !requestedEnd) {
    const fallback = getDefaultRange(now);
    return { ok: true, ...fallback };
  }

  const start = new Date(requestedStart);
  const end = new Date(requestedEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      ok: false,
      rawStart: requestedStart,
      rawEnd: requestedEnd,
      message: "The selected range is invalid. Please choose a valid start and end date.",
    };
  }

  if (start >= end) {
    return {
      ok: false,
      rawStart: requestedStart,
      rawEnd: requestedEnd,
      message: "The report range must end after it starts.",
    };
  }

  return {
    ok: true,
    start,
    end,
    rawStart: requestedStart,
    rawEnd: requestedEnd,
  };
}

export function buildReportResponse(start: Date, end: Date, timeZone = DEFAULT_TIMEZONE): ReportResponse {
  const requestedDurationMs = Math.max(end.getTime() - start.getTime(), 60 * 60 * 1000);
  const requestedDurationHours = requestedDurationMs / (1000 * 60 * 60);
  const fixture = selectFixture(requestedDurationHours);
  const fixtureStartMs = new Date(fixture.range.start).getTime();
  const fixtureEndMs = new Date(fixture.range.end).getTime();
  const fixtureDurationMs = fixtureEndMs - fixtureStartMs;
  const scaleFactor = requestedDurationMs / fixtureDurationMs;
  const requestedStartMs = start.getTime();

  const statusTimeline: StatusSegment[] = fixture.statusTimeline.map((segment) => {
    const shiftedStart = scaleTimestamp(
      segment.start,
      fixtureStartMs,
      fixtureDurationMs,
      requestedStartMs,
      requestedDurationMs,
    );
    const shiftedEnd = scaleTimestamp(
      segment.end,
      fixtureStartMs,
      fixtureDurationMs,
      requestedStartMs,
      requestedDurationMs,
    );

    return {
      ...segment,
      start: shiftedStart,
      end: shiftedEnd,
      durationMinutes: Math.max(
        1,
        Math.round((new Date(shiftedEnd).getTime() - new Date(shiftedStart).getTime()) / 60000),
      ),
    };
  });

  const roundedTimelineMinutes = statusTimeline.reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const requestedDurationMinutes = Math.round(requestedDurationMs / 60000);
  const lastSegment = statusTimeline.at(-1);

  if (lastSegment && roundedTimelineMinutes !== requestedDurationMinutes) {
    lastSegment.durationMinutes = Math.max(
      1,
      lastSegment.durationMinutes + (requestedDurationMinutes - roundedTimelineMinutes),
    );
  }

  const shifts: Shift[] = (fixture.shifts ?? []).map((shift) => ({
    ...shift,
    startsAt: scaleTimestamp(
      shift.startsAt,
      fixtureStartMs,
      fixtureDurationMs,
      requestedStartMs,
      requestedDurationMs,
    ),
    endsAt: scaleTimestamp(
      shift.endsAt,
      fixtureStartMs,
      fixtureDurationMs,
      requestedStartMs,
      requestedDurationMs,
    ),
  }));

  const downtimePareto = fixture.downtimePareto
    .map((event) => ({
      ...event,
      totalMinutes: scaleMinutes(event.totalMinutes, scaleFactor),
    }))
    .sort((left, right) => right.totalMinutes - left.totalMinutes);

  const totalStoppedMinutes = statusTimeline
    .filter((segment) => segment.status === "stopped")
    .reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const totalRunningMinutes = statusTimeline
    .filter((segment) => segment.status === "running")
    .reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const totalPlannedDowntimeMinutes = statusTimeline
    .filter((segment) => segment.status === "downtime" && segment.downtimeKind === "planned")
    .reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const totalUnplannedDowntimeMinutes = statusTimeline
    .filter((segment) => segment.status === "downtime" && segment.downtimeKind !== "planned")
    .reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const totalDowntimeMinutes = totalPlannedDowntimeMinutes + totalUnplannedDowntimeMinutes;

  // Planned production time excludes both scheduled stops and planned downtime.
  // Availability captures only unplanned losses.
  const plannedProductionMinutes = Math.max(
    0,
    requestedDurationMinutes - totalStoppedMinutes - totalPlannedDowntimeMinutes,
  );
  const availability =
    plannedProductionMinutes === 0
      ? 0
      : clamp(totalRunningMinutes / plannedProductionMinutes, 0, 1);

  const performanceSeries = buildPerformanceSeriesFromTimeline(
    statusTimeline,
    start,
    end,
    fixture.line.targetPerformance,
    fixture.line.targetUnitsPerMinute,
  );
  const totalProduced = performanceSeries.at(-1)?.cumulativeProduced ?? 0;
  const averageSpeedUpm =
    requestedDurationMinutes === 0 ? 0 : Number((totalProduced / requestedDurationMinutes).toFixed(1));
  const performance =
    fixture.line.targetUnitsPerMinute === 0
      ? 0
      : Number((averageSpeedUpm / fixture.line.targetUnitsPerMinute).toFixed(3));
  const rejectRate = fixture.summary.rejectRate ?? 0.012;
  const rejectedUnits = Math.round(totalProduced * rejectRate);
  const goodUnits = Math.max(0, totalProduced - rejectedUnits);
  const quality = totalProduced === 0 ? 1 : goodUnits / totalProduced;
  const oee = Number((availability * performance * quality).toFixed(3));

  const downtimeEvents = statusTimeline
    .filter((segment) => segment.status === "downtime" && segment.reasonCategory && segment.reasonLabel)
    .map((segment, index) => {
      const metadata = downtimeEventMetadata[segment.reasonLabel ?? ""] ?? {
        source: "system" as const,
        impact: "major" as const,
        kind: "unplanned" as const,
      };

      const kind: DowntimeKind = segment.downtimeKind ?? metadata.kind;

      return {
        id: `dt-${new Date(segment.start).getTime()}-${index}`,
        start: segment.start,
        end: segment.end,
        durationMinutes: segment.durationMinutes,
        category: segment.reasonCategory ?? "Uncategorized",
        cause: segment.reasonLabel ?? "Unspecified downtime",
        source: metadata.source,
        impact: metadata.impact,
        kind,
        faultCode: metadata.faultCode,
      };
    });

  return {
    line: fixture.line,
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      timezone: timeZone,
      generatedAt: new Date().toISOString(),
    },
    shifts,
    summary: {
      averageSpeedUpm,
      totalProduced,
      goodUnits,
      rejectedUnits,
      rejectRate: Number(rejectRate.toFixed(4)),
      availability: Number(availability.toFixed(3)),
      performance: Number(performance.toFixed(3)),
      quality: Number(quality.toFixed(3)),
      oee,
      plannedProductionMinutes,
      averagePerformance: Number(performance.toFixed(3)),
      totalDowntimeMinutes,
      totalPlannedDowntimeMinutes,
      totalUnplannedDowntimeMinutes,
      totalStoppedMinutes,
      totalRunningMinutes,
    },
    statusTimeline,
    performanceSeries,
    downtimeEvents,
    downtimePareto,
  };
}

export function getStatusDisplayLabel(status: StatusSegment["status"]) {
  return STATUS_LABELS[status];
}
