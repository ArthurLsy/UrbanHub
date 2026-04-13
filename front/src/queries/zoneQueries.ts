import { useQuery } from '@tanstack/react-query'
import { fetchZones, fetchZoneById } from '../services/zoneService'

export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })
}

export const useZoneById = (id: string) => {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => fetchZoneById(id),
  })
}
