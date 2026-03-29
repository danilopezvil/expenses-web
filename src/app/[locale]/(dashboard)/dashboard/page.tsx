'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGroupStore } from '@/lib/stores/group.store';
import { useDashboard } from '@/lib/queries/use-dashboard';
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/kpi-card';
import { ByMemberChart, ByMemberChartSkeleton } from '@/components/dashboard/by-member-chart';
import { ByCategoryChart, ByCategoryChartSkeleton } from '@/components/dashboard/by-category-chart';
import { ByAccountSummary, ByAccountSummarySkeleton } from '@/components/dashboard/by-account-summary';
import { UnassignedBanner } from '@/components/dashboard/unassigned-banner';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

const MONTHS = [
  { value: '01', label: '01 - Enero' },
  { value: '02', label: '02 - Febrero' },
  { value: '03', label: '03 - Marzo' },
  { value: '04', label: '04 - Abril' },
  { value: '05', label: '05 - Mayo' },
  { value: '06', label: '06 - Junio' },
  { value: '07', label: '07 - Julio' },
  { value: '08', label: '08 - Agosto' },
  { value: '09', label: '09 - Septiembre' },
  { value: '10', label: '10 - Octubre' },
  { value: '11', label: '11 - Noviembre' },
  { value: '12', label: '12 - Diciembre' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => String(CURRENT_YEAR - i));

// ── This inner component uses useSearchParams and must stay inside <Suspense> ──
function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGroup = useGroupStore((s) => s.activeGroup);

  const now = new Date();
  const month = searchParams.get('month') ?? String(now.getMonth() + 1).padStart(2, '0');
  const year = searchParams.get('year') ?? String(now.getFullYear());

  const { data, isLoading, isError } = useDashboard(activeGroup?.id ?? '', { month, year });

  function handleFilterChange(newMonth: string, newYear: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', newMonth);
    params.set('year', newYear);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const {
    totalAmount = 0,
    assignedAmount = 0,
    unassignedAmount = 0,
    expenseCount = 0,
    byMember = [],
    byCategory = [],
    byAccount = [],
    unassigned = { count: 0, total: 0 },
  } = data ?? {};

  const assignedPct = totalAmount > 0 ? ((assignedAmount / totalAmount) * 100).toFixed(0) : '0';
  const isEmpty = !isLoading && !isError && data && expenseCount === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-headline text-on-surface">
            Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Resumen de gastos compartidos</p>
        </div>

        {/* MonthYearFilter */}
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => handleFilterChange(e.target.value, year)}
            title="Mes"
            aria-label="Mes"
            className="bg-surface-container-high border-none rounded-lg text-sm font-medium py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer transition-all duration-200"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => handleFilterChange(month, e.target.value)}
            title="Año"
            aria-label="Año"
            className="bg-surface-container-high border-none rounded-lg text-sm font-medium py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer transition-all duration-200"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Unassigned banner */}
      {data && unassigned.count > 0 && (
        <UnassignedBanner count={unassigned.count} total={unassigned.total} />
      )}

      {/* Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container px-5 py-4 rounded-xl text-sm">
          No se pudo cargar el dashboard. Verifica tu conexión e intenta de nuevo.
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : data ? (
          <>
            <KpiCard title="Total" value={formatCurrency(totalAmount)} accent />
            <KpiCard
              title="Asignado"
              value={formatCurrency(assignedAmount)}
              subtitle={`${assignedPct}% del total`}
            />
            <KpiCard
              title="Sin asignar"
              value={formatCurrency(unassignedAmount)}
              subtitle={`${unassigned.count} transacciones`}
            />
            <KpiCard
              title="Gastos"
              value={String(expenseCount)}
              subtitle={`Prom. ${expenseCount > 0 ? (expenseCount / 30).toFixed(1) : '0'}/día`}
            />
          </>
        ) : null}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Sin gastos en este período</h3>
          <p className="text-sm text-on-surface-variant max-w-xs">
            No hay gastos registrados para {MONTHS.find((m) => m.value === month)?.label?.split(' - ')[1]} {year}.
          </p>
        </div>
      )}

      {/* Charts */}
      {!isLoading && data && expenseCount > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ByMemberChart data={byMember} />
            <ByCategoryChart data={byCategory} />
          </div>
          <ByAccountSummary data={byAccount} />
        </>
      )}

      {/* Skeleton charts */}
      {isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ByMemberChartSkeleton />
            <ByCategoryChartSkeleton />
          </div>
          <ByAccountSummarySkeleton />
        </>
      )}
    </div>
  );
}

// ── Page wraps DashboardContent in Suspense (required for useSearchParams) ──
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="h-8 w-40 bg-surface-container rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ByMemberChartSkeleton /><ByCategoryChartSkeleton />
          </div>
          <ByAccountSummarySkeleton />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
