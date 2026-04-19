import { AppShell } from "@/components/app-shell";
import { ReportSkeleton } from "@/components/report-skeleton";
import { APP_FACILITY_NAME, APP_LINE_NAME } from "@/lib/app-config";

export default function Loading() {
  return (
    <AppShell
      generatedAt={new Date().toISOString()}
      facilityName={APP_FACILITY_NAME}
      lineName={APP_LINE_NAME}
    >
      <ReportSkeleton />
    </AppShell>
  );
}
