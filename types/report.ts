export type LineStatus = "running" | "downtime" | "stopped";

export interface ReportResponse {
  line: {
    id: string;
    name: string;
    facilityName: string;
    productName: string;
    unitOfMeasure: string;
    targetUnitsPerMinute: number;
  };
  range: {
    start: string;
    end: string;
    timezone: string;
    generatedAt: string;
  };
  summary: {
    averageSpeedUpm: number;
    totalProduced: number;
    goodUnits: number;
    rejectedUnits: number;
    availability: number;
    performance: number;
    quality: number;
    oee: number;
    plannedProductionMinutes: number;
    averagePerformance: number;
    totalDowntimeMinutes: number;
    totalStoppedMinutes: number;
  };
  statusTimeline: Array<{
    start: string;
    end: string;
    status: LineStatus;
    durationMinutes: number;
    reasonCategory?: string;
    reasonLabel?: string;
  }>;
  performanceSeries: Array<{
    timestamp: string;
    speedUpm: number;
    performance: number;
    status: LineStatus;
      cumulativeProduced: number;
  }>;
  downtimeEvents: Array<{
    id: string;
    start: string;
    end: string;
    durationMinutes: number;
    category: string;
    cause: string;
    source: "operator" | "plc" | "system";
    impact: "minor" | "major" | "critical";
    faultCode?: string;
  }>;
  downtimePareto: Array<{
    cause: string;
    eventCount: number;
    totalMinutes: number;
    impactShare: number;
  }>;
}
