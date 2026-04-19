import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function BatchLogPage() {
  return <SecondaryPage content={getSecondaryPageContent("batchLog")} shellContent={getShellContent()} />;
}
