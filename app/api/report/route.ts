import { NextResponse } from "next/server";

import { buildReportResponse } from "@/lib/report-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json(
      { error: "Missing required start and end query parameters." },
      { status: 400 },
    );
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return NextResponse.json(
      { error: "Invalid report range. Ensure start and end are valid ISO dates and start precedes end." },
      { status: 400 },
    );
  }

  return NextResponse.json(buildReportResponse(start, end));
}
