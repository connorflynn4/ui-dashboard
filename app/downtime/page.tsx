import { SecondaryPage } from "@/components/secondary-page";

export default function DowntimePage() {
  return (
    <SecondaryPage
      eyebrow="Downtime tracking"
      title="Downtime review"
      description="This section would help operators and supervisors review active and historical downtime records, validate causes, and quantify lost time by event."
      bullets={[
        "List downtime events with source, fault code, and operator-entered root cause.",
        "Support quick categorization and notes capture on the floor.",
        "Roll events into Pareto views for continuous improvement analysis.",
      ]}
    />
  );
}
