function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-[#245C45]/10 dark:bg-white/10 ${className}`} />;
}

// list-loading placeholder mirroring the Card list layout
export default function SkeletonList({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/70 dark:border-[#223027] bg-white/95 dark:bg-[#121c16] p-5 shadow-[0_4px_20px_-4px_rgba(36,92,69,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45)]">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Skeleton className="h-8" /><Skeleton className="h-8" /><Skeleton className="h-8" /><Skeleton className="h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3, className = '' }) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/70 dark:border-[#223027] bg-white/95 dark:bg-[#121c16] p-5 shadow-[0_4px_20px_-4px_rgba(36,92,69,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45)]">
          <Skeleton className="h-24 mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
