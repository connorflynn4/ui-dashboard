import { SecondaryPage } from "@/components/secondary-page";

export default function FacilityMapPage() {
  return (
    <SecondaryPage
      eyebrow="Operations"
      title="Facility map"
      description="A facility-level view would let supervisors compare multiple lines and quickly spot underperforming assets across the plant."
      bullets={[
        "Show each production asset with current state and alert condition.",
        "Help users move from site-wide monitoring into a specific line report.",
        "Support expansion from a single-line report to a broader plant workflow.",
      ]}
    />
  );
}
