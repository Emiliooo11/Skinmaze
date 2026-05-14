'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Case, CaseOpenResult } from '@skinmaze/shared'

export function useCases() {
  return useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => api.get('/cases').then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useCase(id: string) {
  return useQuery<Case>({
    queryKey: ['cases', id],
    queryFn: () => api.get(`/cases/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useOpenCase() {
  const queryClient = useQueryClient()

  return useMutation<CaseOpenResult, Error, string>({
    mutationFn: (caseId) => api.post(`/cases/${caseId}/open`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useGlobalFeed() {
  return useQuery({
    queryKey: ['cases', 'feed'],
    queryFn: () => api.get('/cases/feed').then((r) => r.data),
    refetchInterval: 8_000,
    staleTime: 0,
  })
}
