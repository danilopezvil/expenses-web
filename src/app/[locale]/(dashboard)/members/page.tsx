'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGroupStore } from '@/lib/stores/group.store';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '@/lib/queries/use-members';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import type { Member } from '@/types/api.types';

const PRESET_COLORS = [
  '#bc000a', '#00647f', '#aa352b', '#6366f1', '#0f766e', '#b45309', '#1c1b1b', '#7c3aed',
];

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  color: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Admin',
  MEMBER: 'Miembro',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ── Member form sheet ──────────────────────────────────────────────────────
function MemberSheet({
  open,
  onClose,
  groupId,
  member,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  member: Member | null;
}) {
  const isEditing = Boolean(member);
  const createMember = useCreateMember(groupId);
  const updateMember = useUpdateMember(groupId);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { color: '#bc000a' },
    });

  const watchedName = watch('name') ?? '';
  const watchedColor = watch('color') ?? '#bc000a';

  // Sync form when member changes
  useState(() => {
    if (open) {
      reset(member ? { name: member.name, color: member.color ?? '#bc000a' } : { name: '', color: '#bc000a' });
    }
  });

  function onSubmit(data: FormData) {
    if (isEditing && member) {
      updateMember.mutate({ memberId: member.id, body: data }, { onSuccess: onClose });
    } else {
      createMember.mutate(data, { onSuccess: onClose });
    }
  }

  const isPending = createMember.isPending || updateMember.isPending;
  const serverError = createMember.error || updateMember.error
    ? 'No se pudo guardar el miembro. Intenta de nuevo.'
    : null;

  const fieldClass = 'w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none text-sm';
  const labelClass = 'block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="w-full max-w-md p-0 flex flex-col gap-0">
        <SheetTitle className="sr-only">{isEditing ? 'Editar miembro' : 'Agregar miembro'}</SheetTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
              {isEditing ? 'Editar miembro' : 'Agregar miembro'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isEditing ? 'Modifica el nombre o color del miembro.' : 'Agrega una persona al grupo compartido.'}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-6" noValidate>
          {/* Preview */}
          <div className="p-5 bg-surface-container-low rounded-xl flex items-center gap-4 border border-outline-variant/20">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-headline text-xl font-bold shrink-0"
              style={{ backgroundColor: watchedColor }}
            >
              {watchedName ? getInitials(watchedName) : '??'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Vista previa</p>
              <p className="font-headline font-bold text-on-surface">{watchedName || 'Nombre del miembro'}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="m-name" className={labelClass}>Nombre completo *</label>
            <input id="m-name" type="text" placeholder="Ej. Carlos Mendoza" {...register('name')} className={fieldClass} />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
          </div>

          {/* Color presets */}
          <div>
            <label className={labelClass}>Color asignado</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-9 h-9 rounded-lg transition-all ${watchedColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
              {/* Custom color picker */}
              <label className="w-9 h-9 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary transition-colors" aria-label="Color personalizado">
                <input type="color" {...register('color')} className="sr-only" />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </label>
            </div>
          </div>

          {serverError && (
            <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">{serverError}</div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-outline-variant/30 bg-surface-container-low/30 flex flex-col gap-2">
          <button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending}
            className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? 'Guardando...' : 'Guardar miembro'}
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
export default function MembersPage() {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const groupId = activeGroup?.id ?? '';
  const { data: members = [], isLoading } = useMembers(groupId);
  const deleteMember = useDeleteMember(groupId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  function handleEdit(member: Member) {
    setEditingMember(member);
    setSheetOpen(true);
  }

  function handleDelete(member: Member) {
    if (!confirm(`¿Desactivar a "${member.name}"?\nDejará de aparecer en las asignaciones.`)) return;
    deleteMember.mutate(member.id);
  }

  return (
    <>
      <MemberSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingMember(null); }}
        groupId={groupId}
        member={editingMember}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight font-headline text-on-surface">Miembros</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Gestiona los participantes del grupo compartido.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingMember(null); setSheetOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-widest self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Agregar miembro
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-xl animate-pulse">
              <div className="w-14 h-14 bg-surface-container rounded-lg mb-4" />
              <div className="h-4 w-28 bg-surface-container rounded mb-2" />
              <div className="h-3 w-16 bg-surface-container rounded" />
            </div>
          ))}

          {!isLoading && members.map((member) => (
            <div
              key={member.id}
              className="bg-surface-container-lowest p-6 rounded-xl flex flex-col relative group transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-headline text-xl font-bold shrink-0"
                  style={{ backgroundColor: member.color ?? '#bc000a' }}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(member)}
                    className="text-xs font-bold text-primary uppercase tracking-tighter hover:underline"
                  >
                    Editar
                  </button>
                  <span className="text-outline-variant">/</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter hover:text-error transition-colors"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">{member.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              </div>
              {member.email && (
                <p className="text-xs text-on-surface-variant mt-3 truncate">{member.email}</p>
              )}
            </div>
          ))}

          {/* Add card */}
          {!isLoading && (
            <button
              type="button"
              onClick={() => { setEditingMember(null); setSheetOpen(true); }}
              className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-headline font-bold text-sm">Nuevo miembro</span>
            </button>
          )}

          {!isLoading && members.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm text-on-surface-variant">
              No hay miembros en este grupo todavía.
            </div>
          )}
        </div>

        {/* Info banner */}
        {members.length > 0 && (
          <div className="p-5 bg-tertiary/5 rounded-xl border-l-4 border-tertiary flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-tertiary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-on-surface-variant">
              Por defecto, todos los miembros activos participan por partes iguales en los gastos compartidos.
              Puedes ajustar el porcentaje al asignar cada gasto individual.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
