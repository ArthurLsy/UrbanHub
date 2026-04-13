import { useQuery } from '@tanstack/react-query'
import { fetchCapteurs, fetchCapteurById } from '../services/capteurService'

export const useCapteurs = () => {
  return useQuery({
    queryKey: ['capteurs'],
    queryFn: fetchCapteurs,
  })
}

export const useCapteurById = (id: string) => {
  return useQuery({
    queryKey: ['capteurs', id],
    queryFn: () => fetchCapteurById(id),
  })
}
