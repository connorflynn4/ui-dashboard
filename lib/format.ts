const dashboardDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dashboardDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const shortTickFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  hour12: true,
});

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatSpeed(value: number) {
  return `${value.toFixed(1)} upm`;
}

export function formatDateLabel(value: string) {
  return dashboardDateFormatter.format(new Date(value));
}

export function formatDateTimeLabel(value: string) {
  return dashboardDateTimeFormatter.format(new Date(value));
}

export function formatShortTick(value: string) {
  return shortTickFormatter.format(new Date(value));
}

const hourTickFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: true,
});

const dayHourTickFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  hour12: true,
});

const dayTickFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function formatAdaptiveTick(value: string, rangeDurationMs: number) {
  const date = new Date(value);

  if (rangeDurationMs <= DAY_MS) {
    return hourTickFormatter.format(date);
  }

  if (rangeDurationMs <= 3 * DAY_MS) {
    return dayHourTickFormatter.format(date);
  }

  return dayTickFormatter.format(date);
}

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}

export function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}
