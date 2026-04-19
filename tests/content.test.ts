import { describe, expect, test } from "vitest";

import { getReportPageContent, getSecondaryPageContent, getShellContent } from "@/lib/content";

describe("content layer", () => {
  test("loads shell, report, and secondary page content", () => {
    const shellContent = getShellContent();
    const reportPageContent = getReportPageContent();
    const supervisorPage = getSecondaryPageContent("supervisorView");

    expect(shellContent.navigation.mainItems.length).toBeGreaterThan(0);
    expect(shellContent.navigation.footerItems.length).toBeGreaterThan(0);
    expect(reportPageContent.filterBar.presets["24h"]).toBeTruthy();
    expect(reportPageContent.statusMix.labels.running).toBeTruthy();
    expect(supervisorPage.title).toBeTruthy();
    expect(supervisorPage.bullets.length).toBeGreaterThan(0);
  });

  test("fails fast for an invalid secondary page key", () => {
    expect(() => getSecondaryPageContent("unknown" as never)).toThrow(/Missing secondary page content/);
  });
});
