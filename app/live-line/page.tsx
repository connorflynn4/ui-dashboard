import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function LiveLinePage() {
  return <SecondaryPage content={getSecondaryPageContent("liveLine")} shellContent={getShellContent()} />;
}
