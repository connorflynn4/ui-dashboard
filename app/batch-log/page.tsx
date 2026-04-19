import { SecondaryPage } from "@/components/secondary-page";

export default function BatchLogPage() {
  return (
    <SecondaryPage
      eyebrow="Production history"
      title="Batch log"
      description="A batch-oriented page would track product runs, shift boundaries, and changeovers so supervisors can reconcile production output against plan."
      bullets={[
        "Capture start and end times for each product run or batch.",
        "Link changeover periods to output loss and downtime classification.",
        "Provide a clean handoff between production history and reporting.",
      ]}
    />
  );
}
