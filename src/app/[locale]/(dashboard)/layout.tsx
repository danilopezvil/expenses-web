'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useGroupStore } from '@/lib/stores/group.store';
import { apiClient } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth.api';
import type { Group } from '@/types/api.types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from '@/components/layout/sidebar';
import { CreateGroupDialog } from '@/components/groups/create-group-dialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'es';
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { setGroups, groups, activeGroup } = useGroupStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  // _hydrated is set inside onRehydrateStorage, so it always updates in the
  // same store batch as `user` — no race condition between the two.
  const hydrated = useAuthStore((s) => s._hydrated);
  const [restoringSession, setRestoringSession] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (user === null && !restoringSession) {
      clearAuth();
      router.replace(`/${locale}/login`);
    }
  }, [hydrated, user, router, clearAuth, locale, restoringSession]);

  useEffect(() => {
    if (!hydrated || user !== null || accessToken) return;

    setRestoringSession(true);
    authApi
      .refresh()
      .then((res) => setAuth(res.user, res.accessToken))
      .catch(() => {
        clearAuth();
        router.replace(`/${locale}/login`);
      })
      .finally(() => setRestoringSession(false));
  }, [hydrated, user, accessToken, setAuth, clearAuth, router, locale]);

  // Fetch groups once authenticated
  useEffect(() => {
    if (!user || restoringSession) return;
    apiClient
      .get<Group[]>('/groups')
      .then((res) => setGroups(res.data))
      .catch(() => {/* silently ignore */});
  }, [user, restoringSession, setGroups]);

  if (!hydrated || restoringSession) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user === null) return null;

  const showOnboarding = groups.length === 0;

  return (
    <>
      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />

      <div className="flex min-h-screen bg-surface text-on-surface overflow-x-hidden">
        {/* ── Desktop Sidebar ───────────────────────────────────────── */}
        <aside className="hidden md:flex w-[240px] h-screen sticky top-0 left-0 flex-col bg-surface border-r border-outline-variant/30 shrink-0">
          <SidebarContent onCreateGroup={() => setCreateGroupOpen(true)} />
        </aside>

        {/* ── Mobile: Sheet ─────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-center border border-outline-variant/30"
              aria-label="Abrir menú"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-on-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0 bg-surface border-outline-variant/30">
            <SidebarContent
              onClose={() => setSheetOpen(false)}
              onCreateGroup={() => { setSheetOpen(false); setCreateGroupOpen(true); }}
            />
          </SheetContent>
        </Sheet>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 h-16 flex items-center px-6 md:px-8 gap-4">
            <div className="w-10 md:hidden shrink-0" />
            <h2 className="font-headline font-bold text-lg tracking-tight text-on-surface">
              {activeGroup?.name ?? 'GastoCompartido'}
            </h2>
          </header>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {showOnboarding
              ? <OnboardingEmpty onCreateGroup={() => setCreateGroupOpen(true)} />
              : children}
          </div>
        </main>
      </div>
    </>
  );
}

function OnboardingEmpty({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
        Crea tu primer grupo
      </h2>
      <p className="text-on-surface-variant text-sm max-w-xs mb-8">
        Los grupos te permiten compartir y organizar gastos con otras personas.
      </p>
      <button
        type="button"
        onClick={onCreateGroup}
        className="bg-primary text-on-primary font-headline font-bold px-8 py-3 rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-wide text-sm"
      >
        Crear grupo
      </button>
    </div>
  );
}
