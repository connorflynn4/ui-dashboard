import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function HelpPage() {
  return <SecondaryPage content={getSecondaryPageContent("help")} shellContent={getShellContent()} />;
}
