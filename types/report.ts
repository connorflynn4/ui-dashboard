export type LineStatus = "running" | "downtime" | "stopped";
export type DowntimeKind = "planned" | "unplanned";

export interface Shift {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
}

export interface StatusSegment {
  start: string;
  end: string;
  status: LineStatus;
  durationMinutes: number;
  reasonCategory?: string;
  reasonLabel?: string;
  downtimeKind?: DowntimeKind;
  shiftId?: string;
}

export interface PerformancePoint {
  timestamp: string;
  speedUpm: number;
  performance: number;
  status: LineStatus;
  cumulativeProduced: number;
}

export interface DowntimeEvent {
  id: string;
  start: string;
  end: string;
  durationMinutes: number;
  category: string;
  cause: string;
  source: "operator" | "plc" | "system";
  impact: "minor" | "major" | "critical";
  kind: DowntimeKind;
  faultCode?: string;
}

export interface DowntimeParetoRow {
  cause: string;
  eventCount: number;
  totalMinutes: number;
  impactShare: number;
  kind: DowntimeKind;
}

export interface ReportResponse {
  line: {
    id: string;
    name: string;
    facilityName: string;
    productName: string;
    unitOfMeasure: string;
    targetUnitsPerMinute: number;
    targetPerformance: number;
  };
  range: {
    start: string;
    end: string;
    timezone: string;
    generatedAt: string;
  };
  shifts: Shift[];
  summary: {
    averageSpeedUpm: number;
    totalProduced: number;
    goodUnits: number;
    rejectedUnits: number;
    rejectRate: number;
    availability: number;
    performance: number;
    quality: number;
    oee: number;
    plannedProductionMinutes: number;
    averagePerformance: number;
    totalDowntimeMinutes: number;
    totalPlannedDowntimeMinutes: number;
    totalUnplannedDowntimeMinutes: number;
    totalStoppedMinutes: number;
    totalRunningMinutes: number;
  };
  statusTimeline: StatusSegment[];
  performanceSeries: PerformancePoint[];
  downtimeEvents: DowntimeEvent[];
  downtimePareto: DowntimeParetoRow[];
}
