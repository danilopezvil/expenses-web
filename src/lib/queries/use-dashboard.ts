import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { DashboardResponse, ReconciliationItem } from '@/types/api.types';

export interface DashboardFilters {
  month?: string;
  year?: string;
}

export function useDashboard(groupId: string, filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['dashboard', groupId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.month) params.set('month', filters.month);
      if (filters.year) params.set('year', filters.year);

      const { data } = await apiClient.get<DashboardResponse>(
        `/groups/${groupId}/dashboard?${params.toString()}`
      );
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}

export function useReconciliation(groupId: string, filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['reconciliation', groupId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.month) params.set('month', filters.month);
      if (filters.year) params.set('year', filters.year);

      const { data } = await apiClient.get<ReconciliationItem[]>(
        `/groups/${groupId}/reconciliation?${params.toString()}`
      );
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(groupId),
  });
}
