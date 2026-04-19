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
    expect(body.summary.oee).toBeGreaterThanOrEqual(0);
    expect(body.summary.oee).toBeLessThanOrEqual(1);
    expect(Array.isArray(body.statusTimeline)).toBe(true);
    expect(Array.isArray(body.performanceSeries)).toBe(true);
    expect(Array.isArray(body.downtimeEvents)).toBe(true);
    expect(Array.isArray(body.downtimePareto)).toBe(true);
  });

  test("rejects invalid ranges", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/report?start=2026-03-11T00:00:00.000Z&end=2026-03-10T00:00:00.000Z",
      ),
    );

    expect(response.status).toBe(400);
  });
});
