import { apiClient } from './client';
import type { Member } from '@/types/api.types';

export interface CreateMemberDto {
  name: string;
  color?: string;
  userId?: string;
}

export interface UpdateMemberDto {
  name?: string;
  color?: string;
}

export const membersApi = {
  getMembers(groupId: string): Promise<Member[]> {
    return apiClient.get<Member[]>(`/groups/${groupId}/members`).then((r) => r.data);
  },

  createMember(groupId: string, body: CreateMemberDto): Promise<Member> {
    return apiClient.post<Member>(`/groups/${groupId}/members`, body).then((r) => r.data);
  },

  updateMember(groupId: string, memberId: string, body: UpdateMemberDto): Promise<Member> {
    return apiClient
      .patch<Member>(`/groups/${groupId}/members/${memberId}`, body)
      .then((r) => r.data);
  },

  deleteMember(groupId: string, memberId: string): Promise<void> {
    return apiClient.delete(`/groups/${groupId}/members/${memberId}`).then(() => undefined);
  },
};
