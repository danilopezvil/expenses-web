import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi, type CreateAccountDto, type UpdateAccountDto } from '@/lib/api/accounts.api';

const key = (groupId: string) => ['accounts', groupId] as const;

export function useAccounts(groupId: string) {
  return useQuery({
    queryKey: key(groupId),
    queryFn: () => accountsApi.getAccounts(groupId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useCreateAccount(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAccountDto) => accountsApi.createAccount(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}

export function useUpdateAccount(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, body }: { accountId: string; body: UpdateAccountDto }) =>
      accountsApi.updateAccount(groupId, accountId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}

export function useDeleteAccount(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => accountsApi.deleteAccount(groupId, accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(groupId) }),
  });
}
