import { apiClient } from './client';
import type { Expense, Assignment, Account, Member, Category, PaginatedResponse } from '@/types/api.types';

type CollectionResponse<T> = T[] | { data?: T[] };

function unwrapCollection<T>(payload: CollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
}

export interface ExpenseFilters {
  month?: string;
  year?: string;
  search?: string;
  status?: string;
  unassigned?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  date: string;
  source: string;
  accountId?: string;
  categoryId?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

function buildParams(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  return params.toString();
}

export const expensesApi = {
  getExpenses(groupId: string, filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    return apiClient
      .get<PaginatedResponse<Expense>>(`/groups/${groupId}/expenses?${buildParams(filters)}`)
      .then((r) => r.data);
  },

  createExpense(groupId: string, body: CreateExpenseDto): Promise<Expense> {
    return apiClient.post<Expense>(`/groups/${groupId}/expenses`, body).then((r) => r.data);
  },

  updateExpense(groupId: string, expenseId: string, body: UpdateExpenseDto): Promise<Expense> {
    return apiClient
      .patch<Expense>(`/groups/${groupId}/expenses/${expenseId}`, body)
      .then((r) => r.data);
  },

  deleteExpense(groupId: string, expenseId: string): Promise<void> {
    return apiClient.delete(`/groups/${groupId}/expenses/${expenseId}`).then(() => undefined);
  },

  assignExpense(
    groupId: string,
    expenseId: string,
    assignments: { memberId: string; percentage: number }[],
  ): Promise<Assignment[]> {
    return apiClient
      .put<Assignment[]>(`/groups/${groupId}/expenses/${expenseId}/assignments`, { assignments })
      .then((r) => r.data);
  },

  // ── Group resources needed by the form ────────────────────────────────────
  getAccounts(groupId: string): Promise<Account[]> {
    return apiClient
      .get<CollectionResponse<Account>>(`/groups/${groupId}/accounts`)
      .then((r) => unwrapCollection(r.data));
  },

  getMembers(groupId: string): Promise<Member[]> {
    return apiClient
      .get<CollectionResponse<Member>>(`/groups/${groupId}/members`)
      .then((r) => unwrapCollection(r.data));
  },

  getCategories(groupId: string): Promise<Category[]> {
    return apiClient
      .get<CollectionResponse<Category>>(`/groups/${groupId}/categories`)
      .then((r) => unwrapCollection(r.data));
  },
};
