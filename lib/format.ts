const DASHBOARD_TIME_ZONE = "America/Vancouver";

const datePartsFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: DASHBOARD_TIME_ZONE,
});

const dateTimePartsFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: DASHBOARD_TIME_ZONE,
  timeZoneName: "short",
});

const hourTickPartsFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: true,
  timeZone: DASHBOARD_TIME_ZONE,
});

const dayHourTickPartsFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  hour12: true,
  timeZone: DASHBOARD_TIME_ZONE,
});

const dayTickPartsFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: DASHBOARD_TIME_ZONE,
});

const headerTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: DASHBOARD_TIME_ZONE,
});

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function partsToRecord(parts: Intl.DateTimeFormatPart[]) {
  return parts.reduce<Record<string, string>>((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }

    return accumulator;
  }, {});
}

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
  const parts = partsToRecord(datePartsFormatter.formatToParts(new Date(value)));
  return `${parts.month} ${parts.day}, ${parts.year}`;
}

export function formatDateTimeLabel(value: string) {
  const parts = partsToRecord(dateTimePartsFormatter.formatToParts(new Date(value)));
  return `${parts.month} ${parts.day}, ${parts.year} at ${parts.hour}:${parts.minute} ${parts.dayPeriod} ${parts.timeZoneName}`;
}

export function formatShortTick(value: string) {
  const parts = partsToRecord(dayHourTickPartsFormatter.formatToParts(new Date(value)));
  return `${parts.month} ${parts.day}, ${parts.hour} ${parts.dayPeriod}`;
}

export function formatHeaderTime(value: string) {
  return headerTimeFormatter.format(new Date(value));
}

export function formatAdaptiveTick(value: string, rangeDurationMs: number) {
  const date = new Date(value);

  if (rangeDurationMs <= DAY_MS) {
    const parts = partsToRecord(hourTickPartsFormatter.formatToParts(date));
    return `${parts.hour} ${parts.dayPeriod}`;
  }

  if (rangeDurationMs <= 3 * DAY_MS) {
    const parts = partsToRecord(dayHourTickPartsFormatter.formatToParts(date));
    return `${parts.month} ${parts.day}, ${parts.hour} ${parts.dayPeriod}`;
  }

  const parts = partsToRecord(dayTickPartsFormatter.formatToParts(date));
  return `${parts.month} ${parts.day}`;
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
