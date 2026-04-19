import reportPageData from "@/data/content/report-page.json";
import secondaryPagesData from "@/data/content/secondary-pages.json";
import shellData from "@/data/content/shell.json";
import type {
  ReportPageContent,
  SecondaryPageContent,
  SecondaryPageKey,
  SecondaryPagesContent,
  ShellContent,
} from "@/types/content";

const shellContent = shellData as ShellContent;
const secondaryPagesContent = secondaryPagesData as SecondaryPagesContent;
const reportPageContent = reportPageData as ReportPageContent;

export function getShellContent() {
  return shellContent;
}

export function getReportPageContent() {
  return reportPageContent;
}

export function getSecondaryPageContent(key: SecondaryPageKey): SecondaryPageContent {
  const pageContent = secondaryPagesContent[key];

  if (!pageContent) {
    throw new Error(`Missing secondary page content for key "${key}".`);
  }

  return pageContent;
}
