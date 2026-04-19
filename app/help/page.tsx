import { SecondaryPage } from "@/components/secondary-page";

export default function HelpPage() {
  return (
    <SecondaryPage
      eyebrow="Support"
      title="Help and support"
      description="A help area gives operators and supervisors fast access to onboarding, troubleshooting guidance, and escalation paths when issues appear on the line."
      bullets={[
        "Document how statuses, OEE, and downtime categories are defined.",
        "Provide troubleshooting steps for sensors, gateway, and PLC integrations.",
        "Offer quick escalation paths for production-critical issues.",
      ]}
    />
  );
}
