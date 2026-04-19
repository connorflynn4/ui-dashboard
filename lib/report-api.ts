import { headers } from "next/headers";

import type { ReportResponse } from "@/types/report";

function getOriginFromHeaders(headerList: Headers) {
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    throw new Error("Could not determine the dashboard origin for the report API request.");
  }

  return `${protocol}://${host}`;
}

export async function fetchReport(start: string, end: string) {
  const headerList = await headers();
  const origin = getOriginFromHeaders(headerList);
  const query = new URLSearchParams({ start, end });
  const response = await fetch(`${origin}/api/report?${query.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Unable to load report data from the mock API.");
  }

  return (await response.json()) as ReportResponse;
}
