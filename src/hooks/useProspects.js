// src/hooks/useProspects.js
import { useQuery } from '@tanstack/react-query'
import { getProspects, getProspectDetail, getSummary } from '../api/client'

export function useProspects(filters = {}) {
  return useQuery({
    queryKey: ['prospects', filters],
    queryFn: () => getProspects(filters),
    staleTime: 60_000, // 1 min — data doesn't change often
  })
}

export function useProspectDetail(id) {
  return useQuery({
    queryKey: ['prospect', id],
    queryFn: () => getProspectDetail(id),
    enabled: id != null,
  })
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: getSummary,
    staleTime: 120_000,
  })
}
