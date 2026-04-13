import { useQuery } from '@tanstack/react-query'
import { fetchMesures, fetchMesureById } from '../services/mesureService'

export const useMesures = () => {
  return useQuery({
    queryKey: ['mesures'],
    queryFn: fetchMesures,
  })
}

export const useMesureById = (id: string) => {
  return useQuery({
    queryKey: ['mesures', id],
    queryFn: () => fetchMesureById(id),
  })
}
