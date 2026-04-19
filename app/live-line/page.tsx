import { SecondaryPage } from "@/components/secondary-page";

export default function LiveLinePage() {
  return (
    <SecondaryPage
      eyebrow="Live monitoring"
      title="Live line view"
      description="A real-time operator-facing screen would focus on the current shift, live count rate, active status, and fast acknowledgement of downtime conditions."
      bullets={[
        "Show current line state with second-by-second product count updates.",
        "Surface live alerts when speed drops or unplanned downtime begins.",
        "Keep the layout touch-friendly for tablets on the shop floor.",
      ]}
    />
  );
}
