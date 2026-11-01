// src/hooks/useProspects.js
import { useQuery } from '@tanstack/react-query'
import { getProspects, getProspectDetail, getSummary, getLivePicks, getTeams } from '../api/client'

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

export function useLivePicks(maxPick = 257) {
  return useQuery({
    queryKey: ['livePicks', maxPick],
    queryFn: () => getLivePicks(maxPick),
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: 300_000, // 5 min - team metadata is static
  })
}
