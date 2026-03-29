import type { DashboardAccountStat, ExpenseSource } from '@/types/api.types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
}

const ACCOUNT_ICON: Record<ExpenseSource, { path: string; color: string }> = {
  CARD: {
    path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    color: 'text-tertiary',
  },
  CASH: {
    path: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'text-primary',
  },
  TRANSFER: {
    path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    color: 'text-secondary',
  },
  DIGITAL_WALLET: {
    path: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    color: 'text-tertiary',
  },
};

interface ByAccountSummaryProps {
  data: DashboardAccountStat[];
}

export function ByAccountSummary({ data }: ByAccountSummaryProps) {
  if (data.length === 0) return null;

  return (
    <section className="space-y-4">
      <h4 className="text-sm font-black uppercase tracking-widest text-on-surface-variant px-1">
        Cuentas Activas
      </h4>
      <div className="flex flex-wrap gap-4">
        {data.map((account) => {
          const icon = ACCOUNT_ICON[account.type] ?? ACCOUNT_ICON.CARD;
          return (
            <div
              key={account.accountId}
              className="flex-1 min-w-[180px] bg-surface-container-lowest px-6 py-4 rounded-full flex items-center justify-between border border-outline-variant/30 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 shrink-0 ${icon.color}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
                </svg>
                <span className="text-sm font-semibold text-on-surface">{account.name}</span>
              </div>
              <span className="font-black text-on-surface ml-4 shrink-0">
                {formatCurrency(account.total)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ByAccountSummarySkeleton() {
  return (
    <section className="space-y-4 animate-pulse">
      <div className="h-3 w-28 bg-surface-container rounded" />
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 min-w-[180px] h-14 bg-surface-container-lowest rounded-full border border-outline-variant/20"
          />
        ))}
      </div>
    </section>
  );
}
