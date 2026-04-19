import { SecondaryPage } from "@/components/secondary-page";
import { getSecondaryPageContent, getShellContent } from "@/lib/content";

export default function FacilityMapPage() {
  return <SecondaryPage content={getSecondaryPageContent("facilityMap")} shellContent={getShellContent()} />;
}
