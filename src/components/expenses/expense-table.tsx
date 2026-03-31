'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Expense, PaginatedResponse } from '@/types/api.types';

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  PENDING:  { dot: 'bg-amber-400',  text: 'text-amber-700',  label: 'Pendiente' },
  ASSIGNED: { dot: 'bg-green-500',  text: 'text-green-700',  label: 'Asignado'  },
  VOIDED:   { dot: 'bg-slate-400',  text: 'text-slate-500',  label: 'Anulado'   },
  IMPORTED: { dot: 'bg-blue-400',   text: 'text-blue-700',   label: 'Importado' },
  CLASSIFIED: { dot: 'bg-purple-400', text: 'text-purple-700', label: 'Clasificado' },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'dd/MMM', { locale: es });
  } catch {
    return dateStr;
  }
}

function truncate(str: string, max = 40) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

interface ExpenseTableProps {
  data: PaginatedResponse<Expense> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (expense: Expense) => void;
  onAssign: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseTable({
  data,
  isLoading,
  page,
  onPageChange,
  onEdit,
  onAssign,
  onDelete,
}: ExpenseTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const expenses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const allChecked = expenses.length > 0 && expenses.every((e) => selected.has(e.id));

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(expenses.map((e) => e.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              <th className="py-4 px-5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="rounded accent-primary cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 whitespace-nowrap">Fecha</th>
              <th className="py-4 px-4">Descripción</th>
              <th className="py-4 px-4">Cuenta</th>
              <th className="py-4 px-4 text-right whitespace-nowrap">Monto</th>
              <th className="py-4 px-4">Categoría</th>
              <th className="py-4 px-4">Estado</th>
              <th className="py-4 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {isLoading && (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-5 px-5"><div className="w-4 h-4 bg-surface-container rounded mx-auto" /></td>
                  <td className="py-5 px-4"><div className="h-3 w-14 bg-surface-container rounded" /></td>
                  <td className="py-5 px-4"><div className="h-3 w-40 bg-surface-container rounded" /></td>
                  <td className="py-5 px-4"><div className="h-3 w-16 bg-surface-container rounded" /></td>
                  <td className="py-5 px-4 text-right"><div className="h-3 w-16 bg-surface-container rounded ml-auto" /></td>
                  <td className="py-5 px-4"><div className="h-3 w-20 bg-surface-container rounded" /></td>
                  <td className="py-5 px-4"><div className="h-5 w-20 bg-surface-container rounded-full" /></td>
                  <td className="py-5 px-5" />
                </tr>
              ))
            )}

            {!isLoading && expenses.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-on-surface-variant">
                  Sin gastos para los filtros seleccionados.
                </td>
              </tr>
            )}

            {!isLoading && expenses.map((expense) => {
              const status = STATUS_STYLES[expense.status] ?? STATUS_STYLES.PENDING;
              const isChecked = selected.has(expense.id);
              return (
                <tr
                  key={expense.id}
                  onClick={() => onEdit(expense)}
                  className="hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <td
                    className="py-5 px-5 text-center"
                    onClick={(e) => { e.stopPropagation(); toggleOne(expense.id); }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(expense.id)}
                      className="rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-5 px-4 text-sm font-medium text-on-surface-variant whitespace-nowrap">
                    {expense.date ? formatDate(expense.date) : '—'}
                  </td>
                  <td className="py-5 px-4 font-headline font-bold text-on-surface">
                    <span title={expense.description}>{truncate(expense.description)}</span>
                  </td>
                  <td className="py-5 px-4">
                    {expense.accountId ? (
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-xs font-bold rounded-full">
                        {expense.accountId.slice(0, 8)}
                      </span>
                    ) : (
                      <span className="text-outline/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-5 px-4 text-right font-headline font-extrabold text-on-surface whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="py-5 px-4 text-sm text-on-surface-variant">
                    {expense.categoryId ? (
                      <span className="text-xs text-on-surface-variant">Cat.</span>
                    ) : (
                      <span className="text-outline/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${status.dot} shrink-0`} />
                      <span className={`text-xs font-bold ${status.text}`}>{status.label}</span>
                    </div>
                  </td>
                  <td
                    className="py-5 px-5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                          aria-label="Acciones"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[140px]">
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssign(expense)}>
                          Asignar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(expense)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="px-6 py-4 bg-on-surface text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
              {selected.size} seleccionados
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex gap-4">
              <button type="button" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-tighter flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                Agrupar
              </button>
              <button type="button" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-tighter flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Asignar
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs font-bold hover:text-error transition-colors uppercase tracking-tighter flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
          Página {page} de {totalPages} · {total} gastos
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant bg-surface-container-high rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 text-xs font-bold text-white bg-on-surface rounded-lg hover:bg-on-surface/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
