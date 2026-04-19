import { AppShell } from "@/components/app-shell";
import { ReportSkeleton } from "@/components/report-skeleton";
import { getShellContent } from "@/lib/content";

export default function Loading() {
  const shellContent = getShellContent();

  return (
    <AppShell
      generatedAt={new Date().toISOString()}
      facilityName={shellContent.brand.defaultFacilityName}
      lineName={shellContent.brand.defaultLineName}
      shellContent={shellContent}
    >
      <ReportSkeleton />
    </AppShell>
  );
}
