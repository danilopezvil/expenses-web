'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useCreateExpense, useUpdateExpense, useGroupAccounts, useGroupCategories } from '@/lib/queries/use-expenses';
import type { Expense } from '@/types/api.types';

const today = new Date().toISOString().split('T')[0];

const schema = z.object({
  description: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .positive('Debe ser mayor a 0')
    .max(999999.99, 'Monto demasiado alto'),
  date: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((d) => d <= today, 'La fecha no puede ser futura'),
  source: z.string().min(1, 'Selecciona un origen'),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SOURCES = [
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'DIGITAL_WALLET', label: 'Billetera digital' },
];

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  expense?: Expense | null;
}

export function ExpenseForm({ open, onClose, groupId, expense }: ExpenseFormProps) {
  const isEditing = Boolean(expense);
  const { data: accounts = [] } = useGroupAccounts(groupId);
  const { data: categories = [] } = useGroupCategories(groupId);
  const createExpense = useCreateExpense(groupId);
  const updateExpense = useUpdateExpense(groupId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'CARD', date: today },
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          description: expense.description,
          amount: expense.amount,
          date: expense.date?.split('T')[0] ?? today,
          source: expense.source,
          accountId: expense.accountId ?? '',
          categoryId: expense.categoryId ?? '',
        });
      } else {
        reset({ source: 'CARD', date: today });
      }
    }
  }, [open, expense, reset]);

  function onSubmit(data: FormData) {
    const body = {
      ...data,
      accountId: data.accountId || undefined,
      categoryId: data.categoryId || undefined,
    };

    if (isEditing && expense) {
      updateExpense.mutate(
        { expenseId: expense.id, body },
        { onSuccess: onClose },
      );
    } else {
      createExpense.mutate(body, { onSuccess: onClose });
    }
  }

  const serverError =
    createExpense.error || updateExpense.error
      ? 'No se pudo guardar el gasto. Intenta de nuevo.'
      : null;

  const fieldClass =
    'w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none text-sm';
  const labelClass =
    'block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-md p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">{isEditing ? 'Editar gasto' : 'Nuevo gasto'}</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
              {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isEditing ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto compartido'}
            </p>
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
          noValidate
        >
          {/* Description */}
          <div>
            <label htmlFor="ef-description" className={labelClass}>Descripción *</label>
            <input
              id="ef-description"
              type="text"
              placeholder="Ej: Supermercado, Netflix..."
              {...register('description')}
              className={fieldClass}
            />
            {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ef-amount" className={labelClass}>Monto *</label>
              <input
                id="ef-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className={fieldClass}
              />
              {errors.amount && <p className="text-xs text-error mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label htmlFor="ef-date" className={labelClass}>Fecha *</label>
              <input
                id="ef-date"
                type="date"
                max={today}
                {...register('date')}
                className={fieldClass}
              />
              {errors.date && <p className="text-xs text-error mt-1">{errors.date.message}</p>}
            </div>
          </div>

          {/* Source */}
          <div>
            <label htmlFor="ef-source" className={labelClass}>Origen *</label>
            <select id="ef-source" {...register('source')} className={fieldClass}>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.source && <p className="text-xs text-error mt-1">{errors.source.message}</p>}
          </div>

          {/* Account */}
          <div>
            <label htmlFor="ef-account" className={labelClass}>Cuenta</label>
            <select id="ef-account" {...register('accountId')} className={fieldClass}>
              <option value="">Sin cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="ef-category" className={labelClass}>Categoría</label>
            <select id="ef-category" {...register('categoryId')} className={fieldClass}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-outline-variant/30 bg-surface-container-low/30 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || createExpense.isPending || updateExpense.isPending}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createExpense.isPending || updateExpense.isPending ? 'Guardando...' : 'Guardar cambios'}
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
