import { SecondaryPage } from "@/components/secondary-page";

export default function SupervisorViewPage() {
  return (
    <SecondaryPage
      eyebrow="Continuous improvement"
      title="Supervisor view"
      description="A supervisor-focused page would consolidate historical trends, ranking views, and cross-shift comparisons to identify the most meaningful improvement opportunities."
      bullets={[
        "Compare shifts, lines, and recurring losses over time.",
        "Track OEE movement after operational changes or maintenance actions.",
        "Use reporting to prioritize the next improvement opportunity.",
      ]}
    />
  );
}
