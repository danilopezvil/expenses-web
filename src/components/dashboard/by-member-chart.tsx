import type { DashboardMemberStat } from '@/types/api.types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
}

interface ByMemberChartProps {
  data: DashboardMemberStat[];
}

export function ByMemberChart({ data }: ByMemberChartProps) {
  return (
    <section className="bg-surface-container-low p-8 rounded-xl">
      <h4 className="text-lg font-bold font-headline mb-8 flex items-center justify-between text-on-surface">
        Distribución por Miembro
        <span className="text-on-surface-variant text-sm font-normal">···</span>
      </h4>

      {data.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic">Sin datos para este período.</p>
      ) : (
        <div className="space-y-7">
          {data.map((member) => (
            <div key={member.memberId}>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: member.color || '#bc000a' }}
                  />
                  <span className="text-sm font-bold text-on-surface">{member.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-on-surface">
                    {formatCurrency(member.total)}
                  </span>
                  <span className="text-xs text-on-surface-variant ml-1.5">
                    {member.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${member.percentage}%`,
                    backgroundColor: member.color || '#bc000a',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ByMemberChartSkeleton() {
  return (
    <section className="bg-surface-container-low p-8 rounded-xl animate-pulse">
      <div className="h-5 w-44 bg-surface-container rounded mb-8" />
      <div className="space-y-7">
        {[70, 45, 30].map((w) => (
          <div key={w}>
            <div className="flex justify-between mb-2">
              <div className="h-3 w-20 bg-surface-container rounded" />
              <div className="h-3 w-16 bg-surface-container rounded" />
            </div>
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-surface-container rounded-full" style={{ width: `${w}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
