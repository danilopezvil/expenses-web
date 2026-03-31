import { apiClient } from './client';
import type { Account } from '@/types/api.types';

export interface CreateAccountDto {
  name: string;
  holder?: string;
  type?: string;
  currency?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}

export const accountsApi = {
  getAccounts(groupId: string): Promise<Account[]> {
    return apiClient.get<Account[]>(`/groups/${groupId}/accounts`).then((r) => r.data);
  },

  createAccount(groupId: string, body: CreateAccountDto): Promise<Account> {
    return apiClient.post<Account>(`/groups/${groupId}/accounts`, body).then((r) => r.data);
  },

  updateAccount(groupId: string, accountId: string, body: UpdateAccountDto): Promise<Account> {
    return apiClient
      .patch<Account>(`/groups/${groupId}/accounts/${accountId}`, body)
      .then((r) => r.data);
  },

  deleteAccount(groupId: string, accountId: string): Promise<void> {
    return apiClient.delete(`/groups/${groupId}/accounts/${accountId}`).then(() => undefined);
  },
};
