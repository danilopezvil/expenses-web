import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi, type CreateMemberDto, type UpdateMemberDto } from '@/lib/api/members.api';

const key = (groupId: string) => ['members', groupId] as const;

export function useMembers(groupId: string) {
  return useQuery({
    queryKey: key(groupId),
    queryFn: () => membersApi.getMembers(groupId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useCreateMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMemberDto) => membersApi.createMember(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}

export function useUpdateMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: string; body: UpdateMemberDto }) =>
      membersApi.updateMember(groupId, memberId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}

export function useDeleteMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => membersApi.deleteMember(groupId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}
