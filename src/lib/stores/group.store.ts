import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Group } from '@/types/api.types';

interface GroupState {
  activeGroup: Group | null;
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
      groups: [],

      setGroups: (groups) => {
        const { activeGroup } = get();
        // Keep activeGroup in sync if it's in the new list
        const synced = activeGroup
          ? (groups.find((g) => g.id === activeGroup.id) ?? activeGroup)
          : null;
        set({ groups, activeGroup: synced });
      },

      setActiveGroup: (group) => set({ activeGroup: group }),
    }),
    {
      name: 'expenses-group',
      storage: createJSONStorage(() => localStorage),
      // Only persist the active group id — rehydrate the full object from the groups list
      partialize: (state) => ({
        activeGroupId: state.activeGroup?.id ?? null,
      }),
      merge: (persisted, current) => {
        const { activeGroupId } = persisted as { activeGroupId: string | null };
        return {
          ...current,
          activeGroup: activeGroupId
            ? (current.groups.find((g) => g.id === activeGroupId) ?? null)
            : null,
        };
      },
    }
  )
);
