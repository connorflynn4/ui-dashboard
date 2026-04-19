import { describe, expect, test } from "vitest";

import { GET } from "@/app/api/report/route";

describe("/api/report", () => {
  test("returns a report for a valid range", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/report?start=2026-03-10T00:00:00.000Z&end=2026-03-11T00:00:00.000Z",
      ),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.line.name).toBe("Packaging Line 1");
    expect(body.line.targetPerformance).toBeGreaterThan(0);
    expect(body.line.targetPerformance).toBeLessThanOrEqual(1);
    expect(typeof body.range.timezone).toBe("string");
    expect(body.summary.oee).toBeGreaterThanOrEqual(0);
    expect(body.summary.oee).toBeLessThanOrEqual(1);
    expect(body.summary.rejectRate).toBeGreaterThan(0);
    expect(body.summary.rejectRate).toBeLessThan(0.1);
    expect(
      body.summary.totalPlannedDowntimeMinutes + body.summary.totalUnplannedDowntimeMinutes,
    ).toBe(body.summary.totalDowntimeMinutes);
    expect(Array.isArray(body.shifts)).toBe(true);
    expect(Array.isArray(body.statusTimeline)).toBe(true);
    expect(Array.isArray(body.performanceSeries)).toBe(true);
    expect(Array.isArray(body.downtimeEvents)).toBe(true);
    expect(Array.isArray(body.downtimePareto)).toBe(true);
    for (const event of body.downtimeEvents) {
      expect(["planned", "unplanned"]).toContain(event.kind);
    }
    for (const row of body.downtimePareto) {
      expect(["planned", "unplanned"]).toContain(row.kind);
    }
  });

  test("rejects inverted ranges", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/report?start=2026-03-11T00:00:00.000Z&end=2026-03-10T00:00:00.000Z",
      ),
    );

    expect(response.status).toBe(400);
  });

  test("rejects requests missing start/end", async () => {
    const response = await GET(new Request("http://localhost:3000/api/report"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(typeof body.error).toBe("string");
  });

  test("rejects malformed dates", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/report?start=not-a-date&end=also-not"),
    );

    expect(response.status).toBe(400);
  });
});
