import { apiClient } from './client';
import type { Group } from '@/types/api.types';

interface CreateGroupDto {
  name: string;
  description?: string;
  currency?: string;
}

interface UpdateGroupDto {
  name?: string;
  description?: string;
  currency?: string;
}

export const groupsApi = {
  getGroups(): Promise<Group[]> {
    return apiClient.get<Group[]>('/groups').then((r) => r.data);
  },

  createGroup(body: CreateGroupDto): Promise<Group> {
    return apiClient.post<Group>('/groups', body).then((r) => r.data);
  },

  getGroup(groupId: string): Promise<Group> {
    return apiClient.get<Group>(`/groups/${groupId}`).then((r) => r.data);
  },

  updateGroup(groupId: string, body: UpdateGroupDto): Promise<Group> {
    return apiClient.patch<Group>(`/groups/${groupId}`, body).then((r) => r.data);
  },

  deleteGroup(groupId: string): Promise<void> {
    return apiClient.delete(`/groups/${groupId}`).then(() => undefined);
  },
};
