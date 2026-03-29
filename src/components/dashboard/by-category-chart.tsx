import type { DashboardCategoryStat } from '@/types/api.types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
}

// Fallback icon paths for known category names
const CATEGORY_ICON_PATHS: Record<string, string> = {
  supermercado: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  restaurante: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  transporte: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  default: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
};

function getCategoryIconPath(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_ICON_PATHS[key] ?? CATEGORY_ICON_PATHS.default;
}

interface ByCategoryChartProps {
  data: DashboardCategoryStat[];
}

export function ByCategoryChart({ data }: ByCategoryChartProps) {
  const sorted = [...data].sort((a, b) => b.total - a.total);

  return (
    <section className="bg-surface-container-low p-8 rounded-xl">
      <h4 className="text-lg font-bold font-headline mb-8 flex items-center justify-between text-on-surface">
        Gastos por Categoría
        <span className="text-on-surface-variant text-sm font-normal">⇅</span>
      </h4>

      {sorted.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic">Sin datos para este período.</p>
      ) : (
        <div className="space-y-6">
          {sorted.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-lg text-primary shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={cat.icon ?? getCategoryIconPath(cat.name)}
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-tighter text-on-surface truncate">
                    {cat.name}
                  </span>
                  <span className="text-xs font-black text-on-surface ml-2 shrink-0">
                    {formatCurrency(cat.total)}{' '}
                    <span className="text-on-surface-variant font-normal">
                      ({cat.percentage.toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ByCategoryChartSkeleton() {
  return (
    <section className="bg-surface-container-low p-8 rounded-xl animate-pulse">
      <div className="h-5 w-44 bg-surface-container rounded mb-8" />
      <div className="space-y-6">
        {[80, 55, 35].map((w) => (
          <div key={w} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-container rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <div className="h-3 w-24 bg-surface-container rounded" />
                <div className="h-3 w-16 bg-surface-container rounded" />
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-surface-container rounded-full" style={{ width: `${w}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
