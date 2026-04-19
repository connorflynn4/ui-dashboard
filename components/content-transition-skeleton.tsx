function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[18px] border border-slate-200 bg-white/95 ${className}`} />;
}

export function ContentTransitionSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-[108px]" />
      <div className="grid gap-3 md:grid-cols-3">
        <SkeletonBlock className="h-[104px]" />
        <SkeletonBlock className="h-[104px]" />
        <SkeletonBlock className="h-[104px]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <SkeletonBlock className="h-[250px]" />
        <SkeletonBlock className="h-[250px]" />
      </div>
    </div>
  );
}
