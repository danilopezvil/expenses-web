'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGroupStore } from '@/lib/stores/group.store';
import { useExpenses, useDeleteExpense } from '@/lib/queries/use-expenses';
import { ExpenseTable } from '@/components/expenses/expense-table';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { AssignmentEditor } from '@/components/expenses/assignment-editor';
import type { Expense } from '@/types/api.types';

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

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'ASSIGNED', label: 'Asignado' },
  { value: 'CLASSIFIED', label: 'Clasificado' },
  { value: 'VOIDED', label: 'Anulado' },
  { value: 'IMPORTED', label: 'Importado' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => String(CURRENT_YEAR - i));
const now = new Date();

// ── Inner component using useSearchParams ─────────────────────────────────────
function ExpensesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const groupId = activeGroup?.id ?? '';

  // Read filters from URL
  const month = searchParams.get('month') ?? String(now.getMonth() + 1).padStart(2, '0');
  const year = searchParams.get('year') ?? String(now.getFullYear());
  const status = searchParams.get('status') ?? '';
  const unassigned = searchParams.get('unassigned') === 'true';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const searchParam = searchParams.get('search') ?? '';

  // Local debounced search state
  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sheet states
  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [assigningExpense, setAssigningExpense] = useState<Expense | null>(null);

  const deleteExpense = useDeleteExpense(groupId);

  const { data, isLoading } = useExpenses(groupId, {
    month,
    year,
    status: status || undefined,
    unassigned: unassigned || undefined,
    search: searchParam || undefined,
    page,
    limit: 20,
  });

  function setParam(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page'); // reset page on filter change
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParam({ search: value });
    }, 300);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  }, []);

  const handleAssign = useCallback((expense: Expense) => {
    setAssigningExpense(expense);
    setAssignOpen(true);
  }, []);

  const handleDelete = useCallback((expense: Expense) => {
    if (!confirm(`¿Eliminar "${expense.description}"?`)) return;
    deleteExpense.mutate(expense.id);
  }, [deleteExpense]);

  const selectClass =
    'bg-surface-container-lowest border-none rounded-lg text-sm font-medium py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer transition-all duration-200 text-on-surface';

  return (
    <>
      {/* Expense form sheet */}
      <ExpenseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingExpense(null); }}
        groupId={groupId}
        expense={editingExpense}
      />

      {/* Assignment editor sheet */}
      <AssignmentEditor
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssigningExpense(null); }}
        groupId={groupId}
        expense={assigningExpense}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight font-headline text-on-surface">Gastos</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Registro y clasificación de gastos compartidos
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingExpense(null); setFormOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-widest self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo gasto
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[220px] relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar gastos, comercios..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline/60 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month */}
            <select
              value={month}
              onChange={(e) => setParam({ month: e.target.value })}
              aria-label="Mes"
              className={selectClass}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={year}
              onChange={(e) => setParam({ year: e.target.value })}
              aria-label="Año"
              className={selectClass}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setParam({ status: e.target.value })}
              aria-label="Estado"
              className={selectClass}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Unassigned toggle */}
            <button
              type="button"
              onClick={() => setParam({ unassigned: unassigned ? '' : 'true' })}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-widest border ${
                unassigned
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border-transparent hover:border-outline-variant'
              }`}
            >
              Sin asignar
            </button>
          </div>
        </div>

        {/* Table */}
        <ExpenseTable
          data={data}
          isLoading={isLoading}
          page={page}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onAssign={handleAssign}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-32 bg-surface-container rounded animate-pulse" />
          <div className="h-14 bg-surface-container-low rounded-xl animate-pulse" />
          <div className="h-64 bg-surface-container-lowest rounded-xl animate-pulse" />
        </div>
      }
    >
      <ExpensesContent />
    </Suspense>
  );
}
