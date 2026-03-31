'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useGroupMembers, useAssignExpense } from '@/lib/queries/use-expenses';
import { expensesApi } from '@/lib/api/expenses.api';
import type { Expense } from '@/types/api.types';

interface AssignmentEditorProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  expense: Expense | null;
  expenseIds?: string[];
}

export function AssignmentEditor({ open, onClose, groupId, expense, expenseIds = [] }: AssignmentEditorProps) {
  const { data: members = [] } = useGroupMembers(groupId);
  const assignExpense = useAssignExpense(groupId);
  const queryClient = useQueryClient();
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState(false);

  // Reset percentages when expense or members change
  useEffect(() => {
    if (open && members.length > 0) {
      const even = Math.floor(100 / members.length);
      const remainder = 100 - even * members.length;
      const initial: Record<string, number> = {};
      members.forEach((m, i) => {
        initial[m.id] = i === 0 ? even + remainder : even;
      });
      setPercentages(initial);
    }
  }, [open, members]);

  const total = Object.values(percentages).reduce((sum, v) => sum + (v || 0), 0);
  const isValid = total === 100;

  function handleEqual() {
    if (members.length === 0) return;
    const even = Math.floor(100 / members.length);
    const remainder = 100 - even * members.length;
    const next: Record<string, number> = {};
    members.forEach((m, i) => {
      next[m.id] = i === 0 ? even + remainder : even;
    });
    setPercentages(next);
  }

  function handleChange(memberId: string, value: string) {
    const num = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    setPercentages((prev) => ({ ...prev, [memberId]: num }));
  }

  async function handleSave() {
    if ((!expense && expenseIds.length === 0) || !isValid) return;
    const assignments = members.map((m) => ({
      memberId: m.id,
      percentage: percentages[m.id] ?? 0,
    }));
    const targets = expenseIds.length > 0 ? expenseIds : expense ? [expense.id] : [];

    if (targets.length > 1) {
      setBulkError(false);
      setBulkSaving(true);
      try {
        await Promise.all(targets.map((expenseId) => expensesApi.assignExpense(groupId, expenseId, assignments)));
        await queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
        onClose();
      } catch {
        setBulkError(true);
      } finally {
        setBulkSaving(false);
      }
      return;
    }

    if (!expense) return;
    assignExpense.mutate({ expenseId: expense.id, assignments }, { onSuccess: onClose });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-md p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">Asignación de miembros</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
              Asignación de miembros
            </h2>
            {expense && (
              <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[260px]">
                {expense.description}
              </p>
            )}
            {!expense && expenseIds.length > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[260px]">
                {expenseIds.length} gastos seleccionados
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Preset button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">Asigna el % a cada miembro del grupo.</p>
            <button
              type="button"
              onClick={handleEqual}
              className="text-xs font-bold text-primary hover:underline transition-all"
            >
              Igual entre todos
            </button>
          </div>

          {/* Member list */}
          <div className="space-y-2">
            {members.length === 0 && (
              <p className="text-sm text-on-surface-variant italic text-center py-8">
                No hay miembros en este grupo.
              </p>
            )}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{member.name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    aria-label={`Porcentaje para ${member.name}`}
                    value={percentages[member.id] ?? 0}
                    onChange={(e) => handleChange(member.id, e.target.value)}
                    className="w-16 h-9 bg-surface-container-high border-none rounded-lg text-right font-bold text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-on-surface px-2"
                  />
                  <span className="text-on-surface-variant font-bold text-sm">%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total counter */}
          <div
            className={`p-4 rounded-lg flex items-center justify-between ${
              isValid
                ? 'bg-tertiary/10 text-tertiary'
                : total > 100
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            <div className="flex items-center gap-2">
              {isValid ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span className="text-sm font-bold uppercase tracking-widest">
                {isValid ? 'Asignación válida' : total > 100 ? 'Supera el 100%' : `Faltan ${100 - total}%`}
              </span>
            </div>
            <p className="text-xl font-black">Total: {total}%</p>
          </div>

          {/* Server error */}
          {(assignExpense.error || bulkError) && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
              No se pudo guardar la asignación. Intenta de nuevo.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-outline-variant/30 bg-surface-container-low/30 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid || assignExpense.isPending || bulkSaving}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {assignExpense.isPending || bulkSaving ? 'Guardando...' : 'Guardar asignación'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-on-surface-variant font-bold text-sm rounded-lg hover:bg-surface-container transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
