import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function SettingsPage() {
  return <SecondaryPage content={getSecondaryPageContent("settings")} shellContent={getShellContent()} />;
}
