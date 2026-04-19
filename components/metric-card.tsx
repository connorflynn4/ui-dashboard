type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tooltip: string;
};

export function MetricCard({ label, value, hint, tooltip }: MetricCardProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4" title={tooltip}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-3 text-[18px] font-semibold leading-tight text-slate-950 md:text-[20px]">{value}</div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{hint}</p>
    </div>
  );
}
