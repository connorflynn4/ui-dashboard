export type IconKey =
  | "layoutGrid"
  | "blocks"
  | "list"
  | "squareCheckBig"
  | "inbox"
  | "slidersHorizontal"
  | "settings"
  | "helpCircle";

export type SecondaryPageKey =
  | "liveLine"
  | "downtime"
  | "batchLog"
  | "facilityMap"
  | "supervisorView"
  | "settings"
  | "help";

export type ReportPresetKey = "24h" | "7d" | "30d";
export type StatusContentKey = "running" | "unplanned" | "planned" | "stopped";

export interface ShellNavItemContent {
  label: string;
  href: string;
  iconKey: IconKey;
}

export interface ShellContent {
  brand: {
    logoAlt: string;
    headerEyebrow: string;
    liveBadgeLabel: string;
    defaultFacilityName: string;
    defaultLineName: string;
  };
  currentUser: {
    displayName: string;
    initials: string;
  };
  navigation: {
    mainSectionLabel: string;
    mainItems: ShellNavItemContent[];
    footerItems: ShellNavItemContent[];
  };
}

export interface SecondaryPagePanelContent {
  purposeTitle: string;
  noteTitle: string;
  noteBody: string;
  scopeTitle: string;
  scopeBody: string;
}

export interface SecondaryPageContent {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  panels: SecondaryPagePanelContent;
}

export type SecondaryPagesContent = Record<SecondaryPageKey, SecondaryPageContent>;

export interface ReportMetricContent {
  label: string;
  tooltip: string;
  hintPrefix: string;
}

export interface ReportPageContent {
  invalidRange: {
    badgeLabel: string;
    title: string;
  };
  filterBar: {
    badgeLabel: string;
    helperText: string;
    startLabel: string;
    endLabel: string;
    submitLabel: string;
    pendingLabel: string;
    presets: Record<ReportPresetKey, string>;
  };
  header: {
    eyebrow: string;
    generatedLabel: string;
  };
  currentStatus: {
    eyebrow: string;
    currentBlockLabel: string;
    causeLabel: string;
  };
  performance: {
    eyebrow: string;
    title: string;
    helperTextSuffix: string;
    pills: {
      availability: string;
      quality: string;
      oee: string;
    };
  };
  metrics: {
    averageSpeed: ReportMetricContent;
    totalProduced: ReportMetricContent;
    averagePerformance: ReportMetricContent;
    totalProducedHint: {
      goodLabel: string;
      rejectedLabel: string;
      separator: string;
    };
  };
  emptyState: {
    title: string;
    description: string;
  };
  statusTimeline: {
    eyebrow: string;
    title: string;
    helperText: string;
    pills: {
      unplanned: string;
      planned: string;
    };
    labels: Record<StatusContentKey, string>;
  };
  downtime: {
    eyebrow: string;
    title: string;
    rankedByImpactLabel: string;
    noEventsText: string;
    causeEyebrowSuffix: string;
    eventLabelSingular: string;
    eventLabelPlural: string;
    kindLabels: {
      planned: string;
      unplanned: string;
    };
  };
  statusMix: {
    eyebrow: string;
    title: string;
    centerLabel: string;
    rangeHint: string;
    labels: Record<StatusContentKey, string>;
  };
  tooltips: {
    availability: string;
    quality: string;
    oee: string;
    currentBlock: string;
    currentCause: string;
    unplannedDowntime: string;
    plannedDowntime: string;
    rankedByImpact: string;
  };
}
