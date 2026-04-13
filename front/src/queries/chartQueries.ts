import { useQuery } from '@tanstack/react-query'
import { fetchMesures } from '../services/chartService'

export const useMesures = () => {
  return useQuery({
    queryKey: ['mesures'],
    queryFn: fetchMesures,
  })
}
