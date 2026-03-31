'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGroupStore } from '@/lib/stores/group.store';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/lib/queries/use-accounts';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import type { Account } from '@/types/api.types';

// ── Types ────────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
  { value: 'CREDIT_CARD',    label: 'Tarjeta de crédito',   badge: 'bg-blue-50 text-blue-700' },
  { value: 'DEBIT',          label: 'Débito',               badge: 'bg-purple-50 text-purple-700' },
  { value: 'CASH',           label: 'Efectivo',             badge: 'bg-emerald-50 text-emerald-700' },
  { value: 'TRANSFER',       label: 'Transferencia',        badge: 'bg-sky-50 text-sky-700' },
  { value: 'DIGITAL_WALLET', label: 'Billetera digital',    badge: 'bg-amber-50 text-amber-700' },
  { value: 'SHARED',         label: 'Compartida',           badge: 'bg-rose-50 text-rose-700' },
];

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP', 'COP', 'MXN', 'GBP'];

function typeInfo(type?: string) {
  return ACCOUNT_TYPES.find((t) => t.value === type) ?? ACCOUNT_TYPES[0];
}

// ── Account type icon ─────────────────────────────────────────────────────────
function AccountIcon({ type }: { type?: string }) {
  const icons: Record<string, JSX.Element> = {
    CREDIT_CARD: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    DEBIT: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
    CASH: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    DIGITAL_WALLET: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    SHARED: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };
  return icons[type ?? ''] ?? icons.CASH;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  holder: z.string().optional(),
  type: z.string().min(1),
  currency: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

// ── Account form sheet ────────────────────────────────────────────────────────
function AccountSheet({
  open,
  onClose,
  groupId,
  account,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  account: Account | null;
}) {
  const isEditing = Boolean(account);
  const createAccount = useCreateAccount(groupId);
  const updateAccount = useUpdateAccount(groupId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'CREDIT_CARD', currency: 'USD' },
  });

  useEffect(() => {
    if (open) {
      reset(
        account
          ? { name: account.name, holder: '', type: account.type ?? 'CREDIT_CARD', currency: account.currency ?? 'USD' }
          : { name: '', holder: '', type: 'CREDIT_CARD', currency: 'USD' },
      );
    }
  }, [open, account, reset]);

  function onSubmit(data: FormData) {
    const body = { ...data, holder: data.holder || undefined };
    if (isEditing && account) {
      updateAccount.mutate({ accountId: account.id, body }, { onSuccess: onClose });
    } else {
      createAccount.mutate(body, { onSuccess: onClose });
    }
  }

  const isPending = createAccount.isPending || updateAccount.isPending;
  const serverError = createAccount.error || updateAccount.error
    ? 'No se pudo guardar la cuenta. Intenta de nuevo.'
    : null;

  const fieldClass = 'w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none text-sm';
  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-md p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">{isEditing ? 'Editar cuenta' : 'Nueva cuenta'}</SheetTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
              {isEditing ? 'Editar cuenta' : 'Nueva cuenta'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Registra una entidad financiera en el ledger compartido.
            </p>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-5" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="ac-name" className={labelClass}>Nombre de cuenta *</label>
            <input id="ac-name" type="text" placeholder="Ej. Tarjeta Corporativa Platinum" {...register('name')} className={fieldClass} />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
          </div>

          {/* Holder */}
          <div>
            <label htmlFor="ac-holder" className={labelClass}>Titular <span className="normal-case font-normal text-on-surface-variant/50">(opcional)</span></label>
            <input id="ac-holder" type="text" placeholder="Nombre del titular" {...register('holder')} className={fieldClass} />
          </div>

          {/* Type + Currency row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ac-type" className={labelClass}>Tipo de cuenta</label>
              <select id="ac-type" {...register('type')} className={fieldClass}>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ac-currency" className={labelClass}>Moneda</label>
              <select id="ac-currency" {...register('currency')} className={fieldClass}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info note */}
          <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-primary/20 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Las cuentas de tipo <strong>Compartida</strong> son visibles para todos los miembros del grupo.
            </p>
          </div>

          {serverError && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{serverError}</div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-outline-variant/30 bg-surface-container-low/30 flex flex-col gap-2">
          <button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? 'Guardando...' : 'Guardar cuenta'}
          </button>
          <button type="button" onClick={onClose}
            className="w-full py-3 text-on-surface-variant font-bold text-sm rounded-lg hover:bg-surface-container transition-all uppercase tracking-widest">
            Cancelar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const groupId = activeGroup?.id ?? '';
  const { data: accounts = [], isLoading } = useAccounts(groupId);
  const deleteAccount = useDeleteAccount(groupId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  function handleEdit(account: Account) {
    setEditingAccount(account);
    setSheetOpen(true);
  }

  function handleDelete(account: Account) {
    if (!confirm(`¿Eliminar la cuenta "${account.name}"?`)) return;
    deleteAccount.mutate(account.id);
  }

  return (
    <>
      <AccountSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingAccount(null); }}
        groupId={groupId}
        account={editingAccount}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight font-headline text-on-surface">Cuentas</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Gestiona las entidades financieras del grupo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingAccount(null); setSheetOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-widest self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar cuenta
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-surface-container rounded-lg mb-6" />
              <div className="h-4 w-32 bg-surface-container rounded mb-2" />
              <div className="h-3 w-24 bg-surface-container rounded" />
            </div>
          ))}

          {!isLoading && accounts.map((account) => {
            const info = typeInfo(account.type);
            return (
              <div
                key={account.id}
                className="group relative bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-all hover:-translate-y-0.5"
              >
                {/* Actions — visible on hover */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(account)}
                    className="text-xs font-bold text-primary uppercase tracking-tighter hover:underline"
                  >
                    Editar
                  </button>
                  <span className="text-outline-variant">/</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(account)}
                    className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter hover:text-error transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary">
                    <AccountIcon type={account.type} />
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded uppercase ${info.badge}`}>
                    {info.label}
                  </span>
                </div>

                <h3 className="text-xl font-headline font-extrabold text-on-surface mb-1">{account.name}</h3>
                <p className="text-sm text-on-surface-variant font-medium mb-6">
                  {account.currency ?? 'USD'}
                </p>
              </div>
            );
          })}

          {/* Add card */}
          {!isLoading && (
            <button
              type="button"
              onClick={() => { setEditingAccount(null); setSheetOpen(true); }}
              className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all group min-h-[160px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-headline font-bold text-sm">Nueva cuenta</span>
            </button>
          )}

          {!isLoading && accounts.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm text-on-surface-variant">
              No hay cuentas registradas en este grupo todavía.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
