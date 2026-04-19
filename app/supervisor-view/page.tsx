import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function SupervisorViewPage() {
  return <SecondaryPage content={getSecondaryPageContent("supervisorView")} shellContent={getShellContent()} />;
}
