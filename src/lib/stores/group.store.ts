import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Group } from '@/types/api.types';

interface GroupState {
  activeGroup: Group | null;
  /** Persisted ID used to restore activeGroup once the groups list is fetched.
   *  Also handles migration from the old localStorage format. */
  activeGroupId: string | null;
  groups: Group[];
}

interface GroupActions {
  setGroups: (groups: Group[]) => void;
  setActiveGroup: (group: Group) => void;
}

type GroupStore = GroupState & GroupActions;

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      activeGroup: null,
      activeGroupId: null,
      groups: [],

      setGroups: (groups) => {
        const { activeGroup, activeGroupId } = get();
        const targetId = activeGroup?.id ?? activeGroupId ?? null;
        const resolved = targetId
          ? (groups.find((g) => g.id === targetId) ?? groups[0] ?? null)
          : (groups[0] ?? null);
        set({ groups, activeGroup: resolved });
      },

      setActiveGroup: (group) => set({ activeGroup: group, activeGroupId: group.id }),
    }),
    {
      name: 'expenses-group',
      storage: createJSONStorage(() => localStorage),
      // Persist only the ID. Default merge spreads it into state so
      // activeGroupId is available in setGroups before groups are fetched.
      // This is also backwards-compatible with the old { activeGroupId } format.
      partialize: (state) => ({
        activeGroupId: state.activeGroup?.id ?? state.activeGroupId ?? null,
      }),
    }
  )
);
