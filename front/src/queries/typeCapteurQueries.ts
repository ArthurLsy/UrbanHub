import { useQuery } from '@tanstack/react-query'
import { fetchTypesCapteur, fetchTypeCapteurById } from '../services/typeCapteurService'

export const useTypesCapteur = () => {
  return useQuery({
    queryKey: ['types-capteur'],
    queryFn: fetchTypesCapteur,
  })
}

export const useTypeCapteurById = (id: string) => {
  return useQuery({
    queryKey: ['types-capteur', id],
    queryFn: () => fetchTypeCapteurById(id),
  })
}
