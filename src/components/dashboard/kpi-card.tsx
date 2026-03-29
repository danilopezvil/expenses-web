interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  accent?: boolean;
}

export function KpiCard({ title, value, subtitle, trend, accent = false }: KpiCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm ${
        accent ? 'border-b-4 border-primary' : 'border border-outline-variant/20'
      }`}
    >
      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
        {title}
      </p>
      <h3 className="text-[28px] font-black font-headline text-on-surface leading-none">
        {value}
      </h3>
      {subtitle && (
        <p className="text-xs text-on-surface-variant mt-2">{subtitle}</p>
      )}
      {trend && (
        <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1">
          <span>↑</span> {trend}
        </p>
      )}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20 animate-pulse">
      <div className="h-3 w-20 bg-surface-container rounded mb-3" />
      <div className="h-8 w-28 bg-surface-container rounded" />
    </div>
  );
}
