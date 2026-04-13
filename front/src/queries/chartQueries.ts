import { useQuery } from '@tanstack/react-query'
import { fetchChartData } from '../services/chartService'

export const useChartData = () => {
  return useQuery({
    queryKey: ['chart'],
    queryFn: fetchChartData,
  })
}
