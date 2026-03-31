import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, type ExpenseFilters, type CreateExpenseDto, type UpdateExpenseDto } from '@/lib/api/expenses.api';

// ── Query keys ────────────────────────────────────────────────────────────────
export const expenseKeys = {
  list: (groupId: string, filters: ExpenseFilters) =>
    ['expenses', groupId, filters] as const,
  accounts: (groupId: string) => ['group-accounts', groupId] as const,
  members: (groupId: string) => ['group-members', groupId] as const,
  categories: (groupId: string) => ['group-categories', groupId] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────
export function useExpenses(groupId: string, filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expenseKeys.list(groupId, filters),
    queryFn: () => expensesApi.getExpenses(groupId, filters),
    staleTime: 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useGroupAccounts(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.accounts(groupId),
    queryFn: () => expensesApi.getAccounts(groupId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.members(groupId),
    queryFn: () => expensesApi.getMembers(groupId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useGroupCategories(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.categories(groupId),
    queryFn: () => expensesApi.getCategories(groupId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function useCreateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExpenseDto) => expensesApi.createExpense(groupId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] });
      qc.invalidateQueries({ queryKey: ['dashboard', groupId] });
    },
  });
}

export function useUpdateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, body }: { expenseId: string; body: UpdateExpenseDto }) =>
      expensesApi.updateExpense(groupId, expenseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] });
      qc.invalidateQueries({ queryKey: ['dashboard', groupId] });
    },
  });
}

export function useDeleteExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] });
      qc.invalidateQueries({ queryKey: ['dashboard', groupId] });
    },
  });
}

export function useAssignExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      assignments,
    }: {
      expenseId: string;
      assignments: { memberId: string; percentage: number }[];
    }) => expensesApi.assignExpense(groupId, expenseId, assignments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] });
      qc.invalidateQueries({ queryKey: ['dashboard', groupId] });
    },
  });
}
