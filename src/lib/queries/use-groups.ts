import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/groups.api';
import { useGroupStore } from '@/lib/stores/group.store';

export const GROUPS_KEY = ['groups'] as const;

export function useGroups() {
  return useQuery({
    queryKey: GROUPS_KEY,
    queryFn: groupsApi.getGroups,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { setGroups, setActiveGroup } = useGroupStore();

  return useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: (newGroup) => {
      // Optimistically update the store so the UI reacts immediately
      const current = queryClient.getQueryData<typeof newGroup[]>(GROUPS_KEY) ?? [];
      const updated = [...current, newGroup];
      setGroups(updated);
      setActiveGroup(newGroup);
      // Then invalidate so the list re-fetches in the background
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
    },
  });
}
