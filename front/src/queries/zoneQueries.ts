import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchZones, createZone } from '../services/zoneService'
import type { CreateZonePayload } from '../types'

export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
    retry: false,
  })
}

export const useCreateZone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateZonePayload) => createZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
    },
  })
}
