import { SecondaryPage } from "@/components/secondary-page";

export default function SettingsPage() {
  return (
    <SecondaryPage
      eyebrow="Administration"
      title="Settings"
      description="Settings would cover user preferences, notification thresholds, and line-specific configuration that supports daily monitoring and reporting."
      bullets={[
        "Configure target speed, line metadata, and timezone defaults.",
        "Manage alert thresholds for downtime, speed loss, and quality drift.",
        "Adjust preferences without interrupting the reporting workflow.",
      ]}
    />
  );
}
