import { formatDuration } from "@/lib/format";
import { getStatusDisplayLabel } from "@/lib/report-data";
import type { ReportResponse } from "@/types/report";

type StatusTimelineProps = {
  segments: ReportResponse["statusTimeline"];
};

const statusStyles = {
  running: "bg-emerald-500",
  downtime: "bg-amber-500",
  stopped: "bg-slate-400",
} as const;

export function StatusTimeline({ segments }: StatusTimelineProps) {
  const totalDuration = segments.reduce((sum, segment) => sum + segment.durationMinutes, 0);
  const downtimeEvents = segments.filter((segment) => segment.status === "downtime").slice(0, 4);

  return (
    <div>
      <div className="flex h-6 overflow-hidden rounded-full bg-[#ebf0ff]">
        {segments.map((segment) => (
          <div
            key={`${segment.start}-${segment.end}`}
            className={`${statusStyles[segment.status]} min-w-1`}
            style={{ flexGrow: segment.durationMinutes }}
            title={`${getStatusDisplayLabel(segment.status)} • ${formatDuration(segment.durationMinutes)}`}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(["running", "downtime", "stopped"] as const).map((status) => {
          const duration = segments
            .filter((segment) => segment.status === status)
            .reduce((sum, segment) => sum + segment.durationMinutes, 0);

          return (
            <div key={status} className="rounded-2xl border border-[#dce4fb] bg-white/80 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[status]}`} />
                {getStatusDisplayLabel(status)}
              </div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <span className="font-metric text-3xl text-slate-950">{formatDuration(duration)}</span>
                <span className="text-sm text-slate-500">
                  {totalDuration === 0 ? 0 : Math.round((duration / totalDuration) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {downtimeEvents.length > 0 ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {downtimeEvents.map((segment) => (
            <div
              key={`${segment.start}-${segment.reasonLabel}`}
              className="rounded-2xl border border-[#dce4fb] bg-[#f7f9ff] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Downtime event</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{segment.reasonLabel}</p>
              <p className="mt-1 text-sm text-slate-500">{formatDuration(segment.durationMinutes)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
