'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGroup } from '@/lib/queries/use-groups';

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  currency: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const CURRENCIES = [
  { value: 'USD', label: 'USD — Dólar estadounidense' },
  { value: 'ARS', label: 'ARS — Peso argentino' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'BRL', label: 'BRL — Real brasileño' },
  { value: 'CLP', label: 'CLP — Peso chileno' },
  { value: 'COP', label: 'COP — Peso colombiano' },
  { value: 'MXN', label: 'MXN — Peso mexicano' },
];

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateGroupDialog({ open, onClose }: CreateGroupDialogProps) {
  const { mutate: createGroup, isPending, error } = useCreateGroup();
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD' },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) reset({ currency: 'USD' });
  }, [open, reset]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  function onSubmit(data: FormData) {
    createGroup(
      { name: data.name, description: data.description || undefined, currency: data.currency },
      { onSuccess: onClose }
    );
  }

  if (!open) return null;

  const serverError = error
    ? 'No se pudo crear el grupo. Intenta de nuevo.'
    : null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline font-extrabold text-lg tracking-tight text-on-surface">
              Crear grupo
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Los grupos organizan gastos compartidos entre personas.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="group-name"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Nombre <span className="text-error">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              placeholder="Ej: Casa, Viaje a Roma, Oficina..."
              {...register('name')}
              className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none text-sm"
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="group-description"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Descripción <span className="text-on-surface-variant/50 normal-case font-normal">(opcional)</span>
            </label>
            <input
              id="group-description"
              type="text"
              placeholder="Ej: Gastos del departamento compartido"
              {...register('description')}
              className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none text-sm"
            />
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label
              htmlFor="group-currency"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Moneda
            </label>
            <select
              id="group-currency"
              {...register('currency')}
              className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all text-on-surface outline-none text-sm cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all duration-200 uppercase tracking-widest disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creando...' : 'Crear grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
