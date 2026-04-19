function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[22px] border border-slate-200 bg-white ${className}`} />;
}

export function ReportSkeleton() {
  return (
    <div className="space-y-5">
      <SkeletonCard className="h-[124px]" />
      <div className="grid gap-3 md:grid-cols-3">
        <SkeletonCard className="h-[112px]" />
        <SkeletonCard className="h-[112px]" />
        <SkeletonCard className="h-[112px]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <SkeletonCard className="h-[280px]" />
        <SkeletonCard className="h-[280px]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SkeletonCard className="h-[320px]" />
        <SkeletonCard className="h-[320px]" />
      </div>
    </div>
  );
}
