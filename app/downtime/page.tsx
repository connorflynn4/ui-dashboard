import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function DowntimePage() {
  return <SecondaryPage content={getSecondaryPageContent("downtime")} shellContent={getShellContent()} />;
}
